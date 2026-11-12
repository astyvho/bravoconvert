"use client";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Download, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/tool/status-badge';
import { FileItem, ResultItem } from './types';

export function SortableItem({ 
  item, 
  idx, 
  result, 
  onRemove, 
  onDownload, 
  isPdfMode, 
  thumbUrl, 
  isReorderMode, 
  viewMode 
}: {
  item: FileItem;
  idx: number;
  result: ResultItem | null;
  onRemove: (idx: number) => void;
  onDownload: (idx: number) => void;
  isPdfMode?: boolean;
  thumbUrl: string | null;
  isReorderMode?: boolean;
  viewMode?: 'card' | 'list';
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const mb = `${(item.file.size / 1024 / 1024).toFixed(1)} MB`;
  const savings = result
    ? result.savings >= 0 ? `${result.savings}% smaller` : `${Math.abs(result.savings)}% larger`
    : '';
  const savingsClass = result && result.savings >= 0 ? 'text-status-clean-foreground' : 'text-muted-foreground';
  const thumb = (iconSize: number, alt: string) =>
    result ? (
      <img src={result.thumb} alt="converted" className="h-full w-full rounded-[12px] object-cover" />
    ) : thumbUrl ? (
      <img src={thumbUrl} alt={alt} className="h-full w-full rounded-[12px] object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-muted text-muted-foreground">
        <Clock size={iconSize} aria-hidden="true" />
      </div>
    );
  const removeButton = (className?: string) => (
    <Button
      variant="ghost"
      size="icon"
      className={className ?? 'h-9 w-9'}
      onClick={() => onRemove(idx)}
      aria-label={`Remove ${item.file.name}`}
    >
      <X size={16} aria-hidden="true" />
    </Button>
  );
  const dragHandle = (
    <div
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
    >
      <GripVertical size={16} aria-hidden="true" />
    </div>
  );

  if (viewMode === 'card') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative rounded-field bg-card p-3 shadow-soft ${isReorderMode ? 'cursor-move ring-2 ring-primary/40' : ''}`}
      >
        <div className="mb-2 flex items-center justify-between">
          {isReorderMode ? dragHandle : <span />}
          {removeButton('h-8 w-8')}
        </div>
        <div className="mb-2 aspect-square w-full">{thumb(24, isReorderMode ? 'thumbnail' : 'original')}</div>
        <div className="text-center">
          {isReorderMode && (
            <div className="mx-auto mb-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {idx + 1}
            </div>
          )}
          <div className="truncate px-1 text-sm font-bold text-foreground" title={item.file.name}>
            {item.file.name}
          </div>
          {result && !isReorderMode ? (
            <div className="mt-1 space-y-1">
              <StatusBadge status="clean">Converted</StatusBadge>
              <div className="text-xs text-muted-foreground">
                {result.inSize} → {result.outSize} ({result.time}s)
              </div>
              <div className={`text-xs font-semibold ${savingsClass}`}>
                {result.width} × {result.height}px · {savings}
              </div>
              <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => onDownload(idx)}>
                <Download aria-hidden="true" />
                Download
              </Button>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">{mb}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-field bg-card p-3 shadow-soft"
    >
      {isReorderMode && dragHandle}
      <div className="h-12 w-12 flex-shrink-0">{thumb(16, 'original')}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {isPdfMode && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              {idx + 1}
            </span>
          )}
          <div className="truncate text-sm font-bold text-foreground" title={item.file.name}>
            {item.file.name}
          </div>
        </div>
        {result ? (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <StatusBadge status="clean">Converted</StatusBadge>
            <span>{result.inSize} → {result.outSize}</span>
            <span>{result.width} × {result.height}px</span>
            <span className={`font-semibold ${savingsClass}`}>{savings}</span>
            <span>{result.time}s</span>
          </div>
        ) : (
          <div className="mt-0.5 text-xs text-muted-foreground">{mb}</div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {result && !isPdfMode && (
          <Button size="sm" variant="secondary" onClick={() => onDownload(idx)}>
            <Download aria-hidden="true" />
            Download
          </Button>
        )}
        {removeButton()}
      </div>
    </li>
  );
}
