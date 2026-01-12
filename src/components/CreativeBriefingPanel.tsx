import { useState } from 'react';
import { Sparkles, Flame, Heart, Lightbulb, Smile, Zap, Cloud, Star } from 'lucide-react';
import type { BrandArchetype, TargetEmotion } from '@/types/adProduction';
import { BRAND_ARCHETYPES, TARGET_EMOTIONS } from '@/types/adProduction';

interface CreativeBriefingPanelProps {
  archetype: BrandArchetype;
  emotion: TargetEmotion;
  onArchetypeChange: (archetype: BrandArchetype) => void;
  onEmotionChange: (emotion: TargetEmotion) => void;
}

const emotionIcons: Record<TargetEmotion, React.ElementType> = {
  awe: Star,
  joy: Smile,
  trust: Heart,
  desire: Flame,
  nostalgia: Cloud,
  excitement: Zap,
  serenity: Cloud,
  inspiration: Lightbulb,
};

export function CreativeBriefingPanel({
  archetype,
  emotion,
  onArchetypeChange,
  onEmotionChange,
}: CreativeBriefingPanelProps) {
  const [expanded, setExpanded] = useState<'archetype' | 'emotion' | null>(null);

  return (
    <div className="w-full glass-card p-6 lg:p-8 card-shadow space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Creative Briefing</h3>
          <p className="text-xs text-muted-foreground">Define your brand's psychological identity</p>
        </div>
      </div>

      {/* Brand Archetype Selection */}
      <div className="space-y-4">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/30">
          Brand Archetype
        </label>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {BRAND_ARCHETYPES.map((arch) => (
            <button
              key={arch.id}
              onClick={() => onArchetypeChange(arch.id)}
              className={`
                relative p-3 rounded-xl text-left transition-all group
                ${archetype === arch.id
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'bg-card/50 hover:bg-card border border-foreground/5 hover:border-foreground/10'
                }
              `}
            >
              <span className={`text-xs font-bold block truncate ${
                archetype === arch.id ? '' : 'text-foreground/70'
              }`}>
                {arch.label}
              </span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {arch.description}
              </div>
            </button>
          ))}
        </div>
        
        {/* Selected archetype description */}
        <p className="text-sm text-muted-foreground">
          {BRAND_ARCHETYPES.find(a => a.id === archetype)?.description}
        </p>
      </div>

      {/* Target Emotion Selection */}
      <div className="space-y-4">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/30">
          Target Emotion
        </label>
        
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {TARGET_EMOTIONS.map((em) => {
            const Icon = emotionIcons[em.id];
            return (
              <button
                key={em.id}
                onClick={() => onEmotionChange(em.id)}
                className={`
                  relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all group
                  ${emotion === em.id
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'bg-card/50 hover:bg-card border border-foreground/5 hover:border-foreground/10'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${emotion === em.id ? '' : 'text-foreground/50'}`} />
                <span className={`text-[10px] font-bold ${emotion === em.id ? '' : 'text-foreground/70'}`}>
                  {em.label}
                </span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {em.description}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Selected emotion description */}
        <p className="text-sm text-muted-foreground">
          {TARGET_EMOTIONS.find(e => e.id === emotion)?.description}
        </p>
      </div>
    </div>
  );
}
