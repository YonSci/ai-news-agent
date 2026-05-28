import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newsApi, statsApi } from '@/lib/api';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { NewsFilters, type NewsFilterValues } from '@/components/dashboard/NewsFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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

  const {
    data: stats,
    isLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsApi.getDashboard().then((res) => res.data),
    refetchInterval: refreshIntervalMinutes * 60 * 1000,
    retry: 1,
  });

  const {
    data: newsItems,
    isLoading: isNewsLoading,
    isError: isNewsError,
    error: newsError,
    refetch: refetchNews,
  } = useQuery({
    queryKey: ['news-feed', appliedFilters],
    queryFn: () => newsApi.getAll(appliedFilters).then((res) => res.data),
    refetchInterval: refreshIntervalMinutes * 60 * 1000,
    retry: 1,
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

      {(isStatsError || isNewsError) && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Unable to fetch live data from API.</p>
          <p className="mt-1 text-destructive/90">
            Check Netlify environment variable VITE_API_URL and ensure it points to your Railway backend.
          </p>
          <p className="mt-1 text-destructive/80 text-xs break-words">
            {String(statsError?.message || newsError?.message || 'Unknown network error')}
          </p>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive/20"
              onClick={() => {
                refetchStats();
                refetchNews();
              }}
            >
              Retry fetch
            </Button>
          </div>
        </div>
      )}

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