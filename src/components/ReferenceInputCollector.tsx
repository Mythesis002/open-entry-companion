import { useState, useRef } from 'react';
import { Upload, X, ImagePlus, Type, Camera, Sparkles, ArrowRight } from 'lucide-react';
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

  const hasPresets = template.shots.some(s => s.presetReferenceImages && s.presetReferenceImages.length > 0);

  const filledCount = requiredInputs.filter(i => !!collectedInputs[i.id]).length;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card container */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Camera className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight text-foreground">
                Upload Your Photo
              </h2>
              <p className="text-xs text-muted-foreground">
                for <span className="font-medium text-foreground">{template.name}</span>
              </p>
            </div>
          </div>

          {hasPresets && (
            <div className="flex items-center gap-1.5 text-xs text-brand-saffron bg-accent/50 rounded-lg px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Built-in scene references included
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Image Inputs */}
          {imageInputs.length > 0 && (
            <div className={`grid ${imageInputs.length === 1 ? 'grid-cols-1 max-w-[220px] mx-auto' : 'grid-cols-2'} gap-4`}>
              {imageInputs.map((input) => (
                <div key={input.id} className="aspect-square relative w-full">
                  {collectedInputs[input.id] ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden group ring-2 ring-primary/20">
                      <img
                        src={collectedInputs[input.id]}
                        alt={input.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button
                        onClick={() => removeInput(input.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-foreground/60 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-foreground/60 backdrop-blur-sm text-background text-[10px] font-medium">
                        {input.label}
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-accent/30 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 group">
                      <div className="w-14 h-14 rounded-2xl bg-accent group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                        <ImagePlus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-center px-3">
                        <p className="text-xs font-semibold text-foreground">{input.label}</p>
                        {input.description && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{input.description}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to upload
                      </span>
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
            <div className="space-y-3">
              {textInputs.map((input) => (
                <div key={input.id} className="space-y-1.5">
                  <Label htmlFor={input.id} className="text-xs font-semibold flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-muted-foreground" />
                    {input.label}
                    {input.required !== false && <span className="text-destructive">*</span>}
                  </Label>
                  {input.description && (
                    <p className="text-[10px] text-muted-foreground">{input.description}</p>
                  )}
                  <Input
                    id={input.id}
                    placeholder={input.label}
                    value={collectedInputs[input.id] || ''}
                    onChange={(e) => handleTextChange(input.id, e.target.value)}
                    className="h-10 text-sm bg-secondary/30 border-border/60"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          <div className="bg-accent/40 rounded-xl p-3.5 space-y-1.5">
            <h4 className="font-semibold text-[11px] text-foreground flex items-center gap-1.5">
              <Camera className="w-3 h-3 text-muted-foreground" />
              Tips for best results
            </h4>
            <ul className="text-[10px] text-muted-foreground space-y-0.5 leading-relaxed">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-muted-foreground/60 mt-px">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer / CTA */}
        <div className="px-6 pb-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-muted-foreground font-medium">
              {filledCount}/{requiredInputs.length} required {requiredInputs.length === 1 ? 'input' : 'inputs'} filled
            </span>
            <div className="flex gap-1">
              {requiredInputs.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-6 h-1 rounded-full transition-colors ${i < filledCount ? 'bg-primary' : 'bg-border'}`} 
                />
              ))}
            </div>
          </div>

          <Button
            onClick={onGenerate}
            disabled={!allRequiredFilled || isGenerating}
            className="w-full h-12 text-sm font-bold rounded-xl"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              <>
                Generate {template.shots.length} Shots
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
