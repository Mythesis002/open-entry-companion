import { useState, useRef } from 'react';
import { Play, Image, IndianRupee, Volume2, VolumeX } from 'lucide-react';
import type { ReelTemplate } from '@/types';

interface TemplateCardProps {
  template: ReelTemplate;
  onSelect: (template: ReelTemplate) => void;
}

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
        {/* Preview Video */}
        {template.previewVideo && (
          <video
            ref={videoRef}
            src={template.previewVideo}
            poster={template.thumbnail}
            muted={isMuted}
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
        
        {/* Fallback Thumbnail */}
        <img 
          src={template.thumbnail} 
          alt={template.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered && template.previewVideo ? 'opacity-0' : 'opacity-100'
          } ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        
        {/* Play indicator (when no video or video loading) */}
        {!template.previewVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
        
        {/* Mute toggle (only when hovering and has video) */}
        {template.previewVideo && isHovered && (
          <button
            onClick={toggleMute}
            className="absolute bottom-20 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white leading-tight mb-1">{template.name}</h3>
          <p className="text-white/70 text-xs line-clamp-2 mb-3">{template.description}</p>
          
          {/* Stats Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <Image className="w-3 h-3" />
                <span>{template.referenceImagesRequired}</span>
              </div>
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <Play className="w-3 h-3" />
                <span>{template.shots} shots</span>
              </div>
            </div>
            
            {/* Price */}
            <div className="flex items-center gap-0.5 text-white font-bold text-sm">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>{template.price}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover border glow effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-colors pointer-events-none" />
    </div>
  );
};
