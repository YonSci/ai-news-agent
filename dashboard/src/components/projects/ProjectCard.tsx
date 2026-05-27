import type { Project } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle2, AlertCircle, Clock, Newspaper, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  project: Project;
}

const statusConfig = {
  planning: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  active: { icon: AlertCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
  paused: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  completed: { icon: CheckCircle2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  cancelled: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
};

const priorityConfig = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-600/20 text-blue-400',
  high: 'bg-orange-600/20 text-orange-400',
  urgent: 'bg-red-600/20 text-red-400',
};

export function ProjectCard({ project }: Props) {
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const totalTasks = project.tasks.length;

  return (
    <Card className="bg-card border-border hover:border-border/80 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded', status.bg)}>
              <StatusIcon size={16} className={status.color} />
            </div>
            <Badge variant="secondary" className={cn('text-xs', priorityConfig[project.priority])}>
              {project.priority}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{project.progress}%</span>
        </div>
        <h3 className="font-semibold text-foreground mt-2">{project.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={project.progress} className="h-2 bg-muted" />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} />
              {completedTasks}/{totalTasks} notes
            </span>
            {project.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(project.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="rounded-lg bg-muted/60 p-2">
            <div className="flex items-center gap-2 text-foreground">
              <Newspaper size={12} />
              Source focus
            </div>
            <p className="mt-1">AI companies and release notes</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-2">
            <div className="flex items-center gap-2 text-foreground">
              <Tag size={12} />
              Tags
            </div>
            <p className="mt-1">{project.tags.slice(0, 2).join(', ') || 'research'}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs border-border text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}