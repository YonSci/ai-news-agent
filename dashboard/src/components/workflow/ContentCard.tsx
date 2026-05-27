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
    <Card className="bg-card border-border hover:border-border/80 transition-all">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="text-[10px] bg-muted text-foreground">
            {platformLabels[item.platform]}
          </Badge>
          {item.viralScore >= 7 && (
            <Badge className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">
              🔥 {item.viralScore}
            </Badge>
          )}
        </div>
        <h4 className="text-sm font-medium text-foreground line-clamp-2">{item.title}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
        <div className="flex items-center justify-between">
          <StatusBadge status={item.status} />
          <span className="text-xs text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
