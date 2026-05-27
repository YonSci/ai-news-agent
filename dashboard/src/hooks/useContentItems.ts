import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '@/lib/api';
import type { ContentStatus } from '@/types';

export function useContentItems() {
  return useQuery({
    queryKey: ['content-items'],
    queryFn: () => contentApi.getAll().then((res) => res.data),
    refetchInterval: 10000,
  });
}

export function useUpdateContentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContentStatus }) =>
      contentApi.updateStatus(id, status).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
    },
  });
}
