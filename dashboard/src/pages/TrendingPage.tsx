import { useQuery } from '@tanstack/react-query';
import { trendingApi } from '@/lib/api';
import { TrendingHeatmap } from '@/components/trending/TrendingHeatmap';
import { TopicList } from '@/components/trending/TopicList';
import { ViralScoreChart } from '@/components/trending/ViralScoreChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { Info } from 'lucide-react';

function InfoHint({ text }: { text: string }) {
  return (
    <span className="inline-flex align-middle" title={text} aria-label={text}>
      <Info size={14} className="text-muted-foreground hover:text-foreground cursor-help" />
    </span>
  );
}

export function TrendingPage() {
  const refreshIntervalMinutes = usePreferencesStore((state) => state.refreshIntervalMinutes);
  const { data: topics, isLoading } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: () => trendingApi.getTopics().then((res) => res.data),
    refetchInterval: refreshIntervalMinutes * 60 * 1000,
  });

  const trackedSources = topics
    ? new Set(topics.flatMap((topic) => topic.sources || [])).size
    : 0;

  const averageMomentum = topics && topics.length
    ? Math.round(topics.reduce((sum, topic) => sum + topic.growth, 0) / topics.length)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 bg-muted" />
          <Skeleton className="h-96 bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">News Signals</h1>
        <p className="text-muted-foreground mt-1">
          Fast view of AI themes and momentum across your monitored sources
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              Top Theme
              <InfoHint text="The strongest topic right now, ranked by combined volume and growth." />
            </CardTitle>
            <p className="text-sm text-muted-foreground">Most dominant topic right now based on volume and trend</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{topics?.[0]?.keyword || 'None yet'}</p>
            <p className="mt-2 text-sm text-muted-foreground">{topics?.[0]?.category || 'Waiting for data'}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              Tracked Sources
              <InfoHint text="How many distinct source channels are contributing to active themes." />
            </CardTitle>
            <p className="text-sm text-muted-foreground">Unique source channels currently contributing to signals</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{trackedSources}</p>
            <p className="mt-2 text-sm text-muted-foreground">Counted from all active themes in this view</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              Momentum
              <InfoHint text="Average growth rate across all visible themes." />
            </CardTitle>
            <p className="text-sm text-muted-foreground">Average movement across all active themes</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{averageMomentum}%</p>
            <p className="mt-2 text-sm text-muted-foreground">Positive means acceleration, negative means cooldown</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            How To Read This Page
            <InfoHint text="Quick glossary for reading signal and trend metrics." />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-3">
          <p><span className="text-foreground font-medium">Volume:</span> how often a theme appears in your news feed.</p>
          <p><span className="text-foreground font-medium">Growth:</span> how fast a theme is rising or falling recently.</p>
          <p><span className="text-foreground font-medium">Sentiment:</span> estimated quality signal from relevance scores.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              Signal Heatmap
              <InfoHint text="Bubble chart where x=volume, y=growth, size=movement strength, color=sentiment." />
            </CardTitle>
            <p className="text-sm text-muted-foreground">Each bubble is a topic. Right = bigger, Up = growing faster.</p>
          </CardHeader>
          <CardContent>
            <TrendingHeatmap topics={topics || []} />
          </CardContent>
        </Card>

        {/* Viral Score Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              Growth Distribution
              <InfoHint text="Bar comparison of trend change percentages for the top visible themes." />
            </CardTitle>
            <p className="text-sm text-muted-foreground">Quick comparison of which themes are climbing or cooling</p>
          </CardHeader>
          <CardContent>
            <ViralScoreChart topics={topics || []} />
          </CardContent>
        </Card>
      </div>

      {/* Topic List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            Active Themes
            <InfoHint text="Topic list sorted by fastest growth, with volume and sentiment indicators." />
          </CardTitle>
          <p className="text-sm text-muted-foreground">Ranked by fastest growth so you can spot momentum first</p>
        </CardHeader>
        <CardContent>
          <TopicList topics={topics || []} />
        </CardContent>
      </Card>
    </div>
  );
}