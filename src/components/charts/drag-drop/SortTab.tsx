import React, { useRef, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
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

      <div className="flex flex-col">
        {/* Label with icon */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <ArrowUpDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort</span>
        </div>

        {/* Content area */}
        <div
          ref={assignDropZoneRef}
          className={cn(
            'min-h-[120px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded',
            'transition-all duration-200',
            isOver && 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 ring-2 ring-blue-400/20'
          )}
        >
          {!hasSortLevels ? (
            <div className="h-[120px] flex items-center justify-center p-4">
              <div className="text-center text-gray-400 dark:text-gray-500 text-xs">
                {isOver ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-blue-600 dark:text-blue-400 font-medium"
                  >
                    Drop field here
                  </motion.div>
                ) : (
                  <span>Drop field here</span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {sortLevels.map((level, index) => (
                <InlineSortCard
                  key={level.columnId || `sort-${index}`}
                  level={level}
                  index={index}
                  // sortLevels prop not supported in InlineSortCardProps
                  // sortLevels={sortLevels}
                  availableColumns={availableColumns}
                  onUpdate={next => handleSortUpdate(index, next)}
                  // onRemove prop not supported in InlineSortCardProps
                  // onRemove={() => handleSortRemove(index)}
                  onMoveUp={() => handleReorder(index, 'up')}
                  onMoveDown={() => handleReorder(index, 'down')}
                  disableMoveUp={index === 0}
                  disableMoveDown={index === sortLevels.length - 1}
                  onDragStart={handleCardDragStart}
                  onDragEnd={handleCardDragEnd}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SortTab;
