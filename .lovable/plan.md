

# Veo 3 Video Generation + Creatomate Workflow Implementation

## Overview

This plan updates the video generation pipeline to use **Google Veo 3** for image-to-video conversion, then compose the final reel using the **Creatomate API** with your specific template.

## Current Workflow

```text
+----------------+    +------------------+    +---------------+    +----------------+
| Image Upload   | -> | AI Image Gen     | -> | Image Review  | -> | Payment Gate   |
| (Reference)    |    | (Gemini Pro)     |    | (Free)        |    | (Razorpay)     |
+----------------+    +------------------+    +---------------+    +----------------+
                                                                           |
                                                                           v
+----------------+    +------------------+    +------------------+
| Final Reel     | <- | Creatomate       | <- | Video Gen        |
| (Download)     |    | (Composition)    |    | (Not working)    |
+----------------+    +------------------+    +------------------+
```

**Current Issues:**
1. The `generate-video` edge function tries to use Lovable AI Gateway for video, but it doesn't support Veo 3 natively
2. Videos fall back to static images as placeholders
3. Creatomate receives images instead of actual video clips

## Proposed Workflow

```text
+----------------+    +------------------+    +---------------+    +----------------+
| Image Upload   | -> | AI Image Gen     | -> | Image Review  | -> | Payment Gate   |
| (Reference)    |    | (Gemini 3 Pro)   |    | (Free)        |    | (Razorpay)     |
+----------------+    +------------------+    +---------------+    +----------------+
                                                                           |
                                                                           v
+----------------+    +------------------+    +------------------+
| Final Reel     | <- | Creatomate       | <- | Veo 3 Video Gen  |
| (Download)     |    | Template:        |    | (Image-to-Video) |
+----------------+    | 70f6563a-d3ce... |    +------------------+
                      +------------------+
```

---

## Implementation Steps

### Step 1: Add Google Cloud / Veo 3 API Secret

**Why:** Veo 3 requires Google Cloud Vertex AI credentials or a third-party API key

**Options:**
- **Option A (Recommended):** Use Google Cloud Vertex AI with a Service Account key
- **Option B:** Use a third-party Veo 3 API gateway (like aimlapi.com)

**Action:** Request API credentials from user via `add_secret` tool

---

### Step 2: Update `generate-video` Edge Function

**File:** `supabase/functions/generate-video/index.ts`

**Current:** Attempts to use Lovable AI Gateway (doesn't support video generation)

**New Implementation:**

```typescript
// Use Veo 3 for image-to-video generation
// Two-step process:
// 1. Submit generation task (returns operation ID)
// 2. Poll for completion (returns video URL)

const VEO_API = 'https://api.aimlapi.com/v2/video/generations';

// Step 1: Create video generation task
const response = await fetch(VEO_API, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VEO_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/veo-3.0-i2v',  // Image-to-Video model
    prompt: prompt,
    image_url: imageUrl,          // Source image
    aspect_ratio: '9:16',         // Vertical for reels
    duration: 4                   // 4 seconds per clip
  })
});

// Step 2: Poll for completion
// Returns { videoUrl: '...' } when done
```

---

### Step 3: Update `compose-reel` Edge Function

**File:** `supabase/functions/compose-reel/index.ts`

**Current:** Already correctly configured for Creatomate

**Verification:**
- Template ID: `70f6563a-d3ce-47f5-90a0-34d40663881e` (matches your template)
- Modifications: `video_1.source`, `video_2.source`, `video_3.source`
- CREATOMATE_API_KEY is already configured

**Minor Update:** Add better error handling and logging

---

### Step 4: Update Frontend Video Generation Flow

**File:** `src/pages/Index.tsx`

**Changes:**
- Update `generateVideos()` function to handle async Veo 3 response
- Add individual video progress tracking (so users see each video generating)
- Better error handling for video generation failures

---

### Step 5: Enhance VideoComposing UI

**File:** `src/components/VideoComposing.tsx`

**Add:**
- Individual video generation progress (Video 1 generating, Video 2 generating, etc.)
- Show generated videos as they complete
- Better visual feedback during the ~60-120 second video generation process

---

## Technical Details

### Veo 3 API Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `model` | `google/veo-3.0-i2v` | Image-to-Video model |
| `prompt` | From template videoPrompts | Scene description |
| `image_url` | Generated image URL | Source image |
| `aspect_ratio` | `9:16` | Vertical for reels |
| `duration` | `4` | Seconds per clip |

### Creatomate Template Mapping

Your template expects 3 videos in these slots:

| Slot | Edge Function | Source |
|------|---------------|--------|
| `video_1.source` | Veo 3 output 1 | Generated image 1 |
| `video_2.source` | Veo 3 output 2 | Generated image 2 |
| `video_3.source` | Veo 3 output 3 | Generated image 3 |

---

## API Key Requirements

**Needed Secret:**
| Secret Name | Provider | Purpose |
|-------------|----------|---------|
| `VEO_API_KEY` | AIML API or Google Cloud | Veo 3 video generation |

**Already Configured:**
- `CREATOMATE_API_KEY` - For final reel composition
- `LOVABLE_API_KEY` - For image generation (Gemini 3 Pro)

---

## Timeline Estimate

| Step | Duration |
|------|----------|
| Add Veo 3 API secret | User action |
| Update generate-video function | 10 mins |
| Update compose-reel function | 5 mins |
| Update frontend flow | 10 mins |
| Enhance VideoComposing UI | 10 mins |
| Testing | 15 mins |

**Total:** ~50 minutes of development

---

## Expected User Experience

1. User selects template and uploads reference image
2. AI generates 3 themed images (FREE) - ~30 seconds
3. User reviews and regenerates any shots
4. User pays via Razorpay
5. **NEW:** Veo 3 converts each image to 4-second video clips (~60-90 seconds)
6. Creatomate composes final reel with transitions (~30 seconds)
7. User downloads viral-ready reel

---

## Risk Mitigation

**Veo 3 Generation Time:** Videos take 30-60 seconds each
- **Solution:** Generate all 3 in parallel, show individual progress

**Video URL Expiration:** Veo 3 URLs may expire
- **Solution:** Pass URLs immediately to Creatomate

**Cost Considerations:** Veo 3 is paid per video
- **Solution:** Payment gate ensures cost is covered before video generation

