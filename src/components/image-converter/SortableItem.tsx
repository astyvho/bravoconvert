"use client";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Download, X, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  if (viewMode === 'card') {
    // 카드 뷰
    if (isReorderMode) {
      // 순서 변경 모드 (PDF용)
      return (
        <div
          ref={setNodeRef}
          style={style}
          className="bg-white rounded-xl shadow-md border-2 border-gray-400 hover:border-gray-600 hover:shadow-lg cursor-move transition-all relative group"
        >
          {/* 상단 컨트롤 영역 */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-gray-500 hover:text-red-500 hover:bg-white/80 rounded-full"
              onClick={() => onRemove(idx)}
            >
              <X size={14} />
            </Button>
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-black p-1 hover:bg-white/80 rounded"
            >
              <GripVertical size={16} />
            </div>
          </div>

          {/* 이미지 영역 */}
          <div className="p-3 pt-8">
            <div className="aspect-square w-full mb-2 flex items-center justify-center">
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt="thumbnail"
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                  <span className="text-2xl font-bold">?</span>
                </div>
              )}
            </div>

            {/* 파일 정보 */}
            <div className="text-center">
              <div className="text-lg font-bold text-white bg-black rounded-full w-6 h-6 flex items-center justify-center mx-auto mb-2">
                {idx + 1}
              </div>
              <div className="text-sm font-bold text-black mb-1 truncate px-1" title={item.file.name}>
                {item.file.name}
              </div>
              <div className="text-xs text-gray-500">
                {(item.file.size / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // 일반 카드 뷰 (이미지 변환용)
      return (
        <div
          ref={setNodeRef}
          style={style}
          className="bg-white rounded-xl shadow-md border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all relative group"
        >
          {/* 상단 컨트롤 */}
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-gray-500 hover:text-red-500 hover:bg-white/80 rounded-full"
              onClick={() => onRemove(idx)}
            >
              <X size={14} />
            </Button>
          </div>

          {/* 이미지 영역 */}
          <div className="p-3">
            <div className="aspect-square w-full mb-3 flex items-center justify-center">
              {result ? (
                <img
                  src={result.thumb}
                  alt="converted"
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
              ) : thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt="original"
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                  <Clock size={24} />
                </div>
              )}
            </div>

            {/* 파일 정보 */}
            <div className="text-center">
              <div className="text-sm font-bold text-black mb-1 truncate px-1" title={item.file.name}>
                {item.file.name}
              </div>
              
              {result ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-green-600">
                    <CheckCircle size={14} />
                    <span className="text-xs font-medium">Converted</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.inSize} → {result.outSize} ({result.time}s)
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onDownload(idx)}
                    className="w-full mt-2 rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <Download size={14} className="mr-1" />
                    Download
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  {(item.file.size / 1024 / 1024).toFixed(1)} MB
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  } else {
    // 리스트 뷰
    return (
      <li
        ref={setNodeRef}
        style={style}
        className="flex items-center bg-white rounded-xl shadow-md border border-gray-200 hover:border-gray-400 p-3 gap-4 transition-all"
      >
        {/* 드래그 핸들 (순서 변경 모드일 때만) */}
        {isReorderMode && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-black p-1"
          >
            <GripVertical size={16} />
          </div>
        )}

        {/* 썸네일 */}
        <div className="w-12 h-12 flex-shrink-0">
          {result ? (
            <img
              src={result.thumb}
              alt="converted"
              className="w-full h-full object-cover rounded-lg border border-gray-200"
            />
          ) : thumbUrl ? (
            <img
              src={thumbUrl}
              alt="original"
              className="w-full h-full object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
              <Clock size={16} />
            </div>
          )}
        </div>

        {/* 파일 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isPdfMode && (
              <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-bold">
                {idx + 1}
              </span>
            )}
            <div className="font-medium text-black truncate" title={item.file.name}>
              {item.file.name}
            </div>
          </div>
          
          {result ? (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle size={14} />
                <span>Converted</span>
              </div>
              <span>{result.inSize} → {result.outSize}</span>
              <span>{result.time}s</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {(item.file.size / 1024 / 1024).toFixed(1)} MB
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2">
          {result && !isPdfMode && (
            <Button
              size="sm"
              onClick={() => onDownload(idx)}
              className="flex items-center gap-1 rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Download size={14} />
              Download
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-red-500"
            onClick={() => onRemove(idx)}
          >
            <X size={16} />
          </Button>
        </div>
      </li>
    );
  }
}
