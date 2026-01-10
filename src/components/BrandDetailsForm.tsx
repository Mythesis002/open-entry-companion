import { useRef } from 'react';
import { Upload, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { MOODS } from '@/data/constants';
import type { AdInputs, AdMood, TargetAudience } from '@/types';

interface BrandDetailsFormProps {
  inputs: AdInputs;
  setInputs: React.Dispatch<React.SetStateAction<AdInputs>>;
  onGenerate: () => void;
  isValid: boolean;
}

export function BrandDetailsForm({ inputs, setInputs, onGenerate, isValid }: BrandDetailsFormProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const productImagesInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ ...prev, brandLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const remainingSlots = 10 - inputs.productImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    const newImages = await Promise.all(filesToProcess.map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }));

    setInputs(prev => ({ ...prev, productImages: [...prev.productImages, ...newImages] }));
  };

  return (
    <div className="w-full glass-card p-6 lg:p-10 card-shadow flex flex-col lg:flex-row gap-10">
      <div className="flex-1 w-full space-y-10">
        {/* Brand Details Section */}
        <div className="space-y-6">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/30 ml-1">
            2. BRAND DETAILS
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-extrabold text-foreground/40 uppercase tracking-widest ml-1">
                Business Name
              </label>
              <input 
                className="w-full h-12 bg-card/40 rounded-xl px-5 text-sm font-semibold outline-none border border-foreground/5 focus:border-foreground/20 focus:bg-card/60 transition-all placeholder:text-muted-foreground" 
                placeholder="e.g. Shyam Hotels" 
                value={inputs.productName} 
                onChange={e => setInputs(prev => ({ ...prev, productName: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-extrabold text-foreground/40 uppercase tracking-widest ml-1">
                Upload Your Logo
              </label>
              <div 
                onClick={() => logoInputRef.current?.click()} 
                className="w-full h-12 bg-card/40 border border-dashed border-foreground/10 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:bg-card/60 transition-colors"
              >
                {inputs.brandLogo ? (
                  <>
                    <img src={inputs.brandLogo} className="h-6 w-6 object-contain" alt="Logo" />
                    <span className="text-xs font-bold">Logo Ready</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} className="text-foreground/30" />
                    <span className="text-xs font-bold text-foreground/40">Click to pick logo</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-extrabold text-foreground/40 uppercase tracking-widest ml-1">
              What are you promoting?
            </label>
            <textarea 
              className="w-full h-20 bg-card/40 rounded-xl px-5 py-4 text-sm font-semibold outline-none border border-foreground/5 focus:border-foreground/20 focus:bg-card/60 transition-all resize-none leading-relaxed placeholder:text-muted-foreground" 
              placeholder="e.g. 50% off all cakes this weekend!" 
              value={inputs.description} 
              onChange={e => setInputs(prev => ({ ...prev, description: e.target.value }))} 
            />
          </div>
          <input 
            type="file" 
            ref={logoInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleLogoUpload} 
          />
        </div>

        {/* Style & Audience */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-foreground/30 ml-1">
              Video Style
            </label>
            <select 
              value={inputs.mood} 
              onChange={(e) => setInputs(prev => ({ ...prev, mood: e.target.value as AdMood }))} 
              className="w-full h-10 bg-card/40 rounded-lg px-4 text-[11px] font-bold outline-none cursor-pointer border border-foreground/5 focus:border-foreground/20 transition-all"
            >
              {MOODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-extrabold uppercase tracking-widest text-foreground/30 ml-1">
              Audience
            </label>
            <select 
              value={inputs.audience} 
              onChange={(e) => setInputs(prev => ({ ...prev, audience: e.target.value as TargetAudience }))} 
              className="w-full h-10 bg-card/40 rounded-lg px-4 text-[11px] font-bold outline-none cursor-pointer border border-foreground/5 focus:border-foreground/20 transition-all"
            >
              <option value="general">General</option>
              <option value="gen_z">Younger / Gen Z</option>
              <option value="luxury">High-end / Luxury</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Column - Photos & Generate */}
      <div className="w-full lg:w-[280px] flex flex-col gap-6 shrink-0">
        <div className="space-y-4">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/30 ml-1">
            3. BUSINESS PHOTOS
          </label>
          <div 
            onClick={() => productImagesInputRef.current?.click()} 
            className="w-full h-36 border-2 border-dashed border-foreground/5 rounded-[28px] flex flex-col items-center justify-center bg-card/30 hover:bg-card/50 transition-all cursor-pointer group"
          >
            {inputs.productImages.length > 0 ? (
              <div className="flex gap-2 flex-wrap justify-center p-4">
                {inputs.productImages.slice(0, 4).map((img, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border border-card shadow-sm">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
                {inputs.productImages.length > 4 && (
                  <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center text-xs font-bold">
                    +{inputs.productImages.length - 4}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                <ImageIcon size={20} />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-center">
                  Add Photos
                </span>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={productImagesInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleProductImageUpload} 
          />
        </div>
        
        <button 
          onClick={onGenerate} 
          disabled={!isValid} 
          className={`w-full h-16 rounded-[24px] font-extrabold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
            !isValid 
              ? 'bg-foreground/5 text-foreground/20 cursor-not-allowed' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/10'
          }`}
        >
          Generate <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
