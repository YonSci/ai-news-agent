import type { Project } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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
  low: 'bg-slate-700 text-slate-300',
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
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all">
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
          <span className="text-xs text-slate-500">{project.progress}%</span>
        </div>
        <h3 className="font-semibold text-white mt-2">{project.name}</h3>
        <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={project.progress} className="h-2 bg-slate-800" />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} />
              {completedTasks}/{totalTasks} tasks
            </span>
            {project.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(project.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs border-slate-700 text-slate-400">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}