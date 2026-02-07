# Precision-Controlled Reel Generation System

## Overview

A template-driven system where each shot knows exactly which inputs (images/text) to use for maximum AI accuracy. Templates define their own input requirements and shot-to-input mappings.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         TEMPLATE SCHEMA                          │
├─────────────────────────────────────────────────────────────────┤
│  inputs: [                                                       │
│    { id: 'person_a', type: 'image', label: 'Your Photo' },      │
│    { id: 'person_b', type: 'image', label: 'Partner Photo' },   │
│    { id: 'tagline',  type: 'text',  label: 'Brand Tagline' }    │
│  ]                                                               │
│                                                                  │
│  shots: [                                                        │
│    { id: 1, prompt: '...', useInputs: ['person_a'] },           │
│    { id: 2, prompt: '...', useInputs: ['person_b'] },           │
│    { id: 3, prompt: '...', useInputs: ['person_a', 'person_b'] }│
│  ]                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DYNAMIC UI GENERATION                       │
├─────────────────────────────────────────────────────────────────┤
│  ReferenceInputCollector reads template.inputs and renders:     │
│  - ImageUploader for type: 'image'                              │
│  - TextInput for type: 'text'                                   │
│  - Labels from template definition                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SHOT-SPECIFIC GENERATION                      │
├─────────────────────────────────────────────────────────────────┤
│  For each shot:                                                  │
│  1. Read shot.useInputs array                                   │
│  2. Collect ONLY mapped references (images/text)                │
│  3. Send to generate-image with targeted context                │
│  4. AI receives precise inputs → Higher accuracy                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Type Definitions

```typescript
// src/types/index.ts

interface TemplateInput {
  id: string;           // Unique identifier: 'person_a', 'product_image'
  type: 'image' | 'text';
  label: string;        // UI label: 'Your Photo', 'Brand Tagline'
  description?: string; // Help text for user
  required?: boolean;   // Default true
}

interface TemplateShot {
  id: number;
  prompt: string;           // Image generation prompt
  videoPrompt: string;      // Video generation prompt
  useInputs: string[];      // Maps to TemplateInput.id
}

interface ReelTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  previewVideo?: string;
  
  // NEW: Precision control
  inputs: TemplateInput[];
  shots: TemplateShot[];
  
  // Creatomate
  creatomateTemplateId: string;
  price: number;
}

// User-collected data structure
interface CollectedInputs {
  [inputId: string]: string; // inputId -> base64 image or text value
}
```

---

## Example Templates

### Template 1: Car Sinking (1 image input)
```typescript
{
  id: 'car-sinking',
  name: 'Car Sinking Scene',
  inputs: [
    { id: 'car_image', type: 'image', label: 'Your Car Photo' }
  ],
  shots: [
    { 
      id: 1, 
      prompt: 'Underwater shot of car floating...', 
      videoPrompt: 'Cinematic slow-motion underwater...', 
      useInputs: ['car_image'] 
    },
    { 
      id: 2, 
      prompt: 'Close-up of front wheel underwater...', 
      videoPrompt: 'Camera movement around wheel...', 
      useInputs: ['car_image'] 
    },
    { 
      id: 3, 
      prompt: 'Back view of car underwater...', 
      videoPrompt: 'Dramatic lighting from above...', 
      useInputs: ['car_image'] 
    }
  ]
}
```

### Template 2: Couple Romance (2 image inputs)
```typescript
{
  id: 'couple-romance',
  name: 'Couple Romance Reel',
  inputs: [
    { id: 'person_a', type: 'image', label: 'Person 1 Photo' },
    { id: 'person_b', type: 'image', label: 'Person 2 Photo' }
  ],
  shots: [
    { 
      id: 1, 
      prompt: 'Cinematic portrait of person looking at sunset...', 
      videoPrompt: 'Gentle breeze, hair movement...', 
      useInputs: ['person_a']  // Only Person A
    },
    { 
      id: 2, 
      prompt: 'Romantic close-up of person smiling...', 
      videoPrompt: 'Soft lighting transition...', 
      useInputs: ['person_b']  // Only Person B
    },
    { 
      id: 3, 
      prompt: 'Both people together in romantic setting...', 
      videoPrompt: 'Camera pulls back to reveal both...', 
      useInputs: ['person_a', 'person_b']  // Both people
    }
  ]
}
```

