import { useQuery } from '@tanstack/react-query';
import { trendingApi } from '@/lib/api';
import { TrendingHeatmap } from '@/components/trending/TrendingHeatmap';
import { TopicList } from '@/components/trending/TopicList';
import { ViralScoreChart } from '@/components/trending/ViralScoreChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePreferencesStore } from '@/store/usePreferencesStore';

export function TrendingPage() {
  const refreshIntervalMinutes = usePreferencesStore((state) => state.refreshIntervalMinutes);
  const { data: topics, isLoading } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: () => trendingApi.getTopics().then((res) => res.data),
    refetchInterval: refreshIntervalMinutes * 60 * 1000,
  });

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
            <CardTitle className="text-foreground">Top Theme</CardTitle>
            <p className="text-sm text-muted-foreground">Most mentioned in the latest feed</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{topics?.[0]?.keyword || 'None yet'}</p>
            <p className="mt-2 text-sm text-muted-foreground">{topics?.[0]?.category || 'Waiting for data'}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Tracked Sources</CardTitle>
            <p className="text-sm text-muted-foreground">Unique source domains represented</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{topics?.length || 0}</p>
            <p className="mt-2 text-sm text-muted-foreground">Themes derived from real news items</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Momentum</CardTitle>
            <p className="text-sm text-muted-foreground">Average growth across themes</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {topics && topics.length ? Math.round(topics.reduce((sum, topic) => sum + topic.growth, 0) / topics.length) : 0}%
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Positive and negative motion combined</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Signal Heatmap</CardTitle>
            <p className="text-sm text-muted-foreground">Volume versus growth across AI categories</p>
          </CardHeader>
          <CardContent>
            <TrendingHeatmap topics={topics || []} />
          </CardContent>
        </Card>

        {/* Viral Score Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Relevance Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">How strongly current topics score across the feed</p>
          </CardHeader>
          <CardContent>
            <ViralScoreChart topics={topics || []} />
          </CardContent>
        </Card>
      </div>

      {/* Topic List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Active Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicList topics={topics || []} />
        </CardContent>
      </Card>
    </div>
  );
}