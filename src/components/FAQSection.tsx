import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: "How does the AI create these reels?",
    a: "Our AI uses your uploaded photo to generate custom images in the template style, then animates them into cinematic video clips and composes them into a ready-to-post reel."
  },
  {
    q: "How long does it take to generate a reel?",
    a: "Image generation takes about 30-60 seconds. Video generation takes 2-3 minutes. Your complete reel will be ready in under 5 minutes."
  },
  {
    q: "What kind of photos work best?",
    a: "Clear, well-lit photos work best. For car templates, use photos with good visibility of the vehicle from various angles."
  },
  {
    q: "Can I use these reels commercially?",
    a: "Yes! All generated content is licensed for commercial use on any platform including Instagram, TikTok, YouTube, and ads."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all UPI payment methods including Google Pay, PhonePe, Paytm, and any other UPI-enabled apps."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 px-6 bg-background border-t border-border/50">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Questions & Answers
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
              >
                <span className="text-sm font-semibold">{faq.q}</span>
                {openIndex === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 animate-slide-up">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
