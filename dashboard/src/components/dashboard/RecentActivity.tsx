import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, TrendingUp, Play } from 'lucide-react';

const activities = [
  { id: 1, type: 'published', title: 'GPT-5 Analysis Goes Viral', time: '2h ago', platform: 'TikTok' },
  { id: 2, type: 'scripted', title: 'Claude vs GPT Comparison', time: '4h ago', platform: 'YouTube' },
  { id: 3, type: 'trending', title: 'AI Agents in 2025', time: '5h ago', platform: null },
  { id: 4, type: 'published', title: 'Sora vs Runway ML', time: '8h ago', platform: 'IG Reels' },
  { id: 5, type: 'scripted', title: 'Open Source LLMs Deep Dive', time: '12h ago', platform: 'YouTube' },
];

const typeConfig = {
  published: { icon: Play, color: 'text-red-400' },
  scripted: { icon: FileText, color: 'text-blue-400' },
  trending: { icon: TrendingUp, color: 'text-purple-400' },
  approved: { icon: CheckCircle2, color: 'text-green-400' },
};

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest pipeline updates</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = typeConfig[activity.type as keyof typeof typeConfig];
            const Icon = config.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-muted mt-0.5">
                  <Icon size={14} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    {activity.platform && (
                      <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                        {activity.platform}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
