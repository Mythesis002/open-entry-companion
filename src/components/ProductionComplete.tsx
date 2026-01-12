import { motion } from 'framer-motion';
import { Play, Download, Share2, RotateCcw, CheckCircle, Film, Volume2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdProductionState } from '@/types/adProduction';

interface ProductionCompleteProps {
  state: AdProductionState;
  onReset: () => void;
  onShare?: () => void;
}

export function ProductionComplete({ state, onReset, onShare }: ProductionCompleteProps) {
  const { finalOutput, keyframes, treatment } = state;

  if (!finalOutput) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 py-8">
      {/* Success Hero */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-4xl font-extrabold font-display">
          Your Ad is Ready!
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Hollywood-grade commercial crafted with AI-powered cinematography
        </p>
      </motion.div>

      {/* Main Video Player */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative rounded-3xl overflow-hidden border border-foreground/10 bg-black shadow-2xl"
      >
        <div className="aspect-video">
          <video 
            src={finalOutput.masterVideoUrl}
            controls
            poster={finalOutput.thumbnailUrl}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Video info overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1.5">
              <Film className="w-4 h-4" />
              {finalOutput.resolution}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {finalOutput.duration}s
            </span>
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" />
              Pro Voiceover
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <Button 
          size="lg"
          className="gap-2 px-8 h-14 rounded-2xl shadow-lg shadow-primary/20"
          asChild
        >
          <a href={finalOutput.masterVideoUrl} download="ad-commercial.mp4">
            <Download className="w-5 h-5" />
            Download 4K Master
          </a>
        </Button>
        
        {onShare && (
          <Button 
            variant="outline" 
            size="lg"
            className="gap-2 px-8 h-14 rounded-2xl"
            onClick={onShare}
          >
            <Share2 className="w-5 h-5" />
            Share to Social
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="lg"
          className="gap-2 px-8 h-14 rounded-2xl"
          onClick={onReset}
        >
          <RotateCcw className="w-5 h-5" />
          Create Another
        </Button>
      </motion.div>

      {/* Act Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/40 text-center">
          3-Act Structure
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {finalOutput.acts.map((act, index) => (
            <motion.div
              key={act.actNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="rounded-2xl border border-foreground/10 overflow-hidden bg-card/50"
            >
              {/* Keyframe thumbnail */}
              <div className="aspect-video relative group">
                <img 
                  src={act.keyframeUrl}
                  alt={`Act ${act.actNumber}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="ghost" size="sm" className="text-white" asChild>
                    <a href={act.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="w-8 h-8" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    Act {act.actNumber}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {treatment?.acts[index]?.title}
                  </span>
                </div>
                {treatment?.acts[index]?.voiceoverScript && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    "{treatment.acts[index].voiceoverScript}"
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Cinematic Details */}
      {treatment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="p-6 rounded-2xl border border-foreground/5 bg-card/30"
        >
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4">
            Director's Notes
          </h4>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-foreground/40">Overall Tone:</span>
              <p className="text-foreground mt-1">{treatment.overallTone}</p>
            </div>
            <div>
              <span className="text-foreground/40">Music Direction:</span>
              <p className="text-foreground mt-1">{treatment.musicDirection}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-foreground/40">Visual Anchor:</span>
              <p className="text-foreground mt-1">{treatment.visualAnchor.technicalDescription}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
