import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { 
  AdProductionState, 
  ProductionPhase,
  DirectorTreatment,
  Keyframe,
  VideoShot,
  AudioAssets,
  BrandArchetype,
  TargetEmotion,
  INITIAL_PRODUCTION_PHASES 
} from '@/types/adProduction';
import type { AdInputs } from '@/types';

const createInitialPhases = (): ProductionPhase[] => [
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

interface UseAdProductionOptions {
  onPhaseChange?: (phase: string) => void;
  onComplete?: (output: AdProductionState['finalOutput']) => void;
  onError?: (error: string) => void;
}

export function useAdProduction(options: UseAdProductionOptions = {}) {
  const [state, setState] = useState<AdProductionState>({
    phase: 'idle',
    phases: createInitialPhases(),
    keyframes: [],
    videoShots: [],
  });

  const updatePhase = useCallback((phaseId: string, updates: Partial<ProductionPhase>) => {
    setState(prev => ({
      ...prev,
      phases: prev.phases.map(p => 
        p.id === phaseId ? { ...p, ...updates } : p
      )
    }));
  }, []);

  const setPhaseStatus = useCallback((phaseId: string, status: ProductionPhase['status'], substep?: string) => {
    updatePhase(phaseId, { 
      status, 
      currentSubstep: substep,
      progress: status === 'complete' ? 100 : status === 'active' ? 50 : 0
    });
  }, [updatePhase]);

  const startProduction = useCallback(async (
    inputs: AdInputs,
    archetype: BrandArchetype,
    emotion: TargetEmotion
  ) => {
    // Reset state
    setState({
      phase: 'briefing',
      phases: createInitialPhases(),
      keyframes: [],
      videoShots: [],
      briefing: {
        brandArchetype: archetype,
        targetEmotion: emotion,
        coreConflict: '',
        transformation: '',
        productDNA: '',
        referenceImages: inputs.productImages,
      }
    });

    options.onPhaseChange?.('briefing');

    try {
      // Phase 1: Generate Director's Treatment
      setPhaseStatus('briefing', 'active', 'Analyzing brand archetype');
      await new Promise(r => setTimeout(r, 500));
      setPhaseStatus('briefing', 'active', 'Mapping emotional journey');
      await new Promise(r => setTimeout(r, 500));
      setPhaseStatus('briefing', 'complete');

      // Phase 2: Treatment
      setState(prev => ({ ...prev, phase: 'treatment' }));
      options.onPhaseChange?.('treatment');
      setPhaseStatus('treatment', 'active', 'Creating visual anchor');

      const treatmentResponse = await supabase.functions.invoke('generate-treatment', {
        body: {
          businessType: inputs.businessType,
          brandName: inputs.brandName || inputs.productName,
          productName: inputs.productName,
          description: inputs.description,
          brandArchetype: archetype,
          targetEmotion: emotion,
          mood: inputs.mood,
          audience: inputs.audience,
          productImages: inputs.productImages.slice(0, 3),
        }
      });

      if (treatmentResponse.error) {
        throw new Error(treatmentResponse.error.message);
      }

      const treatment: DirectorTreatment = treatmentResponse.data.treatment;
      setState(prev => ({ ...prev, treatment }));
      
      setPhaseStatus('treatment', 'active', 'Scripting 3-act structure');
      await new Promise(r => setTimeout(r, 800));
      setPhaseStatus('treatment', 'active', 'Defining cinematic specs');
      await new Promise(r => setTimeout(r, 500));
      setPhaseStatus('treatment', 'complete');

      // Phase 3: Generate Keyframes
      setState(prev => ({ ...prev, phase: 'keyframing' }));
      options.onPhaseChange?.('keyframing');

      const keyframes: Keyframe[] = [];
      const referenceImage = inputs.productImages[0] || null;

      for (let i = 0; i < 3; i++) {
        const actSpec = treatment.acts[i];
        setPhaseStatus('keyframing', 'active', `Rendering Act ${i + 1} keyframe`);
        updatePhase('keyframing', { progress: Math.round((i / 3) * 100) });

        const keyframeResponse = await supabase.functions.invoke('generate-keyframe', {
          body: {
            actNumber: i + 1,
            visualAnchor: treatment.visualAnchor,
            actSpec: actSpec,
            referenceImage: referenceImage,
            brandName: inputs.brandName || inputs.productName,
            businessType: inputs.businessType,
          }
        });

        if (keyframeResponse.error) {
          console.error(`Keyframe ${i + 1} error:`, keyframeResponse.error);
          // Continue with next keyframe
          continue;
        }

        keyframes.push(keyframeResponse.data.keyframe);
        setState(prev => ({ ...prev, keyframes: [...prev.keyframes, keyframeResponse.data.keyframe] }));
      }

      setPhaseStatus('keyframing', 'complete');

      // Phase 4: Generate Video Shots
      setState(prev => ({ ...prev, phase: 'video' }));
      options.onPhaseChange?.('video');

      const videoShots: VideoShot[] = [];

      for (let i = 0; i < keyframes.length; i++) {
        const keyframe = keyframes[i];
        const actSpec = treatment.acts[i];
        
        setPhaseStatus('video', 'active', `Animating Act ${i + 1}`);
        updatePhase('video', { progress: Math.round((i / 3) * 100) });

        const videoResponse = await supabase.functions.invoke('generate-video-shot', {
          body: {
            actNumber: i + 1,
            keyframeImageUrl: keyframe.imageUrl,
            cameraMovement: actSpec.cameraMovement,
            duration: actSpec.duration,
            narrativeGoal: actSpec.narrativeGoal,
            actTitle: actSpec.title,
          }
        });

        if (videoResponse.error) {
          console.error(`Video ${i + 1} error:`, videoResponse.error);
          // Continue with next video
          continue;
        }

        videoShots.push(videoResponse.data.videoShot);
        setState(prev => ({ ...prev, videoShots: [...prev.videoShots, videoResponse.data.videoShot] }));
      }

      setPhaseStatus('video', 'complete');

      // Phase 5: Generate Voiceover
      setState(prev => ({ ...prev, phase: 'audio' }));
      options.onPhaseChange?.('audio');
      setPhaseStatus('audio', 'active', 'Generating voiceover');

      const scripts = treatment.acts.map(act => act.voiceoverScript);
      
      const voiceoverResponse = await supabase.functions.invoke('generate-voiceover', {
        body: {
          scripts,
          brandTone: inputs.mood === 'corporate' ? 'professional' : 
                     inputs.mood === 'high_energy' ? 'energetic' :
                     inputs.mood === 'emotional' ? 'warm' : 'sophisticated'
        }
      });

      if (voiceoverResponse.error) {
        throw new Error(voiceoverResponse.error.message);
      }

      const audio: AudioAssets = voiceoverResponse.data.audio;
      setState(prev => ({ ...prev, audio }));
      
      setPhaseStatus('audio', 'active', 'Syncing narration');
      await new Promise(r => setTimeout(r, 500));
      setPhaseStatus('audio', 'complete');

      // Phase 6: Master Video with Creatomate
      setState(prev => ({ ...prev, phase: 'mastering' }));
      options.onPhaseChange?.('mastering');
      setPhaseStatus('mastering', 'active', 'Compositing acts');

      const totalDuration = treatment.acts.reduce((sum, act) => sum + act.duration, 0);
      const videoUrls = videoShots.map(vs => vs.videoUrl);

      if (videoUrls.length === 0) {
        throw new Error("No videos were generated successfully");
      }

      const masterResponse = await supabase.functions.invoke('master-video', {
        body: {
          videoUrls,
          voiceoverUrl: audio.voiceoverUrl,
          brandLogo: inputs.brandLogo,
          brandName: inputs.brandName || inputs.productName,
          duration: totalDuration,
        }
      });

      if (masterResponse.error) {
        throw new Error(masterResponse.error.message);
      }

      setPhaseStatus('mastering', 'active', 'Adding logo overlay');
      await new Promise(r => setTimeout(r, 300));
      setPhaseStatus('mastering', 'active', 'Exporting 4K master');
      await new Promise(r => setTimeout(r, 300));
      setPhaseStatus('mastering', 'complete');

      // Complete!
      const finalOutput = {
        masterVideoUrl: masterResponse.data.masterVideo.videoUrl,
        thumbnailUrl: keyframes[0]?.imageUrl || '',
        duration: totalDuration,
        resolution: '1920x1080',
        acts: keyframes.map((kf, i) => ({
          actNumber: i + 1,
          videoUrl: videoShots[i]?.videoUrl || '',
          keyframeUrl: kf.imageUrl,
        }))
      };

      setState(prev => ({ 
        ...prev, 
        phase: 'complete',
        finalOutput 
      }));

      options.onComplete?.(finalOutput);

      toast({
        title: "Production Complete!",
        description: "Your Hollywood-grade advertisement is ready.",
      });

    } catch (error) {
      console.error('Production error:', error);
      const message = error instanceof Error ? error.message : 'Production failed';
      
      setState(prev => ({ ...prev, phase: 'error', error: message }));
      options.onError?.(message);

      toast({
        title: "Production Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [options, setPhaseStatus, updatePhase]);

  const reset = useCallback(() => {
    setState({
      phase: 'idle',
      phases: createInitialPhases(),
      keyframes: [],
      videoShots: [],
    });
  }, []);

  return {
    state,
    startProduction,
    reset,
    isProducing: !['idle', 'complete', 'error'].includes(state.phase),
  };
}
