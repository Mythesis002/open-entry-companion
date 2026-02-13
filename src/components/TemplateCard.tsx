import { useState, useRef } from 'react';
import { Heart, Users, IndianRupee, Volume2, VolumeX } from 'lucide-react';
import type { ReelTemplate } from '@/types';

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

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div 
      onClick={() => onSelect(template)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-card border border-border/50 hover:border-primary/20"
    >
      {/* Video/Thumbnail Container */}
      <div className="aspect-[9/16] relative overflow-hidden">
        {/* Thumbnail - always rendered */}
        <img 
          src={template.thumbnail} 
          alt={template.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered && template.previewVideo ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Preview Video - only visible on hover */}
        {template.previewVideo && (
          <video
            ref={videoRef}
            src={template.previewVideo}
            muted={isMuted}
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        
        {/* Top gradient for stats */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        
        {/* Top Stats - Likes and Used */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
              <span className="text-white text-[10px] font-medium">{formatCount(template.likes)}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Users className="w-3 h-3 text-blue-400" />
              <span className="text-white text-[10px] font-medium">{formatCount(template.usedCount)}</span>
            </div>
          </div>

          {/* Mute toggle */}
          {template.previewVideo && isHovered && (
            <button
              onClick={toggleMute}
              className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          )}
        </div>
        
        {/* Bottom - Price */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-0.5 bg-black/50 backdrop-blur-sm text-white font-bold text-xs px-2.5 py-1 rounded-full">
            <IndianRupee className="w-3 h-3" />
            <span>{template.price}</span>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm text-black font-semibold text-[10px] px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Use Template
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-colors pointer-events-none" />
    </div>
  );
};
