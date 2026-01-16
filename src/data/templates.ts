import type { ReelTemplate } from '@/types';

export const REEL_TEMPLATES: ReelTemplate[] = [
  {
    id: 'car-sinking',
    name: 'Car Sinking Scene',
    description: 'Viral car sinking dramatic shots - 3 epic underwater scenes',
    thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=600&fit=crop',
    shots: 3,
    referenceImagesRequired: 1,
    prompts: [
      "Hyper-realistic underwater shot of a the car in reference image floating in dark blue ocean water like a spaceship. Three-quarter front view of the whole car, headlights, spoiler and body lines clearly visible. Dynamic, shimmering sun-ray caustics dance and ripple across the car hood and roof. Trails of small, distinct air bubbles rise lazily from the rear of the chassis. The lighting is dramatic and moody with deep shadows, clear beams of light from above, tiny particles in the water for atmosphere. High-end cinematic look, ultra-detailed, 4K, vertical 9:16, photoreal, no text.",
      "Ultra-realistic underwater photo of a car in the reference image. Extreme close-up of the front wheel and fender, slightly tilted, as if the car is diving underwater. The wheel rim and tire are sharp and detailed, wet metal and rubber with realistic reflections. Surround the wheel with floating dust and sand particles, tiny air bubbles and subtle scratches on the body. Strong sun rays shining from the water surface above, blue-green ambient light, cinematic contrast, shallow depth of field, bokeh in the background. Hyper-detailed, 4K, vertical 9:16, photoreal, no text.",
      "Hyper-realistic underwater shot of a car floating in dark blue ocean water like a spaceship. Three-quarter back view of the whole car, backlights, spoiler and body lines clearly visible. Dynamic, shimmering sun-ray caustics dance and ripple across the cars hood and roof. Trails of small, distinct air bubbles rise lazily from the rear of the chassis. The lighting is dramatic and moody with deep shadows, clear beams of light from above, tiny particles in the water for atmosphere. High-end cinematic look, ultra-detailed, 4K, vertical 9:16, photoreal, no text."
    ],
    videoPrompts: [
      "A cinematic slow-motion underwater video shot of the car mostly stays on place, dark blue ocean water. The camera performs a very very slow hand handled movement. Dynamic, shimmering sun-ray caustics dance and ripple realistically across the cars hood and roof. Trails of small, distinct air bubbles rise lazily and slowly upwards from the rear of the chassis. The video consists of two separate shots, each approximately 3 seconds long, captured from clearly different camera angles., The lighting is dramatic and moody, with deep shadows. Raw high-end underwater cinematography, 8k resolution.",
      "A cinematic slow-motion underwater video shot of the car mostly stays on place, dark blue ocean water. The camera performs a very very slow hand handled movement. Dynamic, shimmering sun-ray caustics dance and ripple realistically across the cars hood and roof. Trails of small, distinct air bubbles rise lazily and slowly upwards from the rear of the chassis. The video consists of two separate shots, each approximately 3 seconds long, captured from clearly different camera angles., The lighting is dramatic and moody, with deep shadows. Raw high-end underwater cinematography, 8k resolution.",
      "A cinematic slow-motion underwater video shot of the car mostly stays on place, dark blue ocean water. The camera performs a very very slow hand handled movement. Dynamic, shimmering sun-ray caustics dance and ripple realistically across the cars hood and roof. Trails of small, distinct air bubbles rise lazily and slowly upwards from the rear of the chassis. The video consists of two separate shots, each approximately 3 seconds long, captured from clearly different camera angles., The lighting is dramatic and moody, with deep shadows. Raw high-end underwater cinematography, 8k resolution."
    ],
    creatomateTemplateId: '70f6563a-d3ce-47f5-90a0-34d40663881e',
    price: 20
  }
];

export const getTemplateById = (id: string): ReelTemplate | undefined => {
  return REEL_TEMPLATES.find(t => t.id === id);
};
