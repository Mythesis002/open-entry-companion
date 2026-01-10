import { BUSINESS_CATEGORIES } from '@/data/constants';
import type { BusinessType } from '@/types';

interface BusinessTypeSelectorProps {
  selected: BusinessType;
  onSelect: (type: BusinessType) => void;
}

export function BusinessTypeSelector({ selected, onSelect }: BusinessTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/30 ml-1">
        1. BUSINESS TYPE
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {BUSINESS_CATEGORIES.map(cat => {
          const IconComponent = cat.icon;
          const isSelected = selected === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`relative h-16 overflow-hidden rounded-xl border transition-all group ${
                isSelected 
                  ? 'border-foreground ring-2 ring-foreground/5' 
                  : 'border-foreground/5 hover:border-foreground/20'
              }`}
            >
              <img 
                src={cat.bgImage} 
                className={`absolute inset-0 w-full h-full object-cover transition-all ${
                  isSelected ? 'opacity-40 grayscale' : 'opacity-100'
                }`} 
                alt="" 
              />
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-all ${
                isSelected 
                  ? 'text-foreground' 
                  : 'bg-foreground/20 text-card'
              }`}>
                <IconComponent size={14} />
                <span className="text-[8px] font-extrabold uppercase tracking-widest">
                  {cat.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
