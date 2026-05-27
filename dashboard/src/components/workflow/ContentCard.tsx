import type { ContentItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';

const platformLabels: Record<ContentItem['platform'], string> = {
  tiktok: 'TikTok',
  youtube_short: 'YT Shorts',
  youtube_long: 'YouTube',
  instagram: 'IG',
};

interface Props {
  item: ContentItem;
}

export function ContentCard({ item }: Props) {
  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="text-[10px] bg-slate-700 text-slate-300">
            {platformLabels[item.platform]}
          </Badge>
          {item.viralScore >= 7 && (
            <Badge className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">
              🔥 {item.viralScore}
            </Badge>
          )}
        </div>
        <h4 className="text-sm font-medium text-white line-clamp-2">{item.title}</h4>
        <p className="text-xs text-slate-500 line-clamp-2">{item.summary}</p>
        <div className="flex items-center justify-between">
          <StatusBadge status={item.status} />
          <span className="text-xs text-slate-500">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
