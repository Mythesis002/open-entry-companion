import { Play, Image, IndianRupee } from 'lucide-react';
import type { ReelTemplate } from '@/types';

interface TemplateCardProps {
  template: ReelTemplate;
  onSelect: (template: ReelTemplate) => void;
}

export const TemplateCard = ({ template, onSelect }: TemplateCardProps) => {
  return (
    <div 
      onClick={() => onSelect(template)}
      className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Thumbnail */}
      <div className="aspect-[9/16] relative">
        <img 
          src={template.thumbnail} 
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
        
        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
          <h3 className="text-xl font-bold text-white font-display">{template.name}</h3>
          <p className="text-white/70 text-sm line-clamp-2">{template.description}</p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <Image className="w-3.5 h-3.5" />
              <span>{template.referenceImagesRequired} photos</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <Play className="w-3.5 h-3.5" />
              <span>{template.shots} shots</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Price badge */}
      <div className="absolute top-4 left-4">
        <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-foreground text-sm font-bold flex items-center gap-0.5">
          <IndianRupee className="w-3.5 h-3.5" />
          {template.price}
        </div>
      </div>
      
      {/* Viral badge */}
      <div className="absolute top-4 right-4">
        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider">
          🔥 Viral
        </div>
      </div>
    </div>
  );
};
