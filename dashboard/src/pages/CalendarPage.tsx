import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coverageApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Bell, Clock3, Newspaper, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { CoverageEvent } from '@/types';

function formatEventTime(isoValue: string) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return isoValue;
  return date.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function eventIcon(eventType: string) {
  if (eventType === 'release_watch') return Newspaper;
  if (eventType === 'checkin') return Bell;
  if (eventType === 'review') return Clock3;
  return Calendar;
}

export function CalendarPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [startsAt, setStartsAt] = useState('');

  const { data: events, isLoading } = useQuery({
    queryKey: ['coverage-events'],
    queryFn: () => coverageApi.getAll().then((res) => res.data),
  });

  const sortedEvents = useMemo(() => {
    return [...(events || [])].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }, [events]);

  const createEvent = useMutation({
    mutationFn: (payload: Partial<CoverageEvent>) => coverageApi.create(payload),
    onSuccess: () => {
      setTitle('');
      setDetail('');
      setStartsAt('');
      queryClient.invalidateQueries({ queryKey: ['coverage-events'] });
      toast.success('Coverage event added');
    },
  });

  const completeEvent = useMutation({
    mutationFn: (id: string) => coverageApi.update(id, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverage-events'] });
      toast.success('Marked as completed');
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => coverageApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverage-events'] });
      toast.success('Coverage event deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coverage Calendar</h1>
        <p className="text-muted-foreground mt-1">Plan monitoring windows, release watch dates, and follow-up coverage</p>
        <p className="text-xs text-muted-foreground mt-2">This schedule is now dynamic. Add and manage your own monitoring checkpoints below.</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Add Coverage Event</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            className="md:col-span-1"
          />
          <Input
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Detail"
            className="md:col-span-1"
          />
          <Input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="md:col-span-1"
          />
          <Button
            className="md:col-span-1"
            onClick={() => {
              if (!title.trim() || !startsAt.trim()) {
                toast.error('Title and date/time are required');
                return;
              }
              createEvent.mutate({
                title: title.trim(),
                detail: detail.trim(),
                startsAt,
                eventType: 'monitoring',
                status: 'scheduled',
              });
            }}
          >
            <Plus size={16} className="mr-2" /> Add Event
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="space-y-4 p-6 text-muted-foreground">
          <div className="flex items-center gap-3 text-foreground">
            <Calendar size={24} className="text-amber-400" />
            <p className="text-lg font-medium text-foreground">Coverage Timeline</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading coverage events...</div>
            ) : sortedEvents.length === 0 ? (
              <div className="text-sm text-muted-foreground">No events yet. Add one above.</div>
            ) : (
              sortedEvents.map((item) => {
              const Icon = eventIcon(item.eventType);
              return (
                <div key={item.id} className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Icon size={16} className="text-amber-400" />
                    <span className="font-medium">{item.title}</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-amber-400">{formatEventTime(item.startsAt)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {item.status !== 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => completeEvent.mutate(item.id)}>
                        <CheckCircle2 size={14} className="mr-1" /> Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteEvent.mutate(item.id)}
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
