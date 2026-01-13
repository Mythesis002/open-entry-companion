import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Marketing Director',
    company: 'TechFlow',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    content: 'Opentry cut our ad production time by 95%. What used to take our team weeks now takes minutes. The quality is indistinguishable from professional studios.',
    rating: 5
  },
  {
    name: 'Marcus Johnson',
    role: 'Founder',
    company: 'GrowthLabs',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
    content: 'We went from zero video ads to running 50+ variations per month. Our ROAS improved 3x because we can now test so many more creatives.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'E-commerce Owner',
    company: 'Luxe Boutique',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
    content: 'As a small business owner, I could never afford video ads before. Opentry democratized professional marketing for entrepreneurs like me.',
    rating: 5
  },
  {
    name: 'David Kim',
    role: 'Agency Partner',
    company: 'Digital First',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    content: "We white-label Opentry for all our clients. It's become our secret weapon for delivering high-volume, high-quality video content at scale.",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-card border-y border-border relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Customer Love
          </span>
          <h2 className="text-4xl lg:text-6xl font-extrabold font-display tracking-tighter text-foreground">
            Loved by Creators
          </h2>
          <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto">
            Join thousands of businesses transforming their marketing
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="group relative bg-background border border-border rounded-[28px] p-8 transition-all duration-500 hover:border-foreground/20 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Quote icon */}
              <Quote size={40} className="absolute top-6 right-6 text-muted-foreground/10 group-hover:text-muted-foreground/20 transition-colors" />
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-foreground font-medium leading-relaxed mb-8 relative z-10">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                />
                <div>
                  <h4 className="font-extrabold font-display text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-border">
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-extrabold font-display text-foreground">50K+</p>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Videos Created</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-extrabold font-display text-foreground">12K+</p>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-extrabold font-display text-foreground">4.9</p>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-4xl font-extrabold font-display text-foreground">98%</p>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
}
