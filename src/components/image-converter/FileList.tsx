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
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {fileArr.length} file{fileArr.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 shadow-lg border border-gray-200">
            <Button
              size="sm"
              className={`flex items-center gap-1 rounded-lg transition-all duration-300 ${
                currentViewMode === 'card' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
              onClick={() => onViewModeChange('card')}
            >
              <Grid3x3 size={14} />
              Card
            </Button>
            <Button
              size="sm"
              className={`flex items-center gap-1 rounded-lg transition-all duration-300 ${
                currentViewMode === 'list' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
              }`}
              onClick={() => onViewModeChange('list')}
            >
              <List size={14} />
              List
            </Button>
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
            <div className={`grid gap-4 ${
              fileArr.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
              fileArr.length === 2 ? 'grid-cols-2 max-w-md mx-auto' :
              fileArr.length === 3 ? 'grid-cols-3 max-w-lg mx-auto' :
              'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
            }`}>
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
