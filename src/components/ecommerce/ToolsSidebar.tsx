import { useState } from 'react';
import { ImagePlus, X, ChevronRight } from 'lucide-react';
import { ProductAdGenerator } from '@/components/ProductAdGenerator';

export function ToolsSidebar() {
  const [activeTool, setActiveTool] = useState<'ad-generator' | null>(null);

  if (activeTool === 'ad-generator') {
    return (
      <div className="h-full flex flex-col bg-background border-l border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Ad Generator</span>
          </div>
          <button
            onClick={() => setActiveTool(null)}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ProductAdGenerator />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Tools</h3>
      </div>
      <div className="p-3 space-y-2">
        <button
          onClick={() => setActiveTool('ad-generator')}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <ImagePlus className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Product Ad Generator</p>
            <p className="text-xs text-muted-foreground truncate">Create stunning product ads with AI</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </div>
    </div>
  );
}
