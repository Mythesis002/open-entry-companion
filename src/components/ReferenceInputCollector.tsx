import { useState, useRef } from 'react';
import { Upload, X, User, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ReelTemplate, CollectedInputs } from '@/types';

interface ReferenceInputCollectorProps {
  template: ReelTemplate;
  collectedInputs: CollectedInputs;
  onInputsChange: (inputs: CollectedInputs) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ReferenceInputCollector = ({
  template,
  collectedInputs,
  onInputsChange,
  onGenerate,
  isGenerating
}: ReferenceInputCollectorProps) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = (inputId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      onInputsChange({ ...collectedInputs, [inputId]: result });
    };
    reader.readAsDataURL(file);

    // Reset input
    if (inputRefs.current[inputId]) {
      inputRefs.current[inputId]!.value = '';
    }
  };

  const removeInput = (inputId: string) => {
    const updated = { ...collectedInputs };
    delete updated[inputId];
    onInputsChange(updated);
  };

  const handleTextChange = (inputId: string, value: string) => {
    onInputsChange({ ...collectedInputs, [inputId]: value });
  };

  const imageInputs = template.inputs.filter(i => i.type === 'image');
  const textInputs = template.inputs.filter(i => i.type === 'text');
  const requiredInputs = template.inputs.filter(i => i.required !== false);
  const allRequiredFilled = requiredInputs.every(i => !!collectedInputs[i.id]);

  const defaultTips = [
    'Use clear, well-lit photos',
    'Front-facing photos work best',
    'Avoid heavy filters or sunglasses'
  ];
  const tips = template.uploadTips?.length ? template.uploadTips : defaultTips;

  // Count preset reference images across all shots
  const hasPresets = template.shots.some(s => s.presetReferenceImages && s.presetReferenceImages.length > 0);

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          Upload Your Photo
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {template.inputs.length} {template.inputs.length === 1 ? 'input' : 'inputs'} needed for{' '}
          <span className="font-medium text-foreground">{template.name}</span>
        </p>
        {hasPresets && (
          <p className="text-xs text-brand-saffron font-medium tracking-wide">
            ✨ Built-in scene references included
          </p>
        )}
      </div>

      {/* Image Inputs */}
      {imageInputs.length > 0 && (
        <div className={`grid ${imageInputs.length === 1 ? 'grid-cols-1 max-w-[220px] mx-auto' : 'grid-cols-2'} gap-4`}>
          {imageInputs.map((input) => (
            <div key={input.id} className="aspect-square relative max-w-[200px] mx-auto w-full">
              {collectedInputs[input.id] ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden group shadow-sm">
                  <img
                    src={collectedInputs[input.id]}
                    alt={input.label}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeInput(input.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/50 text-white text-[11px] font-medium tracking-wide">
                    {input.label}
                  </div>
                </div>
              ) : (
                <label className="w-full h-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-muted/40">
                  <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground/70" />
                  </div>
                  <div className="text-center px-3">
                    <p className="text-sm font-medium text-foreground/80">{input.label}</p>
                    {input.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{input.description}</p>
                    )}
                  </div>
                  <input
                    ref={(el) => { inputRefs.current[input.id] = el; }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(input.id, e)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Text Inputs */}
      {textInputs.length > 0 && (
        <div className="space-y-4">
          {textInputs.map((input) => (
            <div key={input.id} className="space-y-2">
              <Label htmlFor={input.id} className="text-sm font-medium flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-brand-saffron" />
                {input.label}
                {input.required !== false && <span className="text-destructive">*</span>}
              </Label>
              {input.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{input.description}</p>
              )}
              <Input
                id={input.id}
                placeholder={input.label}
                value={collectedInputs[input.id] || ''}
                onChange={(e) => handleTextChange(input.id, e.target.value)}
                className="h-11 text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-muted/30 rounded-xl p-4 space-y-2 max-w-sm mx-auto border border-border/50">
        <h4 className="font-medium text-xs text-foreground/70 uppercase tracking-wider">📸 Tips for best results</h4>
        <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-brand-gold mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onGenerate}
        disabled={!allRequiredFilled || isGenerating}
        className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-saffron to-brand-maroon hover:from-brand-saffron/90 hover:to-brand-maroon/90 text-white border-0 tracking-wide shadow-sm"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> Generating...
          </span>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Generate {template.shots.length} Shots
          </>
        )}
      </Button>
    </div>
  );
};
