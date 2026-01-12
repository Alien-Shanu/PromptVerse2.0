import { GoogleGenAI } from "@google/genai";
import { GenerationResult, PromptCategory } from "../types";

let runtimeApiKey: string | null = null;
const rateLimitUntilByModel = new Map<string, number>();

export const setUserApiKey = (apiKey: string | null) => {
  runtimeApiKey = apiKey && apiKey.trim() ? apiKey.trim() : null;
  window.dispatchEvent(new Event('pv:apiKeyChanged'));
};

export const hasUserApiKey = () => !!runtimeApiKey;

export const clearUserApiKey = () => {
  runtimeApiKey = null;
  window.dispatchEvent(new Event('pv:apiKeyChanged'));
};

const getEffectiveApiKey = () => runtimeApiKey || process.env.API_KEY;

const getRetryAfterMs = (err: any): number | null => {
  const raw =
    (typeof err?.message === 'string' ? err.message : '') +
    ' ' +
    (typeof err?.toString === 'function' ? String(err) : '');

  const retryInfo = err?.error?.details?.find?.((d: any) => d?.['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
  const retryDelay = typeof retryInfo?.retryDelay === 'string' ? retryInfo.retryDelay : null;
  if (retryDelay) {
    const m = retryDelay.match(/^(\d+)(?:\.\d+)?s$/);
    if (m) return Number(m[1]) * 1000;
  }

  const m1 = raw.match(/Please retry in\s+([0-9.]+)s/i);
  if (m1) return Math.max(0, Math.floor(Number(m1[1]) * 1000));

  const m2 = raw.match(/"retryDelay"\s*:\s*"(\d+)(?:\.\d+)?s"/i);
  if (m2) return Number(m2[1]) * 1000;

  return null;
};

const getErrCode = (err: any): number | null => {
  const direct = err?.code ?? err?.error?.code;
  if (Number.isFinite(direct)) return Number(direct);
  const status = err?.status ?? err?.error?.status;
  if (status === 'RESOURCE_EXHAUSTED') return 429;
  return null;
};

export const runPrompt = async (
  promptText: string, 
  category: PromptCategory,
  specificModel?: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<GenerationResult> => {
  const apiKey = getEffectiveApiKey();
  if (!apiKey) {
    return { error: "API Key is missing. Please add your Gemini API key." };
  }

  let model = specificModel;
  if (!model) {
    if (category === PromptCategory.IMAGE || category === PromptCategory.GEN_3D || category === PromptCategory.CARTOON) {
      model = 'gemini-2.5-flash-image';
    } else if (category === PromptCategory.VIDEO) {
      model = 'veo-3.1-fast-generate-preview';
    } else {
      model = 'gemini-3-flash-preview';
    }
  }

  const rateLimitUntil = rateLimitUntilByModel.get(model) || 0;
  if (Date.now() < rateLimitUntil) {
    const waitMs = rateLimitUntil - Date.now();
    return { error: `Rate limited. Please retry in ${Math.ceil(waitMs / 1000)}s.` };
  }

  try {
    // Create new instance for every call to ensure latest API key if selected via UI
    const ai = new GoogleGenAI({ apiKey });

    // Determine if we should handle as image, video, or text generation
    const isImageGen = model.includes('image');
    const isVideoGen = model.includes('veo');
    
    // For Video Generation (Veo)
    if (isVideoGen) {
      let operation = await ai.models.generateVideos({
        model: model,
        prompt: promptText,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      // Poll until done
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        return { error: "No video generated." };
      }

      // Fetch the video content with the API Key
      const response = await fetch(`${downloadLink}&key=${encodeURIComponent(apiKey)}`);
      const blob = await response.blob();
      const videoUri = URL.createObjectURL(blob);

      return { videoUri };
    }

    // For Image Generation
    else if (isImageGen) {
      const response = await ai.models.generateContent({
        model: model,
        contents: promptText,
      });

      const images: string[] = [];
      let text = "";

      // Iterate through parts to find images and text
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            images.push(`data:${part.inlineData.mimeType};base64,${base64EncodeString}`);
          } else if (part.text) {
            text += part.text;
          }
        }
      }

      if (images.length === 0 && !text) {
        return { error: "No content generated." };
      }

      return { images, text };
    } 
    
    // For Text Generation
    else {
      const response = await ai.models.generateContent({
        model: model,
        contents: promptText,
      });

      return { text: response.text };
    }

  } catch (err: any) {
    console.error("Gemini API Error:", err);
    const code = getErrCode(err);
    if (code === 429) {
      const retryAfterMs = getRetryAfterMs(err) ?? 1000;
      rateLimitUntilByModel.set(model, Date.now() + retryAfterMs);
      return {
        error:
          "Quota/Rate limit exceeded (429). Please check your Gemini API project billing/tier and rate limits in AI Studio, then retry later.",
      };
    }
    return { error: err.message || "An unexpected error occurred." };
  }
};
