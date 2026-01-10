export function AboutSection() {
  return (
    <section className="py-24 px-6 border-t border-foreground/5 bg-card">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold font-display tracking-tighter">
              Our Advertisements.
            </h2>
            <div className="w-12 h-1 bg-foreground rounded-full" />
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed font-medium">
            Opentry is on a mission to democratize professional video marketing. We believe that every business, regardless of size or budget, deserves high-impact commercial assets that drive growth.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed font-medium">
            By harnessing the latest breakthroughs in Generative AI, we've built a studio that handles the entire production pipeline: from scripting and branding analysis to cinematic visual generation and professional voiceovers.
          </p>
          <div className="flex items-center gap-8 pt-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold font-display">10k+</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Ads Created
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold font-display">90%</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Cheaper
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold font-display">20s</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Production
              </p>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-[400px] aspect-square rounded-[40px] overflow-hidden shadow-2xl">
          <img 
            src="https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767987241/opentry_poster.jpg" 
            className="w-full h-full object-cover" 
            alt="Opentry banner" 
          />
        </div>
      </div>
    </section>
  );
}
