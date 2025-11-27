import React, { useRef, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Plus, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortSummaryButton } from '@/pages/chart-creator/operations/sort/SortSummaryButton';
import InlineSortCard from './InlineSortCard';
import type { SortLevel, DatasetColumnType } from '@/types/chart';

interface SortTabProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  sortLevels: SortLevel[];
  onSortChange: (levels: SortLevel[]) => void;
}

const SortTab: React.FC<SortTabProps> = ({ availableColumns, sortLevels, onSortChange }) => {
  const dragRegionRef = useRef<HTMLDivElement | null>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: 'sort-drop-zone',
    data: { zone: 'sort' },
  });
  const assignDropZoneRef = useCallback(
    (node: HTMLDivElement | null) => {
      dragRegionRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  const handleSortUpdate = useCallback(
    (index: number, next: SortLevel) => {
      const nextLevels = [...sortLevels];
      nextLevels[index] = next;
      onSortChange(nextLevels);
    },
    [sortLevels, onSortChange]
  );

  const handleSortRemove = useCallback(
    (index: number) => {
      const nextLevels = sortLevels.filter((_, i) => i !== index);
      onSortChange(nextLevels);
    },
    [sortLevels, onSortChange]
  );

  const handleReorder = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sortLevels.length) return;
      const nextLevels = [...sortLevels];
      const temp = nextLevels[targetIndex];
      nextLevels[targetIndex] = nextLevels[index];
      nextLevels[index] = temp;
      onSortChange(nextLevels);
    },
    [sortLevels, onSortChange]
  );

  const handleCardDragStart = useCallback(
    (_columnId: string, event: React.DragEvent<HTMLDivElement>) => {
      const element = event.currentTarget as HTMLElement | null;
      if (!element) return;
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.width = `${element.clientWidth}px`;
      clone.style.pointerEvents = 'none';
      clone.style.opacity = '0.7';
      document.body.appendChild(clone);
      event.dataTransfer.setDragImage(clone, element.clientWidth / 2, 24);
      requestAnimationFrame(() => {
        if (clone && clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      });
    },
    []
  );

  const handleCardDragEnd = useCallback(
    (columnId: string, event: React.DragEvent<HTMLDivElement>) => {
      const bounds = dragRegionRef.current?.getBoundingClientRect();
      const { clientX, clientY } = event;
      const droppedInside =
        bounds &&
        clientX >= bounds.left &&
        clientX <= bounds.right &&
        clientY >= bounds.top &&
        clientY <= bounds.bottom;
      if (!droppedInside) {
        const index = sortLevels.findIndex(level => level.columnId === columnId);
        if (index !== -1) {
          handleSortRemove(index);
        }
      }
    },
    [sortLevels, handleSortRemove]
  );

  const hasSortLevels = (sortLevels?.length || 0) > 0;

  return (
    <motion.div
      key="sort"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col"
    >
      <div className="mb-3">
        <SortSummaryButton
          availableColumns={availableColumns}
          initialLevels={sortLevels}
          onSortChange={onSortChange}
        />
      </div>

      {!hasSortLevels ? (
        <div
          ref={assignDropZoneRef}
          className={cn(
            'relative rounded-xl border-2 border-dashed transition-all duration-300 w-full h-[200px] flex items-center justify-center mb-4 overflow-hidden',
            isOver
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50'
          )}
        >
          {isOver ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-2 justify-center text-lg">
                <Plus className="w-6 h-6" />
                Drop column here to add sort level
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500">
              <ArrowUpDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Drop column here to add sort level</p>
              <p className="text-xs mt-1 opacity-75">Drag a column from above into this area</p>
            </div>
          )}
        </div>
      ) : (
        <div
          ref={assignDropZoneRef}
          className={cn(
            'relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-3 -mx-2 shadow-inner shadow-black/5 transition-colors',
            isOver ? 'ring-2 ring-green-400/60' : ''
          )}
        >
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium mb-2 px-1">
            <span className="text-gray-700 dark:text-gray-200 normal-case font-semibold">
              {sortLevels.length} sort {sortLevels.length === 1 ? 'level' : 'levels'}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              Drop columns to add
            </span>
          </div>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 preview-scrollbar pb-1">
            {sortLevels.map((level, index) => (
              <InlineSortCard
                key={level.columnId || `sort-${index}`}
                level={level}
                index={index}
                sortLevels={sortLevels}
                availableColumns={availableColumns}
                onUpdate={next => handleSortUpdate(index, next)}
                onRemove={() => handleSortRemove(index)}
                onMoveUp={() => handleReorder(index, 'up')}
                onMoveDown={() => handleReorder(index, 'down')}
                disableMoveUp={index === 0}
                disableMoveDown={index === sortLevels.length - 1}
                onDragStart={handleCardDragStart}
                onDragEnd={handleCardDragEnd}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SortTab;
