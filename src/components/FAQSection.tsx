import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: "How long does it take to create a reel?",
    a: "About 3-5 minutes total. Image generation takes ~1 minute, video generation takes ~2-3 minutes."
  },
  {
    q: "What kind of photos work best?",
    a: "Clear, well-lit photos with good visibility of the subject. For cars, multiple angles work great."
  },
  {
    q: "Can I use these videos commercially?",
    a: "Yes! All generated content is licensed for commercial use on any platform."
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all UPI apps — Google Pay, PhonePe, Paytm, and more."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Support
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Frequently asked questions
          </h2>
        </div>

        <div className="divide-y divide-border">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full py-5 flex items-center justify-between text-left group"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-brand-maroon transition-colors pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-40 pb-5' : 'max-h-0'}`}
              >
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
