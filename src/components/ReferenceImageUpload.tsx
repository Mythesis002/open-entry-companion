import { useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReelTemplate } from '@/types';

interface ReferenceImageUploadProps {
  template: ReelTemplate;
  images: string[];
  onImagesChange: (images: string[]) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ReferenceImageUpload = ({
  template,
  images,
  onImagesChange,
  onGenerate,
  isGenerating
}: ReferenceImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (images.length >= template.referenceImagesRequired) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImagesChange([...images, result]);
      };
      reader.readAsDataURL(file);
    });

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const canGenerate = images.length >= template.referenceImagesRequired;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-display">Upload Your Photos</h2>
        <p className="text-muted-foreground">
          Add {template.referenceImagesRequired} reference photos of yourself for the AI to use
        </p>
      </div>

      {/* Upload area */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: template.referenceImagesRequired }).map((_, index) => (
          <div key={index} className="aspect-square relative">
            {images[index] ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                <img 
                  src={images[index]} 
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                  Photo {index + 1}
                </div>
              </div>
            ) : (
              <label 
                className="w-full h-full rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Photo {index + 1}</p>
                  <p className="text-xs text-muted-foreground">Click to upload</p>
                </div>
                <input
                  ref={index === images.length ? inputRef : undefined}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-muted/50 rounded-2xl p-5 space-y-3">
        <h4 className="font-semibold text-sm">📸 Tips for best results:</h4>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li>• Use clear, well-lit photos of your face</li>
          <li>• Front-facing photos work best</li>
          <li>• Avoid photos with sunglasses or heavy filters</li>
        </ul>
      </div>

      {/* Generate button */}
      <Button
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        size="lg"
        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white border-0"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> Generating Images...
          </span>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Generate {template.shots} Shots
          </>
        )}
      </Button>
    </div>
  );
};
