import React, { useState, useEffect } from 'react';
import { Prompt, GenerationResult, PromptCategory } from '../types';
import { hasUserApiKey, runPrompt } from '../services/geminiService';
import { setRating } from '../services/db';
import CustomDropdown from './CustomDropdown';

interface PromptModalProps {
  prompt: Prompt;
  onClose: () => void;
  onUpdate?: (updatedPrompt: Prompt) => void;
  onCopy?: (promptId: string) => void | Promise<void>;
}

const PromptModal: React.FC<PromptModalProps> = ({ prompt, onClose, onUpdate, onCopy }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'run'>('preview');
  
  // Viewing & Running State
  const [editableContent, setEditableContent] = useState(prompt.content);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  
  // Summarization State
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Model Selection State
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Veo Specific State
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: PromptCategory.CODING,
    content: ''
  });

  // Rating State
  const [userRating, setUserRating] = useState<number>(0);

  // Copy Count State
  const [copyCount, setCopyCount] = useState<number>(0);

  // Reset state when prompt changes
  useEffect(() => {
    setEditableContent(prompt.content);
    setResult(null);
    setSummary(null);
    setActiveTab('preview');
    setIsEditing(false);
    
    // Set default model based on category
    if (prompt.category === PromptCategory.IMAGE || prompt.category === PromptCategory.GEN_3D || prompt.category === PromptCategory.CARTOON) {
      setSelectedModel('gemini-2.5-flash-image');
    } else if (prompt.category === PromptCategory.VIDEO) {
      setSelectedModel('veo-3.1-fast-generate-preview');
      // Check for API key presence for Veo
      checkApiKey();
    } else {
      setSelectedModel('gemini-3-flash-preview');
    }
    
    // Initialize edit form
    setEditForm({
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      content: prompt.content
    });

    setUserRating(prompt.myRating || 0);
    setCopyCount(prompt.copies || 0);
  }, [prompt]);

  useEffect(() => {
    const onKeyChanged = () => {
      if (prompt.category === PromptCategory.VIDEO) {
        checkApiKey().catch(() => {});
      }
    };
    window.addEventListener('pv:apiKeyChanged', onKeyChanged);
    return () => window.removeEventListener('pv:apiKeyChanged', onKeyChanged);
  }, [prompt.category]);

  const checkApiKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setApiKeySelected(hasKey);
    } else {
      // Fallback or dev environment
      setApiKeySelected(hasUserApiKey() || !!process.env.API_KEY); 
    }
  };

  const handleSelectKey = async () => {
     if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
       await (window as any).aistudio.openSelectKey();
       // Assume success to handle race condition mentioned in docs
       setApiKeySelected(true);
       return;
     }
     window.dispatchEvent(new Event('pv:openApiKeyModal'));
  };

  const handleCopy = async () => {
    navigator.clipboard.writeText(editableContent);
    setCopyCount(prev => prev + 1); // Update local UI immediately
    if (onCopy) await onCopy(prompt.id);
    alert("Copied to clipboard!");
  };

  const handleRun = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await runPrompt(editableContent, prompt.category, selectedModel, aspectRatio);
      setResult(res);
      if (res.error && res.error.includes("Requested entity was not found")) {
        setApiKeySelected(false);
      }
    } catch (e) {
      setResult({ error: "Failed to run prompt" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary(null);
    try {
      const summarizationPrompt = `Please provide a concise summary (2-3 sentences) of the following prompt content:\n\n${editableContent}`;
      // Use text model specifically for summarization regardless of prompt category
      const res = await runPrompt(summarizationPrompt, PromptCategory.WRITING, 'gemini-3-flash-preview');
      if (res.text) {
        setSummary(res.text);
      } else if (res.error) {
        console.error("Summarization error:", res.error);
        setSummary("Failed to generate summary. Please try again.");
      }
    } catch (e) {
      console.error("Failed to summarize", e);
      setSummary("An error occurred while summarizing.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleRate = async (rating: number) => {
    setUserRating(rating);
    try {
      const res = await setRating(prompt.id, rating);
      setUserRating(res.rating);
      onUpdate?.({ ...prompt, myRating: res.rating });
    } catch (err) {
      console.error("Failed to save rating", err);
    }
  };

  const hasUnsavedChanges = () => {
    return (
      editForm.title !== prompt.title ||
      editForm.description !== prompt.description ||
      editForm.category !== prompt.category ||
      editForm.content !== prompt.content
    );
  };

  const handleCloseWithConfirmation = () => {
    if (isEditing && hasUnsavedChanges()) {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges()) {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const toggleEditMode = () => {
    if (!isEditing) {
      setEditForm({
        title: prompt.title,
        description: prompt.description,
        category: prompt.category,
        content: prompt.content
      });
      setIsEditing(true);
    } else {
      handleCancelEdit();
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (value: string) => {
    setEditForm({
      ...editForm,
      category: value as PromptCategory
    });
  };

  const handleSaveEdit = () => {
    if (onUpdate) {
      let newModelSuggestion = 'gemini-3-flash-preview';
      if (editForm.category === PromptCategory.IMAGE || editForm.category === PromptCategory.GEN_3D || editForm.category === PromptCategory.CARTOON) newModelSuggestion = 'gemini-2.5-flash-image';
      if (editForm.category === PromptCategory.VIDEO) newModelSuggestion = 'veo-3.1-fast-generate-preview';

      const updatedPrompt: Prompt = {
        ...prompt,
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        content: editForm.content,
        modelSuggestion: newModelSuggestion
      };
      
      onUpdate(updatedPrompt);
      setEditableContent(editForm.content);
      setIsEditing(false);
    }
  };

  const getGenerateButtonText = () => {
    if (prompt.category === PromptCategory.VIDEO) return "Run with Veo";
    if (prompt.category === PromptCategory.IMAGE || prompt.category === PromptCategory.GEN_3D || prompt.category === PromptCategory.CARTOON) return "Generate Image";
    return "Run with Gemini";
  };

  const categoryOptions = Object.values(PromptCategory).map(cat => ({
    value: cat,
    label: cat
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-solar-base03/90 backdrop-blur-sm"
        onClick={handleCloseWithConfirmation}
      />
      
      {/* 3D Modal Content */}
      <div className="relative w-full max-w-4xl modal-3d rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-solar-base02 shadow-md z-10">
          {isEditing ? (
             <h2 className="text-xl font-bold text-solar-base3">Edit Prompt</h2>
          ) : (
            <div className="overflow-hidden">
              <h2 className="text-2xl font-black text-solar-base3 mb-2 flex items-center gap-3 drop-shadow-sm truncate pr-4">
                <span className="truncate">{prompt.title}</span>
                <button 
                  onClick={toggleEditMode}
                  className="btn-icon-3d w-8 h-8 flex-shrink-0 flex items-center justify-center bg-solar-base02 text-solar-base01 text-xs"
                  title="Edit Prompt"
                >
                  <i className="fas fa-pencil-alt"></i>
                </button>
              </h2>
              <div className="flex gap-2">
                <span className={`tag-3d px-3 py-1 rounded-lg text-solar-base1 whitespace-nowrap`}>
                  {prompt.category}
                </span>
                <span className="text-xs text-solar-base01 flex items-center font-bold px-2 whitespace-nowrap">
                  <i className="fas fa-heart mr-1 text-solar-red"></i> {prompt.likes}
                </span>
                {copyCount > 0 && (
                   <span className="text-xs text-solar-base01 flex items-center font-bold px-2 whitespace-nowrap">
                     <i className="fas fa-copy mr-1 text-solar-cyan"></i> {copyCount}
                   </span>
                )}
              </div>
            </div>
          )}
          
          <button 
            onClick={handleCloseWithConfirmation}
            className="btn-icon-3d w-10 h-10 flex-shrink-0 flex items-center justify-center bg-solar-red text-solar-base3"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Tabs */}
        {!isEditing && (
          <div className="flex bg-solar-base02 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === 'preview' 
                  ? 'bg-solar-base03 text-solar-cyan shadow-[inset_0_4px_6px_rgba(0,0,0,0.1)]' 
                  : 'text-solar-base01 hover:text-solar-base3 hover:bg-solar-base03/30'
              }`}
            >
              <i className="fas fa-eye mr-2"></i> Preview
            </button>
            <button
              onClick={() => setActiveTab('run')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === 'run' 
                  ? 'bg-solar-base03 text-solar-violet shadow-[inset_0_4px_6px_rgba(0,0,0,0.1)]' 
                  : 'text-solar-base01 hover:text-solar-base3 hover:bg-solar-base03/30'
              }`}
            >
              <i className="fas fa-play mr-2"></i> {prompt.category === PromptCategory.VIDEO ? 'Run with Veo' : 'Run with Gemini'}
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-solar-base03">
          
          {/* EDIT MODE */}
          {isEditing && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="input-3d w-full p-4 rounded-xl"
                />
              </div>

              <div>
                <CustomDropdown 
                  label="Category"
                  options={categoryOptions}
                  value={editForm.category}
                  onChange={handleCategoryChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-2">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={2}
                  className="input-3d w-full p-4 rounded-xl resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-2">Prompt Content</label>
                <textarea
                  name="content"
                  value={editForm.content}
                  onChange={handleEditChange}
                  rows={8}
                  className="input-3d w-full p-4 rounded-xl font-mono text-sm whitespace-pre-wrap break-words"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-solar-base01/10">
                <button
                  onClick={handleCancelEdit}
                  className="btn-3d btn-3d-base02 px-6 py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn-3d btn-3d-cyan px-8 py-3 rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* PREVIEW TAB */}
          {!isEditing && activeTab === 'preview' && (
            <div className="space-y-8">
              <div className="card-3d p-6 rounded-2xl bg-solar-base02/50 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.1)]">
                <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-3">Description</label>
                <p className="text-solar-base2 leading-relaxed font-medium text-lg break-words">{prompt.description}</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-solar-base01 mb-3">
                  Prompt Content
                </label>
                <div className="relative group">
                  <textarea
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    className="input-3d w-full h-80 p-6 rounded-2xl font-mono text-sm leading-relaxed whitespace-pre-wrap break-words resize-none"
                    spellCheck={false}
                  />
                  <button 
                    onClick={handleCopy}
                    className="btn-icon-3d absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-solar-base02 text-solar-base1 z-10"
                    title="Copy to Clipboard"
                  >
                    <i className="fas fa-copy text-lg"></i>
                  </button>
                </div>

                {/* Summarize Controls */}
                <div className="mt-4">
                    <button 
                        onClick={handleSummarize}
                        disabled={isSummarizing || !editableContent}
                        className="text-xs font-bold text-solar-cyan hover:text-solar-blue transition-colors flex items-center gap-2"
                    >
                        {isSummarizing ? (
                            <><i className="fas fa-circle-notch fa-spin"></i> Generating Summary...</>
                        ) : (
                            <><i className="fas fa-magic"></i> Summarize with AI</>
                        )}
                    </button>
                    
                    {summary && (
                        <div className="mt-3 p-4 rounded-xl bg-solar-base02 border border-solar-base01/20 animate-fade-in">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-solar-violet mb-2">
                                AI Summary
                            </h4>
                            <p className="text-sm text-solar-base1 leading-relaxed break-words">
                                {summary}
                            </p>
                        </div>
                    )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {prompt.tags.map(tag => (
                  <span key={tag} className="tag-3d px-4 py-1.5 rounded-lg text-solar-cyan whitespace-nowrap">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Rating System */}
              <div className="mt-8 pt-6 border-t border-solar-base01/10 flex flex-col gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-solar-base01">Rate Quality</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(star)}
                        className={`text-2xl transition-all duration-200 hover:scale-125 focus:outline-none ${star <= userRating ? 'text-solar-yellow drop-shadow-[0_0_8px_rgba(181,137,0,0.6)]' : 'text-solar-base01/30 hover:text-solar-yellow/50'}`}
                        aria-label={`Rate ${star} stars`}
                      >
                        <i className="fas fa-star"></i>
                      </button>
                    ))}
                    <span className="ml-3 text-xs text-solar-base01 font-bold bg-solar-base02 px-2 py-1 rounded-md">
                      {userRating > 0 ? `${userRating} / 5` : 'Tap to rate'}
                    </span>
                  </div>
              </div>
            </div>
          )}

          {/* RUN TAB */}
          {!isEditing && activeTab === 'run' && (
            <div className="space-y-8 h-full flex flex-col">
              
              {/* Video Options */}
              {prompt.category === PromptCategory.VIDEO && !result && !isLoading && (
                <div className="card-3d p-6 rounded-2xl mb-4 bg-solar-base02">
                   <div className="flex items-center justify-between mb-4 border-b border-solar-base01/20 pb-4">
                     <label className="block text-xs font-bold uppercase tracking-wider text-solar-base1">Video Config</label>
                     {!apiKeySelected && (
                        <button 
                          onClick={handleSelectKey}
                          className="text-xs text-solar-cyan font-bold hover:underline"
                        >
                          +API KEY
                        </button>
                     )}
                   </div>
                   
                   {!apiKeySelected ? (
                     <div className="text-center p-8 rounded-xl bg-solar-base03/50 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2)]">
                       <i className="fas fa-key text-4xl text-solar-cyan mb-4 drop-shadow-md"></i>
                       <p className="text-sm text-solar-base2 font-bold mb-2">API Key Required</p>
                       <p className="text-xs text-solar-base01 mb-6">
                         Veo video generation requires a specific paid API key.
                       </p>
                       <button
                         onClick={handleSelectKey}
                         className="btn-3d btn-3d-base02 px-6 py-3 rounded-xl text-sm"
                       >
                         +API KEY
                       </button>
                     </div>
                   ) : (
                     <div className="space-y-6">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <button
                            onClick={() => setSelectedModel('veo-3.1-fast-generate-preview')}
                            className={`btn-3d flex items-center gap-4 p-4 rounded-xl text-left ${
                              selectedModel === 'veo-3.1-fast-generate-preview'
                                ? 'btn-3d-cyan'
                                : 'btn-3d-base02'
                            }`}
                          >
                            <i className="fas fa-video text-2xl"></i>
                            <div>
                              <div className="text-sm font-bold">Veo Fast</div>
                              <div className="text-[10px] opacity-70">Low Latency</div>
                            </div>
                          </button>
                          
                          <button
                             onClick={() => setSelectedModel('veo-3.1-generate-preview')}
                             className={`btn-3d flex items-center gap-4 p-4 rounded-xl text-left ${
                              selectedModel === 'veo-3.1-generate-preview'
                                ? 'bg-solar-violet text-solar-base03 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]'
                                : 'btn-3d-base02'
                            }`}
                          >
                            <i className="fas fa-film text-2xl"></i>
                            <div>
                               <div className="text-sm font-bold">Veo Quality</div>
                               <div className="text-[10px] opacity-70">High Res</div>
                            </div>
                          </button>
                       </div>
                       
                       <div className="flex gap-3 items-center">
                         <div className="text-xs uppercase text-solar-base01 font-bold mr-2">Aspect Ratio:</div>
                         <button
                           onClick={() => setAspectRatio('16:9')}
                           className={`btn-3d px-4 py-2 text-xs rounded-lg ${
                             aspectRatio === '16:9' ? 'btn-3d-cyan' : 'btn-3d-base02'
                           }`}
                         >
                           16:9
                         </button>
                         <button
                           onClick={() => setAspectRatio('9:16')}
                           className={`btn-3d px-4 py-2 text-xs rounded-lg ${
                             aspectRatio === '9:16' ? 'btn-3d-cyan' : 'btn-3d-base02'
                           }`}
                         >
                           9:16
                         </button>
                       </div>
                     </div>
                   )}
                </div>
              )}

              {/* Image Options */}
              {(prompt.category === PromptCategory.IMAGE || prompt.category === PromptCategory.GEN_3D || prompt.category === PromptCategory.CARTOON) && !result && !isLoading && (
                <div className="card-3d p-6 rounded-2xl bg-solar-base02">
                  <label className="block text-xs font-bold uppercase tracking-wider text-solar-base1 mb-4">Select Model</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button
                      onClick={() => setSelectedModel('gemini-2.5-flash-image')}
                      className={`btn-3d flex items-center gap-4 p-4 rounded-xl text-left ${
                        selectedModel === 'gemini-2.5-flash-image'
                          ? 'bg-solar-violet text-solar-base03 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]'
                          : 'btn-3d-base02'
                      }`}
                    >
                      <i className="fas fa-image text-2xl"></i>
                      <div>
                        <div className="text-sm font-bold">Image Gen</div>
                        <div className="text-[10px] opacity-70">gemini-2.5-flash-image</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setSelectedModel('gemini-3-flash-preview')}
                      className={`btn-3d flex items-center gap-4 p-4 rounded-xl text-left ${
                        selectedModel === 'gemini-3-flash-preview'
                          ? 'btn-3d-cyan'
                          : 'btn-3d-base02'
                      }`}
                    >
                      <i className="fas fa-comment-alt text-2xl"></i>
                      <div>
                        <div className="text-sm font-bold">Text Only</div>
                        <div className="text-[10px] opacity-70">gemini-3-flash-preview</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {!result && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-80 mt-8">
                  <div className="w-24 h-24 rounded-full bg-solar-base02 flex items-center justify-center mb-6 shadow-[5px_5px_15px_rgba(0,0,0,0.3),-2px_-2px_10px_rgba(255,255,255,0.05)]">
                     <i className="fas fa-robot text-5xl text-solar-violet drop-shadow-md"></i>
                  </div>
                  <p className="text-xl text-solar-base2 font-bold">Ready to generate?</p>
                  <p className="text-sm text-solar-base01 max-w-sm mt-2">
                    Using <span className="text-solar-cyan font-mono font-bold">{selectedModel}</span>
                  </p>
                  <button
                    onClick={handleRun}
                    disabled={prompt.category === PromptCategory.VIDEO && !apiKeySelected}
                    className={`mt-8 btn-3d btn-3d-primary px-10 py-5 rounded-2xl text-lg w-full max-w-sm ${
                       prompt.category === PromptCategory.VIDEO && !apiKeySelected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {getGenerateButtonText()}
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                   <div className="w-32 h-32 border-8 border-solar-base02 border-t-solar-cyan rounded-full animate-spin mb-8 shadow-xl"></div>
                  <h3 className="text-2xl font-black text-solar-base3 mb-3">Generating...</h3>
                  <p className="text-solar-base1 text-base max-w-xs text-center font-medium">
                    {prompt.category === PromptCategory.VIDEO 
                      ? "Veo is rendering your video. This may take a minute..." 
                      : "The AI is processing..."}
                  </p>
                </div>
              )}

              {result && (
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-solar-base3">Result</h3>
                    <button 
                      onClick={() => setResult(null)}
                      className="text-sm text-solar-base01 hover:text-solar-red font-bold underline"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="input-3d p-8 rounded-2xl min-h-[300px]">
                    {result.error && (
                      <div className="text-solar-red font-bold flex items-center p-4 bg-solar-red/10 rounded-xl">
                        <i className="fas fa-exclamation-triangle mr-3 text-2xl"></i>
                        {result.error}
                      </div>
                    )}

                    {result.videoUri && (
                      <div className="relative group">
                        <video 
                          src={result.videoUri} 
                          controls 
                          autoPlay 
                          loop 
                          className="w-full rounded-xl shadow-2xl"
                        />
                        <a 
                          href={result.videoUri} 
                          download="generated-video.mp4"
                          className="btn-3d btn-3d-cyan absolute bottom-16 right-6 px-6 py-3 rounded-xl text-sm"
                        >
                           <i className="fas fa-download mr-2"></i> Download
                        </a>
                      </div>
                    )}
                    
                    {result.images && result.images.length > 0 && (
                      <div className="grid grid-cols-1 gap-8">
                        {result.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={img} 
                              alt="AI Generated" 
                              className="w-full rounded-xl shadow-2xl"
                            />
                            <a 
                              href={img} 
                              download={`generated-${idx}.png`}
                              className="btn-3d btn-3d-cyan absolute bottom-6 right-6 px-6 py-3 rounded-xl text-sm"
                            >
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.text && (
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap break-words font-mono text-sm text-solar-base1 bg-transparent border-none p-0 shadow-none overflow-x-auto custom-scrollbar">
                          {result.text}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!isEditing && activeTab === 'preview' && (
          <div className="p-8 bg-solar-base02 flex justify-end gap-6 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
            <button 
              onClick={() => setActiveTab('run')}
              className="btn-3d btn-3d-base02 px-8 py-3.5 rounded-xl"
            >
              Test Prompt
            </button>
            <button 
              onClick={handleCopy}
              className="btn-3d btn-3d-cyan px-8 py-3.5 rounded-xl"
            >
              Copy Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptModal;
