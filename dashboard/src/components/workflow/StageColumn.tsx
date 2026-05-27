import type { ContentItem, ContentStatus } from '@/types';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ContentCard } from './ContentCard';
import { cn } from '@/lib/utils';

interface Props {
  id: ContentStatus;
  title: string;
  icon: React.ElementType;
  color: string;
  items: ContentItem[];
}

export function StageColumn({ id, title, icon: Icon, color, items }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon size={16} className={color} />
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <Badge variant="secondary" className="ml-auto bg-muted text-muted-foreground">
          {items.length}
        </Badge>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 rounded-lg p-2 min-h-[500px] transition-colors',
              snapshot.isDraggingOver ? 'bg-muted/80' : 'bg-muted/40'
            )}
          >
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(snapshot.isDragging && 'shadow-xl ring-2 ring-purple-500 rounded-lg')}
                      >
                        <ContentCard item={item} />
                      </div>
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
}
