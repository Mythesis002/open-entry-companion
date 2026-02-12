import { Layers, Upload, Wand2, Download } from 'lucide-react';
import { MandalaBorder, LotusIcon } from '@/components/IndianPatterns';

const STEPS = [
  {
    icon: Layers,
    title: 'Pick Template',
    description: 'Choose a viral reel template'
  },
  {
    icon: Upload,
    title: 'Upload Photo',
    description: 'Drop your car or product photo'
  },
  {
    icon: Wand2,
    title: 'AI Magic',
    description: 'AI creates cinematic videos'
  },
  {
    icon: Download,
    title: 'Download',
    description: 'Get your reel, share anywhere'
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 px-6 bg-accent/30 border-t border-brand-gold/20 relative">
      <MandalaBorder className="absolute top-0 left-0 right-0" />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-10">
          <LotusIcon size={20} className="text-brand-maroon" />
          <h2 className="text-xl font-bold text-center">How It Works</h2>
          <LotusIcon size={20} className="text-brand-maroon" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <div 
              key={step.title}
              className="bg-background border border-brand-gold/20 rounded-xl p-4 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-saffron via-brand-gold to-brand-maroon opacity-60" />
              <div className="w-10 h-10 rounded-full bg-brand-saffron/15 flex items-center justify-center mx-auto mb-3">
                <step.icon size={18} className="text-brand-maroon" />
              </div>
              <div className="text-xs font-bold text-brand-gold mb-1">Step {i + 1}</div>
              <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <MandalaBorder className="absolute bottom-0 left-0 right-0" />
    </section>
  );
}
