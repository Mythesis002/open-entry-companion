import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import opentryLogo from '@/assets/opentry-logo.png';

export default function ToolsDirectory() {
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['seo-tools-all'],
    queryFn: async () => {
      const { data } = await supabase
        .from('seo_tools')
        .select('slug, tool_name, tagline, category, pricing_info, ease_of_trial_score, status, upvotes')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const categories = [...new Set(tools.map((t: any) => t.category))];

  return (
    <>
      <Helmet>
        <title>Free AI Video & Ad Tools — Try Online | Opentry</title>
        <meta name="description" content="Browse all AI-powered tools for video generation, reel making, and ad creation. Try any tool free, no signup needed. Cheapest AI video platform." />
        <link rel="canonical" href="https://opentry.in/try" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={opentryLogo} className="w-7 h-7" alt="Opentry" />
              <span className="font-display font-extrabold text-sm tracking-tight">Opentry</span>
            </Link>
            <Link to="/">
              <Button size="sm" className="bg-primary text-primary-foreground text-xs font-semibold h-8 px-4">
                Create Video
              </Button>
            </Link>
          </div>
        </header>

        <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">All Tools</li>
          </ol>
        </nav>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground tracking-tight mb-2">
            AI Video & Ad Tools
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
            Try any AI-powered tool for free. Create videos, reels, and ads in seconds — no signup, no watermark.
          </p>

          {categories.map(cat => {
            const catTools = tools.filter((t: any) => t.category === cat);
            return (
              <div key={cat} className="mb-10">
                <h2 className="text-xl font-display font-bold text-foreground capitalize mb-4">{cat}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catTools.map((tool: any) => (
                    <Link
                      key={tool.slug}
                      to={`/try/${tool.slug}`}
                      className="border border-border rounded-lg p-5 bg-card hover:border-primary/40 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-[10px] capitalize">{tool.category}</Badge>
                        <div className="flex items-center gap-1 ml-auto">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                          <span className="text-[10px] text-muted-foreground">{tool.status}</span>
                        </div>
                      </div>
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5">
                        {tool.tool_name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{tool.tagline}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{tool.pricing_info}</span>
                        <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Try now <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <footer className="border-t border-border py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={opentryLogo} className="w-5 h-5" alt="Opentry" />
              <span className="text-xs text-muted-foreground">© 2025 Opentry. All rights reserved.</span>
            </div>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
