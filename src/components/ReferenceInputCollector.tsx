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
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-semibold font-display">Upload Your Photos</h2>
        <p className="text-sm text-muted-foreground">
          {template.inputs.length} {template.inputs.length === 1 ? 'input' : 'inputs'} needed for <span className="font-medium text-foreground">{template.name}</span>
        </p>
        {hasPresets && (
          <p className="text-xs text-brand-saffron">
            ✨ Built-in scene references included
          </p>
        )}
      </div>

      {/* Image Inputs */}
      {imageInputs.length > 0 && (
        <div className={`grid ${imageInputs.length === 1 ? 'grid-cols-1 max-w-[200px] mx-auto' : 'grid-cols-2'} gap-3`}>
          {imageInputs.map((input) => (
            <div key={input.id} className="aspect-square relative max-w-[180px] mx-auto w-full">
              {collectedInputs[input.id] ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden group">
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
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px]">
                    {input.label}
                  </div>
                </div>
              ) : (
                <label className="w-full h-full rounded-xl border-2 border-border hover:border-primary bg-muted/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center px-2">
                    <p className="text-xs font-medium">{input.label}</p>
                    {input.description && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{input.description}</p>
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
        <div className="space-y-3">
          {textInputs.map((input) => (
            <div key={input.id} className="space-y-1.5">
              <Label htmlFor={input.id} className="text-xs font-semibold flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-brand-saffron" />
                {input.label}
                {input.required !== false && <span className="text-red-400">*</span>}
              </Label>
              {input.description && (
                <p className="text-[10px] text-muted-foreground">{input.description}</p>
              )}
              <Input
                id={input.id}
                placeholder={input.label}
                value={collectedInputs[input.id] || ''}
                onChange={(e) => handleTextChange(input.id, e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-muted/50 rounded-lg p-2.5 space-y-1 max-w-xs mx-auto">
        <h4 className="font-medium text-[11px]">📸 Tips for best results:</h4>
        <ul className="text-[10px] text-muted-foreground space-y-0.5">
          {tips.map((tip, i) => (
            <li key={i}>• {tip}</li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onGenerate}
        disabled={!allRequiredFilled || isGenerating}
        className="w-full h-11 text-sm font-bold rounded-xl bg-gradient-to-r from-brand-saffron to-brand-maroon hover:from-brand-saffron/90 hover:to-brand-maroon/90 text-white border-0"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> Generating...
          </span>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-1.5" />
            Generate {template.shots.length} Shots
          </>
        )}
      </Button>
    </div>
  );
};
