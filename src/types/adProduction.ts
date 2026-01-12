// Hollywood-grade Ad Production Pipeline Types

export type BrandArchetype = 
  | 'hero' 
  | 'magician' 
  | 'creator' 
  | 'ruler' 
  | 'caregiver' 
  | 'everyman' 
  | 'rebel' 
  | 'lover' 
  | 'jester' 
  | 'sage' 
  | 'explorer' 
  | 'innocent';

export type TargetEmotion = 
  | 'awe' 
  | 'joy' 
  | 'trust' 
  | 'desire' 
  | 'nostalgia' 
  | 'excitement' 
  | 'serenity' 
  | 'inspiration';

export interface ProductionPhase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  progress: number;
  substeps: string[];
  currentSubstep?: string;
}

// Phase 1: Deep Briefing / Psychological Ingest
export interface DeepBriefing {
  brandArchetype: BrandArchetype;
  targetEmotion: TargetEmotion;
  coreConflict: string; // The human problem
  transformation: string; // The "Aha!" moment
  productDNA: string; // Physical textures/materials description
  referenceImages: string[];
}

// Phase 2: Director's Treatment
export interface VisualAnchor {
  technicalDescription: string; // Obsessive product/character description
  keyVisualElements: string[];
  colorPalette: string[];
  materialTextures: string[];
}

export interface ActSpec {
  actNumber: 1 | 2 | 3;
  title: string; // e.g., "The Hook", "The Solution", "The Payoff"
  narrativeGoal: string;
  cameraLens: string; // e.g., "35mm Anamorphic"
  lighting: string; // e.g., "Volumetric Rembrandt"
  colorScience: string; // e.g., "Kodak Vision3"
  cameraMovement: string; // e.g., "Dolly In", "Slow Pan"
  duration: number; // seconds
  voiceoverScript: string;
}

export interface DirectorTreatment {
  visualAnchor: VisualAnchor;
  acts: [ActSpec, ActSpec, ActSpec];
  overallTone: string;
  musicDirection: string;
}

// Phase 3: Keyframes
export interface Keyframe {
  actNumber: 1 | 2 | 3;
  imageUrl: string;
  imageBase64?: string;
  prompt: string;
  cinematicSpecs: string;
}

// Phase 4: Video Shots
export interface VideoShot {
  actNumber: 1 | 2 | 3;
  shotNumber: number;
  videoUrl: string;
  duration: number;
  cameraMovement: string;
}

// Phase 5: Audio
export interface AudioAssets {
  voiceoverUrl: string;
  voiceoverBase64?: string;
  backgroundMusicUrl?: string;
  duration: number;
}

// Final Output
export interface FinalAdOutput {
  masterVideoUrl: string;
  thumbnailUrl: string;
  duration: number;
  resolution: string;
  acts: {
    actNumber: number;
    videoUrl: string;
    keyframeUrl: string;
  }[];
}

// Complete Production State
export interface AdProductionState {
  phase: 'idle' | 'briefing' | 'treatment' | 'keyframing' | 'video' | 'audio' | 'mastering' | 'complete' | 'error';
  phases: ProductionPhase[];
  briefing?: DeepBriefing;
  treatment?: DirectorTreatment;
  keyframes: Keyframe[];
  videoShots: VideoShot[];
  audio?: AudioAssets;
  finalOutput?: FinalAdOutput;
  error?: string;
}

// Production configuration
export const BRAND_ARCHETYPES: { id: BrandArchetype; label: string; description: string }[] = [
  { id: 'hero', label: 'The Hero', description: 'Courageous, determined, inspiring triumph' },
  { id: 'magician', label: 'The Magician', description: 'Transformative, visionary, making dreams reality' },
  { id: 'creator', label: 'The Creator', description: 'Innovative, artistic, building lasting value' },
  { id: 'ruler', label: 'The Ruler', description: 'Commanding, premium, leadership excellence' },
  { id: 'caregiver', label: 'The Caregiver', description: 'Nurturing, protective, compassionate service' },
  { id: 'everyman', label: 'The Everyman', description: 'Relatable, authentic, down-to-earth connection' },
  { id: 'rebel', label: 'The Rebel', description: 'Bold, disruptive, breaking conventions' },
  { id: 'lover', label: 'The Lover', description: 'Passionate, sensual, intimate connection' },
  { id: 'jester', label: 'The Jester', description: 'Playful, humorous, lighthearted joy' },
  { id: 'sage', label: 'The Sage', description: 'Wise, knowledgeable, trusted guidance' },
  { id: 'explorer', label: 'The Explorer', description: 'Adventurous, free-spirited, discovery' },
  { id: 'innocent', label: 'The Innocent', description: 'Pure, optimistic, simple happiness' },
];

export const TARGET_EMOTIONS: { id: TargetEmotion; label: string; description: string }[] = [
  { id: 'awe', label: 'Awe', description: 'Breathtaking wonder and amazement' },
  { id: 'joy', label: 'Joy', description: 'Pure happiness and delight' },
  { id: 'trust', label: 'Trust', description: 'Confidence and reliability' },
  { id: 'desire', label: 'Desire', description: 'Craving and aspiration' },
  { id: 'nostalgia', label: 'Nostalgia', description: 'Warm, sentimental memories' },
  { id: 'excitement', label: 'Excitement', description: 'Thrilling anticipation' },
  { id: 'serenity', label: 'Serenity', description: 'Calm, peaceful tranquility' },
  { id: 'inspiration', label: 'Inspiration', description: 'Motivated to take action' },
];

export const INITIAL_PRODUCTION_PHASES: ProductionPhase[] = [
  { 
    id: 'briefing', 
    name: 'Deep Briefing', 
    status: 'pending', 
    progress: 0,
    substeps: ['Analyzing brand archetype', 'Mapping emotional journey', 'Engineering conflict arc']
  },
  { 
    id: 'treatment', 
    name: 'Director\'s Treatment', 
    status: 'pending', 
    progress: 0,
    substeps: ['Creating visual anchor', 'Scripting 3-act structure', 'Defining cinematic specs']
  },
  { 
    id: 'keyframing', 
    name: 'Visual DNA Locking', 
    status: 'pending', 
    progress: 0,
    substeps: ['Rendering Act 1 keyframe', 'Rendering Act 2 keyframe', 'Rendering Act 3 keyframe']
  },
  { 
    id: 'video', 
    name: 'Motion Synthesis', 
    status: 'pending', 
    progress: 0,
    substeps: ['Animating Act 1', 'Animating Act 2', 'Animating Act 3']
  },
  { 
    id: 'audio', 
    name: 'Audio Production', 
    status: 'pending', 
    progress: 0,
    substeps: ['Generating voiceover', 'Syncing narration']
  },
  { 
    id: 'mastering', 
    name: 'Final Mastering', 
    status: 'pending', 
    progress: 0,
    substeps: ['Compositing acts', 'Adding logo overlay', 'Exporting 4K master']
  },
];
