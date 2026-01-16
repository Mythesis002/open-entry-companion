import type { ReelTemplate } from '@/types';

export const REEL_TEMPLATES: ReelTemplate[] = [
  {
    id: 'car-sinking',
    name: 'Car Sinking Scene',
    description: 'Viral car sinking dramatic shots - 3 epic scenes with your face',
    thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=600&fit=crop',
    shots: 3,
    referenceImagesRequired: 2,
    prompts: [
      "A person sitting in a car that is slowly sinking in deep blue water, dramatic underwater lighting, bubbles rising, cinematic shot, the person looks calm but determined, photorealistic, 4K quality, movie scene, underwater photography",
      "The same person from reference breaking through car window underwater, glass shattering in slow motion, bubbles everywhere, dramatic lighting from above, survival scene, photorealistic, cinematic quality",
      "The person swimming upward toward bright light at water surface, seen from below, bubbles trailing behind, dramatic rays of light piercing through water, triumphant escape scene, photorealistic, cinematic"
    ],
    videoPrompts: [
      "Slow sinking motion, bubbles rising gently, slight camera shake, water distortion effects",
      "Dynamic glass break, water rushing in, fast swimming motion, urgent movement",
      "Upward swimming motion, light rays dancing, peaceful ascent, triumphant reach to surface"
    ],
    creatomateTemplateId: '70f6563a-d3ce-47f5-90a0-34d40663881e',
    price: 20
  }
];

export const getTemplateById = (id: string): ReelTemplate | undefined => {
  return REEL_TEMPLATES.find(t => t.id === id);
};
