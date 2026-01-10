import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { FAQS } from '@/data/constants';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 bg-card border-t border-foreground/5">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-extrabold font-display tracking-tighter">
            Common Questions
          </h2>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            Everything you need to know about Opentry
          </p>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className="bg-card border border-foreground/5 rounded-[24px] overflow-hidden transition-all hover:border-foreground/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
              >
                <span className="text-sm font-extrabold font-display">{faq.q}</span>
                {openIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openIndex === i && (
                <div className="px-8 pb-6 animate-slide-up">
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
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
