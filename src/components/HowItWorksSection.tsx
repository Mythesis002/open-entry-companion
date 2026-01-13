import { Upload, Sparkles, Video, Share2 } from 'lucide-react';

const STEPS = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload Assets',
    description: 'Drop your logo, product images, and brand colors. Our AI analyzes your visual identity instantly.',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'AI Magic',
    description: 'Our AI writes compelling scripts, generates stunning visuals, and records professional voiceovers.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Video,
    number: '03',
    title: 'Preview & Edit',
    description: 'Watch your video ad come to life. Make tweaks, adjust timing, or regenerate any scene.',
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    icon: Share2,
    number: '04',
    title: 'Publish Everywhere',
    description: 'Export in any format or post directly to YouTube, Instagram, TikTok, and more.',
    gradient: 'from-emerald-500 to-teal-500'
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="text-4xl lg:text-6xl font-extrabold font-display tracking-tighter text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto">
            From concept to campaign in under 2 minutes
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {STEPS.map((step, index) => (
            <div 
              key={step.number}
              className="group relative"
            >
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}
              
              <div className="relative bg-card border border-border rounded-[28px] p-8 h-full transition-all duration-500 hover:border-foreground/20 hover:shadow-2xl hover:-translate-y-2 group-hover:bg-secondary/50">
                {/* Step number badge */}
                <div className="absolute -top-4 right-6 px-3 py-1 rounded-full bg-foreground text-background text-xs font-extrabold">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon size={24} className="text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-extrabold font-display mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="h-14 px-10 bg-foreground text-background rounded-2xl font-extrabold text-sm uppercase tracking-wider hover:bg-foreground/90 transition-all hover:scale-105 shadow-xl"
          >
            Start Creating Now
          </button>
        </div>
      </div>
    </section>
  );
}
