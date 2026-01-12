export enum PromptCategory {
  CODING = 'Coding',
  WEB_DEV = 'Web Development',
  WRITING = 'Creative Writing',
  IMAGE = 'Image Generation',
  GEN_3D = '3D Generation',
  CARTOON = 'Cartoon',
  VIDEO = 'Video Generation',
  BUSINESS = 'Business',
  LEARNING = 'Learning',
  FUN = 'Fun'
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
  tags: string[];
  author: string;
  likes: number;
  copies?: number;
  likedByMe?: boolean;
  myRating?: number;
  modelSuggestion?: string; // e.g., 'gemini-3-flash-preview', 'gemini-2.5-flash-image', 'veo-3.1-fast-generate-preview'
  createdAt: number; // Timestamp
}

export interface GenerationResult {
  text?: string;
  images?: string[]; // base64 urls
  videoUri?: string; // blob url
  error?: string;
}

export interface Author {
  name: string;
  bio: string;
  joinedDate: string;
  avatarColor?: string; // Tailwind gradient classes
  avatarUrl?: string; // Generated Avatar URL
}
