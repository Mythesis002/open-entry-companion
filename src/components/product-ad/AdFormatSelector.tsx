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
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Ad Format</label>
      <div className="grid grid-cols-3 gap-3">
        {AD_FORMATS.map((format) => {
          const Icon = icons[format.id];
          const isSelected = selected === format.id;
          return (
            <button
              key={format.id}
              onClick={() => onChange(format.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/30 bg-muted/20'
              }`}
            >
              <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {format.label}
              </span>
              <span className="text-xs text-muted-foreground">{format.dimensions}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
