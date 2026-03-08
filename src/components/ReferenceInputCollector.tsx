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
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-display">Upload Your Photos</h2>
        <p className="text-muted-foreground">
          {template.inputs.length} {template.inputs.length === 1 ? 'input' : 'inputs'} needed for <span className="font-semibold text-foreground">{template.name}</span>
        </p>
        {hasPresets && (
          <p className="text-xs text-brand-saffron">
            ✨ This template includes built-in scene references for enhanced results
          </p>
        )}
      </div>

      {/* Image Inputs */}
      {imageInputs.length > 0 && (
        <div className={`grid ${imageInputs.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-2'} gap-4`}>
          {imageInputs.map((input) => (
            <div key={input.id} className="aspect-square relative max-w-[200px] mx-auto">
              {collectedInputs[input.id] ? (
                <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                  <img
                    src={collectedInputs[input.id]}
                    alt={input.label}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeInput(input.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                    {input.label}
                  </div>
                </div>
              ) : (
                <label className="w-full h-full rounded-2xl border-2 border-border hover:border-primary bg-muted/30 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="text-center px-3">
                    <p className="text-sm font-medium">{input.label}</p>
                    {input.description && (
                      <p className="text-xs text-muted-foreground mt-1">{input.description}</p>
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
              <Label htmlFor={input.id} className="text-sm font-semibold flex items-center gap-2">
                <Type className="w-4 h-4 text-brand-saffron" />
                {input.label}
                {input.required !== false && <span className="text-red-400">*</span>}
              </Label>
              {input.description && (
                <p className="text-xs text-muted-foreground">{input.description}</p>
              )}
              <Input
                id={input.id}
                placeholder={input.label}
                value={collectedInputs[input.id] || ''}
                onChange={(e) => handleTextChange(input.id, e.target.value)}
                className="h-12"
              />
            </div>
          ))}
        </div>
      )}


      {/* Tips */}
      <div className="bg-muted/50 rounded-xl p-3 space-y-1.5 max-w-sm mx-auto">
        <h4 className="font-semibold text-xs">📸 Tips for best results:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          {tips.map((tip, i) => (
            <li key={i}>• {tip}</li>
          ))}
        </ul>
      </div>

      <Button
        onClick={onGenerate}
        disabled={!allRequiredFilled || isGenerating}
        size="lg"
        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-brand-saffron to-brand-maroon hover:from-brand-saffron/90 hover:to-brand-maroon/90 text-white border-0"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> Generating Images...
          </span>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Generate {template.shots.length} Shots
          </>
        )}
      </Button>
    </div>
  );
};
