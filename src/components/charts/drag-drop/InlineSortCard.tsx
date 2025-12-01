import React, { useCallback, useState } from 'react';
import type { SortLevel, DatasetColumnType } from '@/types/chart';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineSortCardProps {
  level: SortLevel;
  index: number;
  availableColumns: { id: string; name: string; type?: DatasetColumnType; dateFormat?: string }[];
  onUpdate: (next: SortLevel) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
  onDragStart: (columnId: string, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (columnId: string, event: React.DragEvent<HTMLDivElement>) => void;
}

const InlineSortCard: React.FC<InlineSortCardProps> = ({
  level,
  index,
  availableColumns,
  onUpdate,
  onMoveUp,
  onMoveDown,
  disableMoveUp,
  disableMoveDown,
  onDragStart,
  onDragEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const selectedColumn = (availableColumns || []).find(col => col.id === level.columnId);

  const toggleDirection = useCallback(() => {
    const nextDirection = level.direction === 'asc' ? 'desc' : 'asc';
    onUpdate({ ...level, direction: nextDirection });
  }, [level, onUpdate]);

  return (
    <div
      draggable
      onDragStart={event => {
        event.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
        onDragStart(level.columnId, event);
      }}
      onDragEnd={event => {
        onDragEnd(level.columnId, event);
        setIsDragging(false);
      }}
      className={cn(
        'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 transition-all cursor-grab active:cursor-grabbing flex items-center gap-2 h-[48px]',
        isDragging && 'opacity-0'
      )}
    >
      {/* Column name with direction badge */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
          {selectedColumn?.name || 'Select column'}
        </span>
        {/* Direction toggle badge */}
        <button
          type="button"
          onClick={toggleDirection}
          className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors focus-visible:outline-none active:scale-[0.97] flex-shrink-0 text-center"
          style={{ cursor: 'pointer', minWidth: '90px' }}
          title={`Click to change to ${level.direction === 'asc' ? 'Descending' : 'Ascending'}`}
        >
          {level.direction === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      {/* Move up/down buttons */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={disableMoveUp}
          title="Move up"
          className="h-6 w-6 flex items-center justify-center rounded text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none active:translate-y-[1px]"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={disableMoveDown}
          title="Move down"
          className="h-6 w-6 flex items-center justify-center rounded text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none active:translate-y-[1px]"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default InlineSortCard;
