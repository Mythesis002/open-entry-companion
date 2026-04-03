export interface AdPlan {
  productName: string;
  productCategory: string;
  targetAudience?: string;
  emotionalTrigger?: string;
  colors: string[];
  brandColors?: string[];
  suggestedBackground: string;
  suggestedLighting: string;
  suggestedMood: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  priceTag?: string;
  designStyle?: string;
  textPlacement?: string;
  adPrompt: string;
}

export type AdFormat = 'square' | 'portrait' | 'landscape';

export interface AdFormatOption {
  id: AdFormat;
  label: string;
  dimensions: string;
  width: number;
  height: number;
  aspectClass: string;
}

export const AD_FORMATS: AdFormatOption[] = [
  { id: 'square', label: 'Square', dimensions: '1080×1080', width: 1080, height: 1080, aspectClass: 'aspect-square' },
  { id: 'portrait', label: 'Portrait', dimensions: '1080×1350', width: 1080, height: 1350, aspectClass: 'aspect-[4/5]' },
  { id: 'landscape', label: 'Landscape', dimensions: '1200×628', width: 1200, height: 628, aspectClass: 'aspect-[1200/628]' },
];

export type GenerationStep = 'uploading' | 'generating' | 'finalizing';

export interface StepInfo {
  id: GenerationStep;
  label: string;
  description: string;
}

export const GENERATION_STEPS: StepInfo[] = [
  { id: 'uploading', label: 'Preparing', description: 'Preparing your product image...' },
  { id: 'generating', label: 'Creating Ad', description: 'Designing your graphical product ad...' },
  { id: 'finalizing', label: 'Finalizing', description: 'Polishing and preparing your ad...' },
];
