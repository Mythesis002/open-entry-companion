import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: "How long does it take?",
    a: "About 3-5 minutes total. Image generation takes ~1 minute, video generation takes ~2-3 minutes."
  },
  {
    q: "What photos work best?",
    a: "Clear, well-lit photos with good visibility of the subject. For cars, multiple angles work great."
  },
  {
    q: "Can I use these commercially?",
    a: "Yes! All generated content is licensed for commercial use on any platform."
  },
  {
    q: "What payment methods?",
    a: "We accept all UPI apps - Google Pay, PhonePe, Paytm, and more."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 px-6 bg-background">
      <div className="max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-center mb-6">FAQ</h2>
        
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium">{faq.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-muted-foreground transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-4 pb-3">
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
