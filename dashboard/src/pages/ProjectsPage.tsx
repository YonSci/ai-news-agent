import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/lib/api';
import type { Project } from '@/types';
import { ProjectList } from '@/components/projects/ProjectList';
import { NewProjectDialog } from '@/components/projects/NewProjectDialog';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getAll().then((res) => res.data),
  });

  const createProject = useMutation({
    mutationFn: (data: Partial<Project>) => projectApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
      toast.success('Project created successfully');
    },
  });

  const filteredProjects = (projects || []).filter((project) => {
    const haystack = [project.name, project.description, ...project.tags].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Organize investigations, watchlists, and editorial initiatives
          </p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-1">
            <label className="text-sm text-muted-foreground">Search watchlists and investigations</label>
            <div className="relative max-w-2xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, description, or tags"
                className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus size={16} className="mr-2" />
            New Investigation
          </Button>
        </CardContent>
      </Card>

      <ProjectList projects={filteredProjects} isLoading={isLoading} />

      <NewProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={(data) => createProject.mutate(data)}
        isSubmitting={createProject.isPending}
      />
    </div>
  );
}