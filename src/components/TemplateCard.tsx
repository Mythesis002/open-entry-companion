import { useState, useRef } from 'react';
import { Heart, Users, IndianRupee, Volume2, VolumeX, TrendingUp } from 'lucide-react';
import type { ReelTemplate } from '@/types';
import { useTemplateEngagement } from '@/hooks/useTemplateEngagement';

interface TemplateCardProps {
  template: ReelTemplate;
  onSelect: (template: ReelTemplate) => void;
}

const formatCount = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

export const TemplateCard = ({ template, onSelect }: TemplateCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stats, userLiked, toggleLike, incrementUsed } = useTemplateEngagement(template.id);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleLike();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div 
      onClick={() => {
        void incrementUsed();
        onSelect(template);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-card border border-border/50 hover:border-primary/20"
    >
      {/* Video/Thumbnail Container */}
      <div className="aspect-[9/16] relative overflow-hidden">
        {/* Preview Video */}
        {template.previewVideo && (
          <video
            ref={videoRef}
            src={template.previewVideo}
            poster={template.thumbnail}
            muted={isMuted}
            loop
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {/* Fallback Thumbnail */}
        {!template.previewVideo && (
          <img 
            src={template.thumbnail} 
            alt={template.name}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Top gradient */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        
        {/* Trending Badge */}
        {stats.is_trending && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-brand-saffron to-brand-gold text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg z-10">
            <TrendingUp className="w-3 h-3" />
            <span>New Trending</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {/* Likes */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 hover:bg-black/60 transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 ${userLiked ? 'text-red-500 fill-red-500' : 'text-white/80'}`} />
            <span className="text-white text-xs font-medium">{formatCount(stats.likes_count)}</span>
          </button>
          
          {/* Used Count */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-white text-xs font-medium">{formatCount(stats.used_count)}</span>
          </div>
        </div>
        
        {/* Mute toggle */}
        {template.previewVideo && (
          <button
            onClick={toggleMute}
            className="absolute bottom-14 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
        
        {/* Bottom - Price */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-0.5 bg-primary text-primary-foreground font-bold text-sm px-3 py-1.5 rounded-full">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>{template.price}</span>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm text-black font-semibold text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Use Template
          </div>
        </div>
      </div>
      
      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-colors pointer-events-none" />
    </div>
  );
};
