import { useMemo, useState } from 'react';
import type { NewsItem, NewsStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Filter, BookMarked, EyeOff, Star } from 'lucide-react';

interface NewsFeedProps {
  items: NewsItem[];
  isLoading?: boolean;
  onStatusChange?: (id: string, status: NewsStatus) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google_deepmind: 'DeepMind',
  techcrunch_ai: 'TechCrunch AI',
  ars_technica_ai: 'Ars Technica AI',
  hackernews: 'Hacker News',
  github: 'GitHub',
};

function getHostLabel(url?: string) {
  if (!url) return null;

  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function NewsFeed({ items, isLoading, onStatusChange }: NewsFeedProps) {
  const [activeSource, setActiveSource] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');

  const sources = useMemo(() => {
    const uniqueSources = Array.from(new Set(items.map((item) => item.source)));
    return ['all', ...uniqueSources];
  }, [items]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map((item) => item.category || 'AI News')));
    return ['all', ...uniqueCategories];
  }, [items]);

  const statuses = ['all', 'new', 'tracked', 'important', 'ignored', 'archived'];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSource = activeSource === 'all' || item.source === activeSource;
      const matchesCategory = activeCategory === 'all' || (item.category || 'AI News') === activeCategory;
      const matchesStatus = activeStatus === 'all' || item.status === activeStatus;
      return matchesSource && matchesCategory && matchesStatus;
    });
  }, [activeCategory, activeSource, activeStatus, items]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-foreground">Live AI News Feed</CardTitle>
            <p className="text-sm text-muted-foreground">Fresh stories from free public sources</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter size={14} />
            <span className="text-xs uppercase tracking-wide">Source</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <Filter size={14} />
          <span className="text-xs uppercase tracking-wide">Filters</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {sources.map((source) => (
            <Button
              key={source}
              type="button"
              variant={activeSource === source ? 'default' : 'outline'}
              className={cn(
                'h-8 px-3 text-xs',
                activeSource === source
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
              onClick={() => setActiveSource(source)}
            >
              {source === 'all' ? 'All Sources' : SOURCE_LABELS[source] ?? source}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              type="button"
              variant={activeCategory === category ? 'default' : 'outline'}
              className={cn(
                'h-8 px-3 text-xs',
                activeCategory === category
                  ? 'bg-cyan-600 hover:bg-cyan-700'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'all' ? 'All Categories' : category}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status}
              type="button"
              variant={activeStatus === status ? 'default' : 'outline'}
              className={cn(
                'h-8 px-3 text-xs',
                activeStatus === status
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
              onClick={() => setActiveStatus(status)}
            >
              {status === 'all' ? 'All Statuses' : status}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            [...Array(5)].map((_, index) => (
              <div key={index} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))
          ) : filteredItems.length ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="block rounded-xl border border-border bg-card p-4 hover:border-border/80 hover:bg-muted/40 transition-colors"
              >
                <a
                  href={item.link || item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-muted text-foreground">
                          {SOURCE_LABELS[item.source] ?? item.source}
                        </Badge>
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          {item.category || 'AI News'}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          Score {item.relevanceScore ?? item.viralScore}/10
                        </Badge>
                        <Badge variant="outline" className="border-border text-muted-foreground">
                          {item.status}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-6 line-clamp-2 hover:text-cyan-500 transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {item.summary}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs">
                      <span>
                        {item.publishedAt ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true }) : 'just now'}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span>{getHostLabel(item.link || item.sourceUrl) || 'source link'}</span>
                      <ExternalLink size={14} className="text-muted-foreground" />
                    </div>
                  </div>
                </a>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Published {item.publishedAt ? new Date(item.publishedAt).toLocaleString() : 'recently'}
                  </span>
                  {item.sourceType ? (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span>{item.sourceType}</span>
                    </>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => onStatusChange?.(item.id, 'tracked')}>
                    <BookMarked size={14} className="mr-2" /> Track
                  </Button>
                  <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => onStatusChange?.(item.id, 'important')}>
                    <Star size={14} className="mr-2" /> Important
                  </Button>
                  <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => onStatusChange?.(item.id, 'ignored')}>
                    <EyeOff size={14} className="mr-2" /> Ignore
                  </Button>
                </div>
                {item.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No news items match the current filter.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
