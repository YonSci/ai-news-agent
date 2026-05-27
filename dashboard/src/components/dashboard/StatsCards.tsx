import { 
  FileText,
  TrendingUp,
  BookMarked,
  Star,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats | undefined;
}

const cards = [
  {
    title: 'Total Stories',
    key: 'totalStories',
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    description: 'Stories in your live feed',
  },
  {
    title: 'New Today',
    key: 'newToday',
    icon: Sparkles,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    description: 'Freshly published in the last 24h',
  },
  {
    title: 'Avg Relevance',
    key: 'avgRelevanceScore',
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    suffix: '/10',
    description: 'Signal strength across sources',
  },
  {
    title: 'Tracked',
    key: 'trackedCount',
    icon: BookMarked,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    description: 'Items you want to keep watching',
  },
  {
    title: 'Important',
    key: 'importantCount',
    icon: Star,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    description: 'Highest priority developments',
  },
  {
    title: 'Ignored',
    key: 'ignoredCount',
    icon: EyeOff,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    description: 'Filtered out from active triage',
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key as keyof DashboardStats] ?? 0;
        
        return (
          <Card key={card.key} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={cn('p-2 rounded-lg', card.bg)}>
                <Icon className={cn('w-4 h-4', card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {card.suffix && <span className="text-sm text-muted-foreground ml-1">{card.suffix}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}