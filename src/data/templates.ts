import type { ReelTemplate } from '@/types';

export const REEL_TEMPLATES: ReelTemplate[] = [
  {
    id: 'car-sinking',
    name: 'Car Sinking Scene',
    description: 'Dramatic underwater shots - viral car sinking effect',
    thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=600&fit=crop',
    previewVideo: 'https://res.cloudinary.com/dkr5qwdjd/video/upload/br_5016k,q_33,vc_h264/v1768843383/carsinking.mov',
    inputs: [
      {
        id: 'car-photo',
        type: 'image',
        label: 'Your Car Photo',
        description: 'Upload a clear photo of your car (side or 3/4 angle)',
        required: true
      }
    ],
    shots: [
      {
        id: 1,
        prompt: "Hyper-realistic underwater shot of a the car in reference image floating in dark blue ocean water like a spaceship. Three-quarter front view of the whole car, headlights, spoiler and body lines clearly visible. Dynamic, shimmering sun-ray caustics dance and ripple across the car hood and roof. Trails of small, distinct air bubbles rise lazily from the rear of the chassis. The lighting is dramatic and moody with deep shadows, clear beams of light from above, tiny particles in the water for atmosphere. High-end cinematic look, ultra-detailed, 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "A cinematic slow-motion underwater video shot of the car mostly stays on place, dark blue ocean water. The camera performs a very very slow hand handled movement. Dynamic, shimmering sun-ray caustics dance and ripple realistically across the cars hood and roof. Trails of small, distinct air bubbles rise lazily and slowly upwards from the rear of the chassis. The video consists of two separate shots, each approximately 3 seconds long, captured from clearly different camera angles., The lighting is dramatic and moody, with deep shadows. Raw high-end underwater cinematography, 8k resolution.",
        useInputs: ['car-photo']
      },
      {
        id: 2,
        prompt: "Ultra-realistic underwater photo of a car in the reference image. Extreme close-up of the front wheel and fender, slightly tilted, as if the car is diving underwater. The wheel rim and tire are sharp and detailed, wet metal and rubber with realistic reflections. Surround the wheel with floating dust and sand particles, tiny air bubbles and subtle scratches on the body. Strong sun rays shining from the water surface above, blue-green ambient light, cinematic contrast, shallow depth of field, bokeh in the background. Hyper-detailed, 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "A cinematic slow-motion underwater video shot of the car mostly stays on place, dark blue ocean water. The camera performs a very very slow hand handled movement. Dynamic, shimmering sun-ray caustics dance and ripple realistically across the cars hood and roof. Trails of small, distinct air bubbles rise lazily and slowly upwards from the rear of the chassis. The video consists of two separate shots, each approximately 3 seconds long, captured from clearly different camera angles., The lighting is dramatic and moody, with deep shadows. Raw high-end underwater cinematography, 8k resolution.",
        useInputs: ['car-photo']
      },
      {
        id: 3,
        prompt: "Hyper-realistic underwater shot of a car floating in dark blue ocean water like a spaceship. Three-quarter back view of the whole car, backlights, spoiler and body lines clearly visible. Dynamic, shimmering sun-ray caustics dance and ripple across the cars hood and roof. Trails of small, distinct air bubbles rise lazily from the rear of the chassis. The lighting is dramatic and moody with deep shadows, clear beams of light from above, tiny particles in the water for atmosphere. High-end cinematic look, ultra-detailed, 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "A cinematic slow-motion underwater video shot of the car mostly stays on place, dark blue ocean water. The camera performs a very very slow hand handled movement. Dynamic, shimmering sun-ray caustics dance and ripple realistically across the cars hood and roof. Trails of small, distinct air bubbles rise lazily and slowly upwards from the rear of the chassis. The video consists of two separate shots, each approximately 3 seconds long, captured from clearly different camera angles., The lighting is dramatic and moody, with deep shadows. Raw high-end underwater cinematography, 8k resolution.",
        useInputs: ['car-photo']
      }
    ],
    likes: 2847,
    usedCount: 12543,
    uploadTips: [
      'Use a clear, well-lit photo of your car',
      'Side or 3/4 angle works best',
      'Avoid photos with busy backgrounds'
    ],
    creatomateTemplateId: '70f6563a-d3ce-47f5-90a0-34d40663881e',
    price: 29
  },
  {
    id: 'tokyo-drift',
    name: 'Tokyo Drift AI',
    description: 'Replace yourself into iconic Tokyo Drift scenes with AI',
    thumbnail: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&h=600&fit=crop',
    inputs: [
      {
        id: 'face-photo',
        type: 'image',
        label: 'Your Face Photo',
        description: 'Clear front-facing selfie, good lighting, no sunglasses',
        required: true
      }
    ],
    shots: [
      {
        id: 1,
        prompt: "Hyper-realistic cinematic photo of person from reference image standing in a neon-lit Tokyo street at night, wearing a leather racing jacket. Rain-slicked roads reflect pink and blue neon signs. Cars parked along narrow alley. Shot from waist up, dramatic lighting, shallow depth of field. 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "Cinematic slow-motion video of person standing in neon-lit Tokyo street. Gentle rain falls, neon reflections shimmer on wet ground. Camera slowly dollies forward. 8k resolution, vertical 9:16.",
        useInputs: ['face-photo'],
        presetReferenceImages: [
          'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=1200&fit=crop'
        ]
      },
      {
        id: 2,
        prompt: "Ultra-realistic photo of person from reference sitting inside a JDM sports car cockpit at night. Dashboard gauges glowing, steering wheel visible. Through the windshield, blurred Tokyo neon lights streak past. Dramatic cinematic lighting from dashboard and exterior neons. Close-up portrait, moody atmosphere. 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "Cinematic video inside car cockpit at night. Neon lights streak past windshield. Dashboard gauges glow. Camera slowly pans from dashboard to driver face. 8k, vertical 9:16.",
        useInputs: ['face-photo'],
        presetReferenceImages: [
          'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&h=1200&fit=crop'
        ]
      },
      {
        id: 3,
        prompt: "Hyper-realistic photo of person from reference leaning against a modified JDM drift car on a mountain road at dawn. Car has wide body kit, big spoiler. Misty mountains in background. Golden hour light hitting scene. Full body shot, cinematic composition. 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "Cinematic video of person leaning on drift car at mountain road dawn. Mist rolls through mountains. Golden light. Camera slowly orbits around subject. 8k, vertical 9:16.",
        useInputs: ['face-photo'],
        presetReferenceImages: [
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=1200&fit=crop'
        ]
      }
    ],
    likes: 5420,
    usedCount: 23100,
    uploadTips: [
      'Use a clear front-facing selfie',
      'Good lighting, avoid heavy shadows',
      'No sunglasses or face coverings'
    ],
    creatomateTemplateId: '',
    price: 29
  },
  {
    id: 'couple-romance',
    name: 'Couple Romantic Reel',
    description: 'AI transforms your couple photo into cinematic romantic scenes',
    thumbnail: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=400&h=600&fit=crop',
    inputs: [
      {
        id: 'couple-photo-1',
        type: 'image',
        label: 'Couple Photo 1',
        description: 'A clear photo of both of you together',
        required: true
      },
      {
        id: 'couple-photo-2',
        type: 'image',
        label: 'Couple Photo 2',
        description: 'Another angle or different pose together',
        required: true
      }
    ],
    shots: [
      {
        id: 1,
        prompt: "Hyper-realistic cinematic photo of the couple from reference images walking hand in hand on a beach at golden hour sunset. Waves gently lapping at their feet. Warm golden light. Shot from behind, silhouette style. Dreamy bokeh. 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "Cinematic slow-motion video of couple walking on beach at sunset. Golden hour light, gentle waves. Camera follows from behind. 8k, vertical 9:16.",
        useInputs: ['couple-photo-1', 'couple-photo-2']
      },
      {
        id: 2,
        prompt: "Ultra-realistic photo of the couple from reference dancing in a grand ballroom with crystal chandeliers. Elegant formal attire. Soft warm lighting, flower petals falling. Wide shot showing ornate architecture. Romantic atmosphere. 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "Cinematic video of couple dancing in grand ballroom. Crystal chandeliers sparkle. Petals fall gently. Camera slowly circles around couple. 8k, vertical 9:16.",
        useInputs: ['couple-photo-1']
      },
      {
        id: 3,
        prompt: "Hyper-realistic photo of the couple from reference sitting at a rooftop cafe in Paris with Eiffel Tower visible behind them. Evening lights twinkling. Cozy atmosphere with candles on table. Candid laughing pose. 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "Cinematic video of couple at Parisian rooftop cafe. Eiffel Tower sparkles in background. Candlelight flickers. Camera slowly pushes in. 8k, vertical 9:16.",
        useInputs: ['couple-photo-1', 'couple-photo-2']
      },
      {
        id: 4,
        prompt: "Ultra-realistic photo of the couple from reference under cherry blossom trees in full bloom. Pink petals falling around them. Soft diffused natural light. Close-up portrait, both looking at each other. Dreamy romantic mood. 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "Cinematic slow-motion video under cherry blossom trees. Pink petals drift down. Couple embraces. Camera tilts up through blossoms. 8k, vertical 9:16.",
        useInputs: ['couple-photo-2']
      }
    ],
    likes: 8930,
    usedCount: 34200,
    uploadTips: [
      'Use clear photos where both faces are visible',
      'Good lighting, natural expressions',
      'Avoid group photos - just the two of you'
    ],
    creatomateTemplateId: '',
    price: 29
  },
  {
    id: 'product-luxury',
    name: 'Luxury Product Showcase',
    description: 'Transform your product into a premium cinematic ad',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=600&fit=crop',
    inputs: [
      {
        id: 'product-image',
        type: 'image',
        label: 'Product Photo',
        description: 'Clear product photo on plain background',
        required: true
      },
      {
        id: 'brand-name',
        type: 'text',
        label: 'Brand Name',
        description: 'Your brand or product name',
        required: true
      }
    ],
    shots: [
      {
        id: 1,
        prompt: "Ultra-realistic luxury product photography of product from reference image floating in mid-air against a black marble background. Dramatic studio lighting with golden rim light. Water droplets suspended around product. Premium advertising look. 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "Cinematic product video on black marble. Product slowly rotates in mid-air. Golden rim lighting. Water droplets catch light. 8k, vertical 9:16.",
        useInputs: ['product-image']
      },
      {
        id: 2,
        prompt: "Hyper-realistic product shot of product from reference placed on a golden silk fabric surface. Soft warm lighting from above. Rose petals scattered around. Luxurious premium feel. Extreme close-up macro detail. 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "Cinematic macro video of product on golden silk. Camera slowly glides across surface detail. Warm light shifts. 8k, vertical 9:16.",
        useInputs: ['product-image']
      },
      {
        id: 3,
        prompt: "Ultra-realistic cinematic photo of product from reference in a luxurious setting - marble countertop, golden accessories, soft bokeh lights in background. High-end brand advertising style. Magazine-quality composition. 4K, vertical 9:16, photoreal, no text.",
        videoPrompt: "Cinematic product reveal video in luxury setting. Camera pulls back to reveal product on marble surface. Bokeh lights sparkle. 8k, vertical 9:16.",
        useInputs: ['product-image']
      }
    ],
    likes: 3150,
    usedCount: 9800,
    uploadTips: [
      'Use a product photo on clean/white background',
      'Make sure the product is well-lit and sharp',
      'Multiple angles help get better results'
    ],
    creatomateTemplateId: '',
    price: 29
  }
];

export const getTemplateById = (id: string): ReelTemplate | undefined => {
  return REEL_TEMPLATES.find(t => t.id === id);
};
