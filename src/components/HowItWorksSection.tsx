import { Upload, Sparkles, Video, Download } from 'lucide-react';

const STEPS = [
  {
    icon: Upload,
    number: '01',
    title: 'Pick a Template',
    description: 'Choose from viral reel templates. Each one is designed to go viral on social media.',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'Upload Your Photo',
    description: 'Drop your car photo or product image. Our AI transforms it into stunning visuals.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Video,
    number: '03',
    title: 'AI Creates Videos',
    description: 'Watch as AI generates cinematic video clips from your images automatically.',
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    icon: Download,
    number: '04',
    title: 'Download & Share',
    description: 'Get your ready-to-post reel. Share directly to Instagram, TikTok, or YouTube.',
    gradient: 'from-emerald-500 to-teal-500'
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-6 bg-card/50 relative overflow-hidden border-t border-border/50">
      <div className="max-w-5xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Create viral reels in 4 simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {STEPS.map((step) => (
            <div 
              key={step.number}
              className="group relative"
            >
              <div className="relative bg-background border border-border rounded-2xl p-5 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                {/* Step number */}
                <div className="text-xs font-bold text-muted-foreground/50 mb-3">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-4 shadow-md`}>
                  <step.icon size={18} className="text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-sm font-bold mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
