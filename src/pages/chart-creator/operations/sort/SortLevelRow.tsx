'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { SortLevel } from '@/types/chart';

interface SortLevelRowProps {
  level: SortLevel;
  levelIndex: number;
  availableColumns: { id: string; name: string }[];
  usedColumnIds: string[];
  onUpdate: (updated: SortLevel) => void;
  onRemove: () => void;
}

export const SortLevelRow: React.FC<SortLevelRowProps> = ({
  level,
  levelIndex,
  availableColumns,
  usedColumnIds,
  onUpdate,
  onRemove,
}) => {
  const columnName = availableColumns.find(c => c.id === level.columnId)?.name || level.columnId;

  // Filter out already used columns, but include the current one
  const availableOptions = availableColumns.filter(
    c => c.id === level.columnId || !usedColumnIds.includes(c.id)
  );

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xs font-semibold">
        {levelIndex + 1}
      </div>

      <div className="flex gap-2 items-center flex-1 min-w-0">
        <Select value={level.columnId} onValueChange={columnId => onUpdate({ ...level, columnId })}>
          <SelectTrigger className="flex-1 min-w-0 h-9 text-xs">
            <span className="block truncate">{columnName || 'Select column'}</span>
          </SelectTrigger>
          <SelectContent>
            {availableOptions.map(col => (
              <SelectItem key={col.id} value={col.id}>
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={level.direction}
          onValueChange={direction =>
            onUpdate({ ...level, direction: direction as 'asc' | 'desc' })
          }
        >
          <SelectTrigger className="w-32 h-9 text-xs flex-shrink-0">
            <span className="block truncate">
              {level.direction === 'asc' ? 'Ascending' : 'Descending'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
          onClick={onRemove}
          title="Remove sort level"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SortLevelRow;
