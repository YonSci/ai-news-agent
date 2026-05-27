import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ContentStatus } from '@/types';

const config: Record<ContentStatus, { label: string; className: string }> = {
  research:   { label: 'Research',   className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  scripting:  { label: 'Scripting',  className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  review:     { label: 'Review',     className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  production: { label: 'Production', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  approved:   { label: 'Approved',   className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  published:  { label: 'Published',  className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  archived:   { label: 'Archived',   className: 'bg-muted text-muted-foreground border-border' },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const c = config[status];
  return (
    <Badge variant="outline" className={cn('text-xs border', c.className)}>
      {c.label}
    </Badge>
  );
}
