import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import type { TrendingTopic } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  topics: TrendingTopic[];
}

export function TopicList({ topics }: Props) {
  const sorted = [...topics].sort((a, b) => b.growth - a.growth);

  return (
    <div className="space-y-3">
      {sorted.map((topic) => (
        <div
          key={topic.id}
          className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white truncate">{topic.keyword}</h3>
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                {topic.category}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
              <span>Vol: {topic.volume.toLocaleString()}</span>
              <span className="flex items-center gap-1">
                {topic.growth > 0 ? (
                  <TrendingUp size={14} className="text-green-400" />
                ) : topic.growth < 0 ? (
                  <TrendingDown size={14} className="text-red-400" />
                ) : (
                  <Minus size={14} className="text-yellow-400" />
                )}
                <span
                  className={cn(
                    topic.growth > 0 ? 'text-green-400' : topic.growth < 0 ? 'text-red-400' : 'text-yellow-400'
                  )}
                >
                  {topic.growth > 0 ? '+' : ''}{topic.growth}%
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    topic.sentiment === 'positive' ? 'bg-green-500' :
                    topic.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                  )}
                />
                {topic.sentiment}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ExternalLink size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}