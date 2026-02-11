import type { ReelTemplate } from '@/types';

export const REEL_TEMPLATES: ReelTemplate[] = [
  {
    id: 'car-sinking',
    name: 'Car Sinking Scene',
    description: 'Dramatic underwater shots - viral car sinking effect',
    thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=600&fit=crop',
    previewVideo: 'https://res.cloudinary.com/dkr5qwdjd/video/upload/br_5016k,q_33,vc_h264/v1768843383/carsinking.mov',
    shots: 3,
    referenceImagesRequired: 1,
    likes: 2847,
    usedCount: 12543,
    uploadTips: [
      'Use a clear, well-lit photo of your car',
      'Side or 3/4 angle works best',
      'Avoid photos with busy backgrounds'
    ],
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
    price: 29
  },
  {
    id: 'couple-romance',
    name: 'Couple Romance',
    description: 'Dreamy cinematic couple shots with golden hour vibes',
    thumbnail: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=400&h=600&fit=crop',
    shots: 3,
    referenceImagesRequired: 2,
    likes: 5621,
    usedCount: 23890,
    uploadTips: [
      'Upload one clear photo of each person',
      'Front-facing portraits with good lighting',
      'Avoid sunglasses or heavy filters'
    ],
    prompts: [
      "Cinematic golden hour portrait of the person from the first reference image, looking thoughtfully into the distance at a sunset beach. Warm orange and pink light illuminates their face. Shallow depth of field, film grain, romantic atmosphere. 4K, vertical 9:16, photoreal, no text.",
      "Romantic close-up of the person from the second reference image, softly smiling with golden light reflecting in their eyes. Wind gently moving their hair. Bokeh background of city lights at dusk. Cinematic color grading, ultra-detailed, 4K, vertical 9:16, photoreal, no text.",
      "Both people from reference images together in a romantic rooftop setting at golden hour. They face each other closely, foreheads almost touching. City skyline blurred beautifully behind them. Warm cinematic lighting, lens flare, shallow depth of field. Ultra-detailed, 4K, vertical 9:16, photoreal, no text."
    ],
    videoPrompts: [
      "Cinematic slow-motion video of a person gazing at sunset on a beach. Gentle breeze moving their hair. Warm golden hour light. Camera slowly pushes in. Film grain, romantic atmosphere. 8K resolution.",
      "Slow-motion close-up video of a person smiling softly with city bokeh lights behind them. Camera gently drifts. Warm color grading, cinematic look. 8K resolution.",
      "Cinematic slow-motion video of two people on a rooftop at golden hour, facing each other intimately. Camera slowly orbits around them. Lens flare, warm tones, romantic atmosphere. 8K resolution."
    ],
    creatomateTemplateId: '70f6563a-d3ce-47f5-90a0-34d40663881e',
    price: 29
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Premium product reveal with luxury lighting & effects',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=600&fit=crop',
    shots: 3,
    referenceImagesRequired: 1,
    likes: 3412,
    usedCount: 18765,
    uploadTips: [
      'Use a clean product photo on white or solid background',
      'Show the product from its best angle',
      'Good lighting brings out details'
    ],
    prompts: [
      "Ultra-luxury product photography of the item from reference image on a glossy black reflective surface. Dramatic studio lighting with sharp highlights and deep shadows. Floating gold particles and soft smoke in the background. Premium commercial look, ultra-detailed, 4K, vertical 9:16, photoreal, no text.",
      "Extreme close-up macro shot of the product from reference image showing intricate details and textures. Shallow depth of field with dreamy bokeh. Studio lighting with a warm accent light from the side. Premium advertising aesthetic, ultra-detailed, 4K, vertical 9:16, photoreal, no text.",
      "The product from reference image floating dramatically in mid-air with dynamic lighting beams cutting through subtle fog. Dark moody background with colored accent lights (blue and amber). Cinematic commercial photography, ultra-detailed, 4K, vertical 9:16, photoreal, no text."
    ],
    videoPrompts: [
      "Cinematic product reveal video on glossy black surface. Camera slowly orbits the product. Dramatic studio lighting with floating gold particles. Smooth slow-motion. 8K resolution.",
      "Extreme close-up macro video slowly gliding across product surface showing details and textures. Shallow depth of field, premium lighting. 8K resolution.",
      "Dramatic product floating video with dynamic lighting beams through fog. Camera slowly pulls back to reveal full product. Cinematic commercial look. 8K resolution."
    ],
    creatomateTemplateId: '70f6563a-d3ce-47f5-90a0-34d40663881e',
    price: 29
  },
  {
    id: 'travel-montage',
    name: 'Travel Montage',
    description: 'Epic travel shots with cinematic landscapes',
    thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=600&fit=crop',
    shots: 3,
    referenceImagesRequired: 1,
    likes: 4190,
    usedCount: 15320,
    uploadTips: [
      'Upload a full-body or upper-body photo',
      'Outdoor photos with natural light work best',
      'Casual travel outfits add authenticity'
    ],
    prompts: [
      "Cinematic wide shot of the person from reference image standing at the edge of a dramatic cliff overlooking a vast turquoise ocean. Wind blowing their clothes and hair. Epic landscape with golden hour lighting, volumetric clouds. Travel adventure aesthetic, ultra-detailed, 4K, vertical 9:16, photoreal, no text.",
      "The person from reference image walking through an ancient narrow cobblestone street in a European village. Warm afternoon light casting long shadows. Hanging flowers and rustic architecture. Travel photography aesthetic, ultra-detailed, 4K, vertical 9:16, photoreal, no text.",
      "Aerial-perspective shot of the person from reference image sitting on a pristine white sand beach with crystal clear water. Drone-like overhead angle showing the person surrounded by turquoise waves. Paradise travel aesthetic, ultra-detailed, 4K, vertical 9:16, photoreal, no text."
    ],
    videoPrompts: [
      "Cinematic video of a person at a cliff edge overlooking the ocean. Wind blowing clothes dramatically. Camera slowly pulls back to reveal epic landscape. Golden hour lighting. 8K resolution.",
      "Slow-motion video of a person walking through a charming European cobblestone street. Warm afternoon light. Camera follows from behind. Travel cinematic look. 8K resolution.",
      "Overhead drone-style video slowly descending toward a person on a white sand beach. Crystal clear turquoise water waves gently lapping. Paradise aesthetic. 8K resolution."
    ],
    creatomateTemplateId: '70f6563a-d3ce-47f5-90a0-34d40663881e',
    price: 29
  }
];

export const getTemplateById = (id: string): ReelTemplate | undefined => {
  return REEL_TEMPLATES.find(t => t.id === id);
};
