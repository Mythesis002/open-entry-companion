import { Layers, Upload, Wand2, Download } from 'lucide-react';

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
    <section className="py-16 px-6 bg-muted/30 border-t border-border/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-10">
          How It Works
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <div 
              key={step.title}
              className="bg-background border border-border rounded-xl p-4 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <step.icon size={18} className="text-primary" />
              </div>
              <div className="text-xs font-bold text-muted-foreground mb-1">Step {i + 1}</div>
              <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
