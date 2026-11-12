"use client";
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { FileItem, ResultItem } from './types';
import { Button } from '@/components/ui/button';
import { Grid3x3, List } from 'lucide-react';

export function FileList({ 
  fileArr, 
  resultArr, 
  onRemove, 
  onDownload, 
  isPdfMode, 
  onReorder, 
  isReorderMode, 
  isOrderChanged, 
  viewMode, 
  onViewModeChange 
}: {
  fileArr: FileItem[];
  resultArr: (ResultItem | null)[];
  onRemove: (idx: number) => void;
  onDownload: (idx: number) => void;
  isPdfMode?: boolean;
  onReorder?: (oldIndex: number, newIndex: number) => void;
  isReorderMode?: boolean;
  isOrderChanged?: boolean;
  viewMode?: 'card' | 'list';
  onViewModeChange?: (mode: 'card' | 'list') => void;
}) {
  const [thumbUrls, setThumbUrls] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    Promise.all(
      fileArr.map(item =>
        new Promise<string | null>(resolve => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.readAsDataURL(item.file);
        })
      )
    ).then(result => {
      if (isMounted) setThumbUrls(result);
    });
    return () => { isMounted = false; };
  }, [fileArr]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && onReorder) {
      const oldIndex = fileArr.findIndex(item => item.id === active.id);
      const newIndex = fileArr.findIndex(item => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  }

  const items = fileArr.map(item => item.id);

  // 기본값을 list로 설정
  const currentViewMode = viewMode || 'list';

  return (
    <div className="w-full">
      {/* 뷰 모드 전환 버튼 */}
      {!isPdfMode && onViewModeChange && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {fileArr.length} file{fileArr.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-1 rounded-full bg-muted p-1">
            {([['card', 'Card', Grid3x3], ['list', 'List', List]] as const).map(([mode, label, Icon]) => (
              <Button
                key={mode}
                size="sm"
                variant="ghost"
                aria-pressed={currentViewMode === mode}
                className={currentViewMode === mode ? 'h-8 bg-card px-3 text-foreground shadow-soft hover:bg-card' : 'h-8 px-3'}
                onClick={() => onViewModeChange(mode)}
              >
                <Icon size={14} aria-hidden="true" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items} 
          strategy={currentViewMode === 'card' ? rectSortingStrategy : verticalListSortingStrategy}
        >
          {currentViewMode === 'card' ? (
            // 카드 뷰
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {fileArr.map((item, idx) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  idx={idx}
                  result={resultArr[idx]}
                  onRemove={onRemove}
                  onDownload={onDownload}
                  isPdfMode={isPdfMode}
                  thumbUrl={thumbUrls[idx]}
                  isReorderMode={isReorderMode}
                  viewMode={currentViewMode}
                />
              ))}
            </div>
          ) : (
            // 리스트 뷰
            <ul className="space-y-2">
              {fileArr.map((item, idx) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  idx={idx}
                  result={resultArr[idx]}
                  onRemove={onRemove}
                  onDownload={onDownload}
                  isPdfMode={isPdfMode}
                  thumbUrl={thumbUrls[idx]}
                  isReorderMode={isReorderMode}
                  viewMode={currentViewMode}
                />
              ))}
            </ul>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
}
