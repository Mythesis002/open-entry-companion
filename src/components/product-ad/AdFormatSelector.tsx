import { AD_FORMATS, type AdFormat } from './types';
import { Monitor, Smartphone, Square } from 'lucide-react';

const icons: Record<AdFormat, typeof Square> = {
  square: Square,
  portrait: Smartphone,
  landscape: Monitor,
};

interface AdFormatSelectorProps {
  selected: AdFormat;
  onChange: (format: AdFormat) => void;
}

export function AdFormatSelector({ selected, onChange }: AdFormatSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {AD_FORMATS.map((format) => {
        const Icon = icons[format.id];
        const isSelected = selected === format.id;
        return (
          <button
            key={format.id}
            onClick={() => onChange(format.id)}
            className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border transition-all ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/30 bg-background'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="text-left">
              <p className={`text-sm font-medium leading-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {format.label}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">{format.dimensions}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
