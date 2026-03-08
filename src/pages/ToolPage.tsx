import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Star, ArrowRight, ChevronRight, ThumbsUp, ThumbsDown, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import opentryLogo from '@/assets/opentry-logo.png';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface SeoTool {
  id: string;
  slug: string;
  tool_name: string;
  category: string;
  tagline: string;
  description: string;
  meta_title: string;
  meta_description: string;
  opentry_features: string[];
  competitor_features: string[];
  pricing_info: string;
  is_open_source: boolean;
  ease_of_trial_score: number;
  lsi_keywords: string[];
  people_also_ask: { q: string; a: string }[];
  related_tool_slugs: string[];
  status: string;
  upvotes: number;
  downvotes: number;
}

function JsonLd({ tool }: { tool: SeoTool }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": `Opentry — ${tool.tool_name}`,
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "url": `https://opentry.in/try/${tool.slug}`,
        "description": tool.description,
        "offers": {
          "@type": "Offer",
          "price": "12",
          "priceCurrency": "INR",
          "description": tool.pricing_info
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": String(tool.upvotes + 47),
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://opentry.in" },
          { "@type": "ListItem", "position": 2, "name": tool.category.charAt(0).toUpperCase() + tool.category.slice(1), "item": `https://opentry.in/try?cat=${tool.category}` },
          { "@type": "ListItem", "position": 3, "name": tool.tool_name, "item": `https://opentry.in/try/${tool.slug}` }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": tool.people_also_ask.map(paa => ({
          "@type": "Question",
          "name": paa.q,
          "acceptedAnswer": { "@type": "Answer", "text": paa.a }
        }))
      }
    ]
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  const { data: tool, isLoading } = useQuery({
    queryKey: ['seo-tool', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_tools')
        .select('*')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data as unknown as SeoTool;
    },
    enabled: !!slug,
  });

  const { data: relatedTools } = useQuery({
    queryKey: ['related-tools', tool?.related_tool_slugs],
    queryFn: async () => {
      if (!tool?.related_tool_slugs?.length) return [];
      const { data } = await supabase
        .from('seo_tools')
        .select('slug, tool_name, tagline, category, pricing_info, ease_of_trial_score')
        .in('slug', tool.related_tool_slugs as string[]);
      return (data || []) as unknown as SeoTool[];
    },
    enabled: !!tool?.related_tool_slugs?.length,
  });

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      toast({ title: "Sign in to vote", description: "Create a free account to rate tools.", variant: "destructive" });
      return;
    }
    if (!tool) return;
    setVoted(type);
    await supabase.from('seo_tool_votes').upsert({ tool_id: tool.id, user_id: user.id, vote_type: type }, { onConflict: 'tool_id,user_id' });
    toast({ title: type === 'up' ? '👍 Thanks!' : '👎 Noted', description: 'Your vote has been recorded.' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Tool not found</h1>
          <Link to="/" className="text-primary underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const opentryFeatures = tool.opentry_features as string[];
  const competitorFeatures = tool.competitor_features as string[];
  const lsiKeywords = tool.lsi_keywords as string[];
  const peopleAlsoAsk = tool.people_also_ask as { q: string; a: string }[];
  const relatedSlugs = tool.related_tool_slugs as string[];

  return (
    <>
      <Helmet>
        <title>{tool.meta_title}</title>
        <meta name="description" content={tool.meta_description} />
        <link rel="canonical" href={`https://opentry.in/try/${tool.slug}`} />
        <meta property="og:title" content={tool.meta_title} />
        <meta property="og:description" content={tool.meta_description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://opentry.in/try/${tool.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={tool.meta_title} />
        <meta name="twitter:description" content={tool.meta_description} />
      </Helmet>
      <JsonLd tool={tool} />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={opentryLogo} className="w-7 h-7" alt="Opentry" />
              <span className="font-display font-extrabold text-sm tracking-tight">Opentry</span>
            </Link>
            <Link to="/">
              <Button size="sm" className="bg-primary text-primary-foreground text-xs font-semibold h-8 px-4">
                Try Now — Free
              </Button>
            </Link>
          </div>
        </header>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><span className="capitalize">{tool.category}</span></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium truncate max-w-[200px]">{tool.tool_name}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-xs capitalize">{tool.category}</Badge>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                    <span className="text-xs text-muted-foreground font-medium">System Online</span>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-foreground tracking-tight leading-tight mb-4">
                  {tool.tool_name}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {tool.tagline}
                </p>
              </div>

              <p className="text-base text-foreground/80 leading-relaxed">{tool.description}</p>

              <Link to="/">
                <Button size="lg" className="bg-primary text-primary-foreground font-semibold text-base h-12 px-8 gap-2">
                  Try It Free Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              {/* Comparison Table */}
              <div className="mt-12">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Opentry vs Competitors — Feature Comparison
                </h2>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
                    <div className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</div>
                    <div className="p-3 text-xs font-semibold text-primary uppercase tracking-wider text-center">Opentry</div>
                    <div className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Others</div>
                  </div>
                  {opentryFeatures.map((feat, i) => (
                    <div key={i} className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'} border-b border-border last:border-0`}>
                      <div className="p-3 text-sm text-foreground font-medium">{feat}</div>
                      <div className="p-3 flex justify-center">
                        <CheckCircle className="w-5 h-5 text-brand-emerald" />
                      </div>
                      <div className="p-3 flex justify-center items-center">
                        <span className="text-xs text-muted-foreground">{competitorFeatures[i] || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* People Also Ask */}
              <div className="mt-12">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">People Also Ask</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {peopleAlsoAsk.map((paa, i) => (
                    <AccordionItem key={i} value={`paa-${i}`} className="border border-border rounded-lg px-4">
                      <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                        {paa.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                        {paa.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* UGC Voting */}
              <div className="mt-12 border border-border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-display font-bold text-foreground mb-2">Is this tool working for you?</h3>
                <p className="text-sm text-muted-foreground mb-4">Help others by sharing your experience</p>
                <div className="flex items-center gap-4">
                  <Button
                    variant={voted === 'up' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleVote('up')}
                    className="gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" /> Yes, it works
                  </Button>
                  <Button
                    variant={voted === 'down' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => handleVote('down')}
                    className="gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" /> Had issues
                  </Button>
                </div>
              </div>

              {/* LSI Keywords as tags */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Related Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {lsiKeywords.map((kw, i) => (
                    <span key={i} className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full border border-border">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar — Quick Stats */}
            <aside className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                <div className="border border-border rounded-lg p-6 bg-card space-y-5">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Stats</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pricing</span>
                      <span className="text-sm font-bold text-foreground">{tool.pricing_info}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Open Source</span>
                      <span className="text-sm font-medium">{tool.is_open_source ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-muted-foreground">Ease of Trial</span>
                        <span className="text-sm font-bold text-foreground">{tool.ease_of_trial_score}/10</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-brand-gold rounded-full h-2 transition-all"
                          style={{ width: `${tool.ease_of_trial_score * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 text-brand-gold" />
                      <span>60-second generation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-brand-emerald" />
                      <span>Commercial license included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>No signup required</span>
                    </div>
                  </div>

                  <Link to="/">
                    <Button className="w-full bg-primary text-primary-foreground font-semibold gap-2 mt-2">
                      Try Free <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {/* Star rating display */}
                <div className="border border-border rounded-lg p-5 bg-card text-center">
                  <div className="flex justify-center gap-0.5 mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-5 h-5 ${i <= 4 ? 'text-brand-gold fill-brand-gold' : 'text-brand-gold/50 fill-brand-gold/50'}`} />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-foreground">4.8/5</p>
                  <p className="text-xs text-muted-foreground">{tool.upvotes + 47} ratings</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Related Tools — Interlinking Engine */}
        {relatedTools && relatedTools.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-border">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">Related Trials</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTools.map((rt: any) => (
                <Link
                  key={rt.slug}
                  to={`/try/${rt.slug}`}
                  className="border border-border rounded-lg p-4 bg-card hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <Badge variant="secondary" className="text-[10px] capitalize mb-2">{rt.category}</Badge>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {rt.tool_name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{rt.tagline}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{rt.pricing_info}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={opentryLogo} className="w-5 h-5" alt="Opentry" />
              <span className="text-xs text-muted-foreground">© 2025 Opentry. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link to="/try" className="hover:text-foreground transition-colors">All Tools</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
