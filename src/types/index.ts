// Template types
export interface ReelTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  shots: number;
  referenceImagesRequired: number;
  prompts: string[];
  videoPrompts: string[];
  creatomateTemplateId: string;
  price: number; // Price in INR
}

// Generated content
export interface GeneratedImage {
  id: string;
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
  referenceImages: string[];
  generatedImages: GeneratedImage[];
  generatedVideos: GeneratedVideo[];
  finalVideoUrl: string | null;
  status: 'images' | 'review' | 'videos' | 'composing' | 'complete';
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
