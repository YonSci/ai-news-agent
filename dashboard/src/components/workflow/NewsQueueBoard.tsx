import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { NewsItem, NewsStatus } from '@/types';
import { BookMarked, EyeOff, Flame, Newspaper, Star, Archive } from 'lucide-react';

interface NewsQueueBoardProps {
  items: NewsItem[];
  isLoading: boolean;
  onDragEnd: (result: DropResult) => void;
}

const columns: { id: NewsStatus; title: string; icon: React.ElementType; color: string }[] = [
  { id: 'new', title: 'New', icon: Newspaper, color: 'text-cyan-400' },
  { id: 'tracked', title: 'Tracked', icon: BookMarked, color: 'text-blue-400' },
  { id: 'important', title: 'Important', icon: Star, color: 'text-amber-400' },
  { id: 'ignored', title: 'Ignored', icon: EyeOff, color: 'text-muted-foreground' },
  { id: 'archived', title: 'Archived', icon: Archive, color: 'text-emerald-400' },
];

export function NewsQueueBoard({ items, isLoading, onDragEnd }: NewsQueueBoardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-96 bg-muted" />
        ))}
      </div>
    );
  }

  const itemsByStatus = (status: NewsStatus) => items.filter((item) => item.status === status);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {columns.map((column) => {
          const Icon = column.icon;
          const columnItems = itemsByStatus(column.id);

          return (
            <div key={column.id} className="flex flex-col">
              <div className="mb-3 flex items-center gap-2 px-1">
                <Icon size={16} className={column.color} />
                <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                <Badge variant="secondary" className="ml-auto bg-muted text-muted-foreground">
                  {columnItems.length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'min-h-[520px] flex-1 rounded-lg p-2 transition-colors',
                      snapshot.isDraggingOver ? 'bg-muted/80' : 'bg-muted/40'
                    )}
                  >
                    <ScrollArea className="h-full">
                      <div className="space-y-2">
                        {columnItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <Card
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={cn(
                                  'border-border bg-card transition-all hover:border-border/80',
                                  dragSnapshot.isDragging && 'ring-2 ring-cyan-500 shadow-xl'
                                )}
                              >
                                <CardContent className="space-y-3 p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <Badge variant="secondary" className="bg-muted text-[10px] text-foreground">
                                      {item.source}
                                    </Badge>
                                    <Badge className="border-red-500/30 bg-red-500/20 text-[10px] text-red-300">
                                      <Flame size={10} className="mr-1" />
                                      {item.relevanceScore ?? item.viralScore}
                                    </Badge>
                                  </div>

                                  <div>
                                    <h4 className="line-clamp-2 text-sm font-medium text-foreground">{item.title}</h4>
                                    <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{item.summary}</p>
                                  </div>

                                  <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="outline" className="border-border text-[10px] text-muted-foreground">
                                      {item.category || 'AI News'}
                                    </Badge>
                                    {item.tags?.slice(0, 2).map((tag) => (
                                      <Badge key={tag} variant="outline" className="border-border text-[10px] text-muted-foreground">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>

                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'recent'}</span>
                                    <a href={item.link || item.sourceUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300">
                                      Open
                                    </a>
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