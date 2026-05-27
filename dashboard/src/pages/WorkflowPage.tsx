import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '@/lib/api';
import { KanbanBoard } from '@/components/workflow/KanbanBoard';
import type { ContentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function WorkflowPage() {
  const queryClient = useQueryClient();
  
  const { data: items, isLoading } = useQuery({
    queryKey: ['content-items'],
    queryFn: () => contentApi.getAll().then((res) => res.data),
    refetchInterval: 10000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContentStatus }) =>
      contentApi.updateStatus(id, status).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      toast.success('Status updated');
    },
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as ContentStatus;
    
    updateStatus.mutate({ id: draggableId, status: newStatus });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['content-items'] });
    toast.info('Refreshing content...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Workflow</h1>
          <p className="text-slate-400 mt-1">
            Drag and drop to move content through the pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} className="border-slate-700 text-slate-300">
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus size={16} className="mr-2" />
            New Content
          </Button>
        </div>
      </div>

      <KanbanBoard 
        items={items || []} 
        onDragEnd={handleDragEnd}
        isLoading={isLoading}
      />
    </div>
  );
}