import { useQuery } from '@tanstack/react-query';
import { trendingApi } from '@/lib/api';
import { TrendingHeatmap } from '@/components/trending/TrendingHeatmap';
import { TopicList } from '@/components/trending/TopicList';
import { ViralScoreChart } from '@/components/trending/ViralScoreChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TrendingPage() {
  const { data: topics, isLoading } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: () => trendingApi.getTopics().then((res) => res.data),
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 bg-slate-800" />
          <Skeleton className="h-96 bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Trending Topics</h1>
        <p className="text-slate-400 mt-1">
          Real-time AI/ML trending topics across the web
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Topic Heatmap</CardTitle>
            <p className="text-sm text-slate-400">Volume vs Growth across categories</p>
          </CardHeader>
          <CardContent>
            <TrendingHeatmap topics={topics || []} />
          </CardContent>
        </Card>

        {/* Viral Score Distribution */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Viral Potential</CardTitle>
            <p className="text-sm text-slate-400">Score distribution</p>
          </CardHeader>
          <CardContent>
            <ViralScoreChart topics={topics || []} />
          </CardContent>
        </Card>
      </div>

      {/* Topic List */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Active Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicList topics={topics || []} />
        </CardContent>
      </Card>
    </div>
  );
}