### Template 3: Product Launch (1 image + 1 text)
```typescript
{
  id: 'product-launch',
  name: 'Product Launch Reveal',
  inputs: [
    { id: 'product_image', type: 'image', label: 'Product Photo' },
    { id: 'tagline', type: 'text', label: 'Brand Tagline' }
  ],
  shots: [
    { 
      id: 1, 
      prompt: 'Dramatic product reveal with luxury lighting. Text overlay: {tagline}', 
      videoPrompt: 'Slow reveal with particle effects...', 
      useInputs: ['product_image', 'tagline'] 
    },
    // ...
  ]
}
```

---

## Generation Flow

### Step 1: Collect Inputs (Dynamic UI)
```typescript
// ReferenceInputCollector.tsx
const ReferenceInputCollector = ({ template, onComplete }) => {
  const [inputs, setInputs] = useState<CollectedInputs>({});
  
  return (
    <div>
      {template.inputs.map(input => (
        input.type === 'image' 
          ? <ImageUploader key={input.id} label={input.label} ... />
          : <TextInput key={input.id} label={input.label} ... />
      ))}
    </div>
  );
};
```

### Step 2: Generate Images (Shot-Specific)
```typescript
// For each shot, send ONLY the mapped inputs
const generateShot = async (shot: TemplateShot, allInputs: CollectedInputs) => {
  // Extract only the inputs this shot needs
  const shotInputs = {
    images: shot.useInputs
      .filter(id => template.inputs.find(i => i.id === id)?.type === 'image')
      .map(id => allInputs[id]),
    texts: shot.useInputs
      .filter(id => template.inputs.find(i => i.id === id)?.type === 'text')
      .reduce((acc, id) => ({ ...acc, [id]: allInputs[id] }), {})
  };
  
  // Send precise context to AI
  await supabase.functions.invoke('generate-image', {
    body: {
      prompt: interpolatePrompt(shot.prompt, shotInputs.texts),
      referenceImages: shotInputs.images,  // Only relevant images
      shotId: shot.id
    }
  });
};
```

### Step 3: Edge Function (Precision Context)
```typescript
// supabase/functions/generate-image/index.ts
const content = [
  {
    type: 'text',
    text: `Generate an image. Use ONLY the provided reference images.
    
    ${referenceImages.length === 1 
      ? 'The image should feature the subject from the reference photo.'
      : `Combine the ${referenceImages.length} people from the references into one scene.`
    }
    
    Description: ${prompt}`
  },
  // Add only the mapped reference images
  ...referenceImages.map(img => ({
    type: 'image_url',
    image_url: { url: img }
  }))
];
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `TemplateInput`, `TemplateShot`, update `ReelTemplate` |
| `src/data/templates.ts` | Migrate to new schema with `inputs` and `shots` |
| `src/components/ReferenceInputCollector.tsx` | NEW: Dynamic input UI component |
| `src/components/ReferenceImageUpload.tsx` | Deprecate or adapt to use new collector |
| `src/pages/Index.tsx` | Update state management for `CollectedInputs` |
| `supabase/functions/generate-image/index.ts` | Handle shot-specific context |

---

## Benefits

1. **Accuracy**: AI receives only relevant references per shot
2. **Flexibility**: Templates define their own input requirements
3. **Scalability**: Easy to add templates with 1, 2, 5+ inputs
4. **Mixed Inputs**: Support for images AND text in same template
5. **User Experience**: Dynamic UI adapts to template needs

---

## Current Status

- [x] VEO_API_KEY configured
- [x] generate-video function updated for Veo 3
- [x] VideoComposing UI with per-video progress
- [ ] Type definitions for precision templates
- [ ] Dynamic input collector component
- [ ] Template schema migration
- [ ] Shot-specific generation logic
- [ ] Edge function update for precision context
