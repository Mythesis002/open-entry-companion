import { Check, Zap, Crown, Building2 } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for trying out Opentry',
    icon: Zap,
    gradient: 'from-slate-500 to-slate-600',
    features: [
      '3 video ads per month',
      '720p quality export',
      'Basic AI voices',
      'Watermark included',
      'Email support'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing businesses',
    icon: Crown,
    gradient: 'from-purple-500 to-pink-500',
    features: [
      'Unlimited video ads',
      '4K quality export',
      'Premium AI voices',
      'No watermark',
      'Priority support',
      'Custom brand kit',
      'Social publishing'
    ],
    cta: 'Start Pro Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'For agencies & teams',
    icon: Building2,
    gradient: 'from-amber-500 to-orange-500',
    features: [
      'Everything in Pro',
      'API access',
      'White-label option',
      'Dedicated account manager',
      'Custom AI training',
      'SLA guarantee',
      'Bulk discounts'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-background to-secondary/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Simple Pricing
          </span>
          <h2 className="text-4xl lg:text-6xl font-extrabold font-display tracking-tighter text-foreground">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PLANS.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 ${
                plan.popular 
                  ? 'bg-foreground text-background shadow-2xl scale-105 lg:scale-110 z-10' 
                  : 'bg-card border border-border hover:border-foreground/20 hover:shadow-xl'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                <plan.icon size={24} className="text-white" />
              </div>

              {/* Plan name & price */}
              <h3 className="text-xl font-extrabold font-display mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold font-display">{plan.price}</span>
                <span className={`text-sm font-medium ${plan.popular ? 'text-background/60' : 'text-muted-foreground'}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`text-sm font-medium mb-8 ${plan.popular ? 'text-background/70' : 'text-muted-foreground'}`}>
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-background/20' : 'bg-primary/10'
                    }`}>
                      <Check size={12} className={plan.popular ? 'text-background' : 'text-primary'} />
                    </div>
                    <span className={`text-sm font-medium ${plan.popular ? 'text-background/80' : 'text-muted-foreground'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button className={`w-full h-12 rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all hover:scale-105 ${
                plan.popular 
                  ? 'bg-background text-foreground hover:bg-background/90' 
                  : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-16 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check size={16} className="text-emerald-500" />
            <span className="text-sm font-medium">No credit card required</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check size={16} className="text-emerald-500" />
            <span className="text-sm font-medium">Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check size={16} className="text-emerald-500" />
            <span className="text-sm font-medium">30-day money back</span>
          </div>
        </div>
      </div>
    </section>
  );
}
