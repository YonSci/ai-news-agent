import type { Project } from '@/types';
import { ProjectCard } from './ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderKanban } from 'lucide-react';

interface Props {
  projects: Project[];
  isLoading: boolean;
}

export function ProjectList({ projects, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-56 bg-slate-800" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <FolderKanban size={48} className="mb-4 text-slate-700" />
        <p className="text-lg font-medium">No projects yet</p>
        <p className="text-sm mt-1">Create a project to start tracking your content campaigns</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
