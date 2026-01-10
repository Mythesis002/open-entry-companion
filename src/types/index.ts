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
