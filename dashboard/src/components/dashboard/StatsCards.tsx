import { 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats | undefined;
}

const cards = [
  {
    title: 'Total Content',
    key: 'totalContent',
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    title: 'Published This Week',
    key: 'publishedThisWeek',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    title: 'Avg Viral Score',
    key: 'avgViralScore',
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    suffix: '/10',
  },
  {
    title: 'Pending Review',
    key: 'pendingReview',
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key as keyof DashboardStats] ?? 0;
        const numericValue = typeof value === 'number' ? value : Number(value) || 0;
        
        return (
          <Card key={card.key} className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {card.title}
              </CardTitle>
              <div className={cn('p-2 rounded-lg', card.bg)}>
                <Icon className={cn('w-4 h-4', card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {card.suffix && <span className="text-sm text-slate-500 ml-1">{card.suffix}</span>}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {card.key === 'pendingReview' && numericValue > 0 ? 'Needs attention' : 'On track'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}