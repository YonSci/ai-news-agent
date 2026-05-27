import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Bell, Clock3, Newspaper } from 'lucide-react';

export function CalendarPage() {
  const coverageItems = [
    { title: 'OpenAI release watch', time: 'Today · 10:00', icon: Newspaper, detail: 'Monitor product and model updates' },
    { title: 'Anthropic and Claude check-in', time: 'Tomorrow · 14:30', icon: Bell, detail: 'Track blog posts and SDK releases' },
    { title: 'Weekly theme review', time: 'Friday · 09:00', icon: Clock3, detail: 'Review tracked and important stories' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coverage Calendar</h1>
        <p className="text-muted-foreground mt-1">Plan monitoring windows, release watch dates, and follow-up coverage</p>
      </div>
      <Card className="bg-card border-border">
        <CardContent className="space-y-4 p-6 text-muted-foreground">
          <div className="flex items-center gap-3 text-foreground">
            <Calendar size={24} className="text-amber-400" />
            <p className="text-lg font-medium text-foreground">Coverage Timeline</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {coverageItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Icon size={16} className="text-amber-400" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-amber-400">{item.time}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
