import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Project } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Project>) => void;
  isSubmitting: boolean;
}

export function NewProjectDialog({ open, onOpenChange, onSubmit, isSubmitting }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Project['priority']>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, priority, status: 'planning', progress: 0, tasks: [], tags: [] });
    setName('');
    setDescription('');
    setPriority('medium');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project..."
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Priority</label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Project['priority'])}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? 'Creating…' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
