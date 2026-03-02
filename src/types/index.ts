// Template Input - what the template needs from the user
export interface TemplateInput {
  id: string;
  type: 'image' | 'text';
  label: string;
  description?: string;
  required?: boolean;
}

// Template Shot - each shot defines its prompt and which inputs to use
export interface TemplateShot {
  id: number;
  prompt: string;
  videoPrompt: string;
  useInputs: string[];           // IDs of user inputs to use as reference
  presetReferenceImages?: string[]; // Pre-embedded reference images for this shot
}

// Template types
export interface ReelTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  previewVideo?: string;
  shots: TemplateShot[];
  inputs: TemplateInput[];       // Dynamic inputs the user must provide
  likes: number;
  usedCount: number;
  uploadTips?: string[];
  creatomateTemplateId: string;
  price: number;
  // Legacy fields for backward compat
  referenceImagesRequired?: number;
  prompts?: string[];
  videoPrompts?: string[];
}

// Collected user inputs
export interface CollectedInputs {
  [inputId: string]: string; // inputId -> base64 image or text value
}

// Generated content
export interface GeneratedImage {
  id: string;
  shotId: number;
  prompt: string;
  imageUrl: string;
  status: 'generating' | 'complete' | 'error';
}

export interface GeneratedVideo {
  id: string;
  sourceImageUrl: string;
  videoUrl: string;
  status: 'generating' | 'complete' | 'error';
}

export interface ReelProject {
  templateId: string;
  collectedInputs: CollectedInputs;
  generatedImages: GeneratedImage[];
  generatedVideos: GeneratedVideo[];
  finalVideoUrl: string | null;
  status: 'inputs' | 'generating' | 'review' | 'payment' | 'videos' | 'composing' | 'complete';
}

// Legacy types (keeping for compatibility)
export type BusinessType =
  | 'product'
  | 'food'
  | 'hospitality'
  | 'medical'
  | 'service'
  | 'real_estate'
  | 'automotive'
  | 'education'
  | 'beauty'
  | 'tech'
  | 'gym'
  | 'travel';

export type AdMood = 'cinematic' | 'high_energy' | 'minimalist' | 'emotional' | 'corporate';
export type TargetAudience = 'general' | 'professionals' | 'gen_z' | 'parents' | 'luxury';
export type AdObjective = 'awareness' | 'conversion' | 'promotion';

export interface AdInputs {
  businessType: BusinessType;
  brandName: string;
  productName: string;
  description: string;
  brandLogo: string | null;
  productImages: string[];
  mood: AdMood;
  audience: TargetAudience;
  objective: AdObjective;
}

export interface RecentAd {
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  thumbnail: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface BusinessCategory {
  id: BusinessType;
  label: string;
  icon: React.ElementType;
  bgImage: string;
}

export interface MoodOption {
  id: AdMood;
  label: string;
}
