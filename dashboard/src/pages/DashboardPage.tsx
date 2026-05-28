import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { healthApi, newsApi, statsApi } from '@/lib/api';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { NewsFilters, type NewsFilterValues } from '@/components/dashboard/NewsFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { HydrationHealth, NewsStatus } from '@/types';
import { toast } from 'sonner';
import { usePreferencesStore } from '@/store/usePreferencesStore';

function hydrationStateClasses(state?: HydrationHealth['state']) {
  if (state === 'ok') {
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
  }
  if (state === 'empty') {
    return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
  }
  if (state === 'critical') {
    return 'border-destructive/40 bg-destructive/10 text-destructive';
  }
  return 'border-border bg-muted/30 text-muted-foreground';
}

function hydrationStateLabel(state?: HydrationHealth['state']) {
  if (state === 'ok') return 'Healthy';
  if (state === 'empty') return 'Hydrating';
  if (state === 'critical') return 'Needs Attention';
  return 'Checking';
}

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
    data: hydration,
    isError: isHydrationError,
    error: hydrationError,
    refetch: refetchHydration,
  } = useQuery({
    queryKey: ['hydration-health'],
    queryFn: () => healthApi.getHydration().then((res) => res.data),
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time signal tracking across free public AI news sources
          </p>
        </div>
        <div className={`rounded-lg border px-3 py-2 text-xs ${hydrationStateClasses(hydration?.state)}`}>
          <div className="font-semibold">Backend Hydration: {hydrationStateLabel(hydration?.state)}</div>
          <div className="mt-1 text-[11px] opacity-90">
            {typeof hydration?.newsRowCount === 'number'
              ? `Stories in DB: ${hydration.newsRowCount}`
              : 'Reading backend status...'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {(isStatsError || isNewsError || isHydrationError) && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Unable to fetch live data from API.</p>
          <p className="mt-1 text-destructive/90">
            Check Netlify environment variable VITE_API_URL and ensure it points to your Railway backend.
          </p>
          <p className="mt-1 text-destructive/80 text-xs break-words">
            {String(statsError?.message || newsError?.message || hydrationError?.message || 'Unknown network error')}
          </p>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive/20"
              onClick={() => {
                refetchStats();
                refetchNews();
                refetchHydration();
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