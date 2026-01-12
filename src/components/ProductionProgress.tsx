import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Circle, Film, Sparkles, Volume2, Clapperboard, Palette, Mic } from 'lucide-react';
import type { ProductionPhase, AdProductionState, Keyframe } from '@/types/adProduction';

interface ProductionProgressProps {
  state: AdProductionState;
}

const phaseIcons: Record<string, React.ElementType> = {
  briefing: Sparkles,
  treatment: Clapperboard,
  keyframing: Palette,
  video: Film,
  audio: Mic,
  mastering: Volume2,
};

function PhaseCard({ phase, isActive, keyframes }: { 
  phase: ProductionPhase; 
  isActive: boolean;
  keyframes?: Keyframe[];
}) {
  const Icon = phaseIcons[phase.id] || Circle;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden rounded-2xl border p-6 transition-all duration-500
        ${isActive 
          ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10' 
          : phase.status === 'complete'
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-foreground/5 bg-card/30'
        }
      `}
    >
      {/* Progress bar */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-foreground/5">
        <motion.div 
          className={`h-full ${phase.status === 'complete' ? 'bg-emerald-500' : 'bg-primary'}`}
          initial={{ width: 0 }}
          animate={{ width: `${phase.progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex items-start gap-4">
        {/* Status icon */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          ${isActive 
            ? 'bg-primary text-primary-foreground' 
            : phase.status === 'complete'
              ? 'bg-emerald-500/20 text-emerald-500'
              : 'bg-foreground/5 text-foreground/30'
          }
        `}>
          {phase.status === 'complete' ? (
            <Check className="w-5 h-5" />
          ) : isActive ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm ${
            isActive ? 'text-foreground' : 
            phase.status === 'complete' ? 'text-emerald-600' : 'text-foreground/40'
          }`}>
            {phase.name}
          </h3>
          
          <AnimatePresence mode="wait">
            {phase.currentSubstep && isActive && (
              <motion.p
                key={phase.currentSubstep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-muted-foreground mt-1"
              >
                {phase.currentSubstep}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Show keyframe previews during keyframing phase */}
      {phase.id === 'keyframing' && keyframes && keyframes.length > 0 && (
        <div className="mt-4 flex gap-2">
          {keyframes.map((kf, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-10 rounded-lg overflow-hidden border border-foreground/10"
            >
              <img 
                src={kf.imageUrl} 
                alt={`Act ${kf.actNumber}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function ProductionProgress({ state }: ProductionProgressProps) {
  const activePhaseId = state.phase;
  
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Hero section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-xl shadow-primary/20"
        >
          <Film className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold font-display"
        >
          Producing Your Ad
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-md mx-auto"
        >
          Our AI director is crafting a Hollywood-grade commercial with professional cinematography, voiceover, and mastering.
        </motion.p>
      </div>

      {/* Phase cards */}
      <div className="grid gap-4">
        {state.phases.map((phase, index) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PhaseCard 
              phase={phase} 
              isActive={phase.id === activePhaseId}
              keyframes={phase.id === 'keyframing' ? state.keyframes : undefined}
            />
          </motion.div>
        ))}
      </div>

      {/* Keyframe gallery during production */}
      {state.keyframes.length > 0 && state.phase !== 'keyframing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-foreground/5 bg-card/30"
        >
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4">
            Generated Keyframes
          </h4>
          <div className="flex gap-3 justify-center">
            {state.keyframes.map((kf, i) => (
              <div 
                key={i}
                className="relative group"
              >
                <div className="w-24 h-14 rounded-xl overflow-hidden border-2 border-foreground/10 group-hover:border-primary/50 transition-colors">
                  <img 
                    src={kf.imageUrl} 
                    alt={`Act ${kf.actNumber}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-background px-2 rounded">
                  Act {kf.actNumber}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
