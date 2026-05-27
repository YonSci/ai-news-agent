import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newsApi, statsApi } from '@/lib/api';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { NewsFilters, type NewsFilterValues } from '@/components/dashboard/NewsFilters';
import { Skeleton } from '@/components/ui/skeleton';
import type { NewsStatus } from '@/types';
import { toast } from 'sonner';
import { usePreferencesStore } from '@/store/usePreferencesStore';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const refreshIntervalMinutes = usePreferencesStore((state) => state.refreshIntervalMinutes);
  const defaultRegion = usePreferencesStore((state) => state.defaultRegion);
  const defaultTopic = usePreferencesStore((state) => state.defaultTopic);
  const [filters, setFilters] = useState<NewsFilterValues>({
    topic: defaultTopic,
    region: defaultRegion,
    startDate: '',
    endDate: '',
    q: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<NewsFilterValues>({
    topic: defaultTopic,
    region: defaultRegion,
    startDate: '',
    endDate: '',
    q: '',
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsApi.getDashboard().then((res) => res.data),
    refetchInterval: refreshIntervalMinutes * 60 * 1000,
  });

  const { data: newsItems, isLoading: isNewsLoading } = useQuery({
    queryKey: ['news-feed', appliedFilters],
    queryFn: () => newsApi.getAll(appliedFilters).then((res) => res.data),
    refetchInterval: refreshIntervalMinutes * 60 * 1000,
  });

  const updateNewsStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: NewsStatus }) =>
      newsApi.updateStatus(id, status).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['news-feed'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(`Marked as ${variables.status}`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-muted" />
          ))}
        </div>
        <Skeleton className="h-96 bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Real-time signal tracking across free public AI news sources
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      <NewsFilters
        value={filters}
        onChange={setFilters}
        onSearch={() => setAppliedFilters(filters)}
        onQuickSearch={(keyword) => {
          const nextFilters = { ...filters, q: keyword, topic: keyword.toLowerCase() === 'ai' ? 'ai' : filters.topic };
          setFilters(nextFilters);
          setAppliedFilters(nextFilters);
        }}
      />

      {/* Live News Feed */}
      <div className="grid grid-cols-1 gap-6">
        <NewsFeed
          items={newsItems || []}
          isLoading={isNewsLoading}
          onStatusChange={(id, status) => updateNewsStatus.mutate({ id, status })}
        />
      </div>
    </div>
  );
}