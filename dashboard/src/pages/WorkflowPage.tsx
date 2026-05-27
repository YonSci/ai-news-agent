import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsApi } from '@/lib/api';
import { NewsQueueBoard } from '@/components/workflow/NewsQueueBoard';
import type { NewsStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { DropResult } from '@hello-pangea/dnd';
import { usePreferencesStore } from '@/store/usePreferencesStore';

export function WorkflowPage() {
  const queryClient = useQueryClient();
  const refreshIntervalMinutes = usePreferencesStore((state) => state.refreshIntervalMinutes);
  
  const { data: items, isLoading } = useQuery({
    queryKey: ['news-queue'],
    queryFn: () => newsApi.getAll().then((res) => res.data),
    refetchInterval: refreshIntervalMinutes * 60 * 1000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: NewsStatus }) =>
      newsApi.updateStatus(id, status).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['news-feed'] });
      toast.success('Story status updated');
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as NewsStatus;
    
    updateStatus.mutate({ id: draggableId, status: newStatus });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['news-queue'] });
    toast.info('Refreshing story queue...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">News Queue</h1>
          <p className="text-muted-foreground mt-1">
            Drag stories across statuses to triage what to watch, prioritize, or archive
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} className="border-border text-foreground">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <NewsQueueBoard 
        items={items || []} 
        onDragEnd={handleDragEnd}
        isLoading={isLoading}
      />
    </div>
  );
}