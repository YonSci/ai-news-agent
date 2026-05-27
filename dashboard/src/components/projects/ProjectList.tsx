import type { Project } from '@/types';
import { ProjectCard } from './ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderSearch } from 'lucide-react';

interface Props {
  projects: Project[];
  isLoading: boolean;
}

export function ProjectList({ projects, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-56 bg-muted" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <FolderSearch size={48} className="mb-4 text-muted-foreground/60" />
        <p className="text-lg font-medium">No investigations yet</p>
        <p className="text-sm mt-1">Create a watchlist to track AI companies, themes, or recurring beats</p>
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
