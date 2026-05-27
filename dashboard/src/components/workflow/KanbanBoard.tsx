import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { ContentItem, ContentStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Play,
  MessageCircle, 
  FileText, 
  CheckCircle2, 
  Clock,
  AlertCircle
} from 'lucide-react';

interface Props {
  items: ContentItem[];
  onDragEnd: (result: any) => void;
  isLoading: boolean;
}

const columns: { id: ContentStatus; title: string; icon: React.ElementType; color: string }[] = [
  { id: 'research', title: 'Research', icon: FileText, color: 'text-blue-400' },
  { id: 'scripting', title: 'Scripting', icon: MessageCircle, color: 'text-yellow-400' },
  { id: 'review', title: 'Review', icon: AlertCircle, color: 'text-orange-400' },
  { id: 'production', title: 'Production', icon: Clock, color: 'text-purple-400' },
  { id: 'approved', title: 'Approved', icon: CheckCircle2, color: 'text-green-400' },
  { id: 'published', title: 'Published', icon: Play,color: 'text-red-400' },
];

const platformIcons = {
  tiktok: 'TikTok',
  youtube_short: 'YT Shorts',
  youtube_long: 'YouTube',
  instagram: 'IG',
};

export function KanbanBoard({ items, onDragEnd, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-96 bg-slate-800" />
        ))}
      </div>
    );
  }

  const getItemsByStatus = (status: ContentStatus) => 
    items.filter((item) => item.status === status);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnItems = getItemsByStatus(column.id);
          
          return (
            <div key={column.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Icon size={16} className={column.color} />
                <h3 className="font-semibold text-sm text-slate-300">{column.title}</h3>
                <Badge variant="secondary" className="ml-auto bg-slate-800 text-slate-400">
                  {columnItems.length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex-1 rounded-lg p-2 min-h-[500px] transition-colors',
                      snapshot.isDraggingOver ? 'bg-slate-800/80' : 'bg-slate-900/50'
                    )}
                  >
                    <ScrollArea className="h-full">
                      <div className="space-y-2">
                        {columnItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  'bg-slate-800 border-slate-700 hover:border-slate-600 transition-all',
                                  snapshot.isDragging && 'shadow-xl ring-2 ring-purple-500'
                                )}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <Badge 
                                      variant="secondary" 
                                      className="text-[10px] bg-slate-700 text-slate-300"
                                    >
                                      {platformIcons[item.platform]}
                                    </Badge>
                                    {item.viralScore >= 7 && (
                                      <Badge className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">
                                        🔥 {item.viralScore}
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-medium text-white line-clamp-2 mb-1">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 line-clamp-2">
                                    {item.summary}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </ScrollArea>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}