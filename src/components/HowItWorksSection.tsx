import { Layers, Upload, Wand2, Download } from 'lucide-react';

const STEPS = [
  {
    icon: Layers,
    number: '01',
    title: 'Pick Template',
    description: 'Choose from trending viral reel templates curated for maximum engagement.'
  },
  {
    icon: Upload,
    number: '02',
    title: 'Upload Photo',
    description: 'Drop your car or product photo — our AI handles the rest.'
  },
  {
    icon: Wand2,
    number: '03',
    title: 'AI Magic',
    description: 'Cinematic scenes are generated using state-of-the-art AI models.'
  },
  {
    icon: Download,
    number: '04',
    title: 'Download & Share',
    description: 'Get your reel ready to post on Instagram, YouTube, or anywhere.'
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            How It Works
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            From photo to viral reel
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="group relative">
              <div className="mb-5">
                <span className="text-4xl font-bold text-brand-saffron/20 group-hover:text-brand-saffron/40 transition-colors duration-300" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {step.number}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-brand-saffron/10 transition-colors duration-300">
                <step.icon size={18} className="text-foreground/70" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
