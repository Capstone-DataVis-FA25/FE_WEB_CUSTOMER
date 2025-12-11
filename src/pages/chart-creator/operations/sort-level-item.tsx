'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { SortLevel } from '@/types/chart';

interface SortLevelItemProps {
  level: SortLevel;
  levelIndex: number;
  availableColumns: { id: string; name: string }[];
  onUpdate: (index: number, updated: SortLevel) => void;
  onRemove: (index: number) => void;
}

export const SortLevelItem: React.FC<SortLevelItemProps> = ({
  level,
  levelIndex,
  availableColumns,
  onUpdate,
  onRemove,
}) => {
  const { t } = useTranslation();
  const columnName = availableColumns.find(c => c.id === level.columnId)?.name || level.columnId;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-transparent`}
      title={columnName}
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xs font-semibold">
        {levelIndex + 1}
      </div>

      <Select
        value={level.columnId}
        onValueChange={columnId => onUpdate(levelIndex, { ...level, columnId })}
      >
        <SelectTrigger className="w-40 h-8 text-xs">
          <span className="block truncate">{columnName || 'Select column'}</span>
        </SelectTrigger>
        <SelectContent className="z-[1000]">
          {availableColumns.map(col => (
            <SelectItem key={col.id} value={col.id}>
              {col.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={level.direction}
        onValueChange={direction =>
          onUpdate(levelIndex, { ...level, direction: direction as 'asc' | 'desc' })
        }
      >
        <SelectTrigger className="w-28 h-8 text-xs">
          <span className="block truncate">
            {level.direction === 'asc' ? 'Ascending' : 'Descending'}
          </span>
        </SelectTrigger>
        <SelectContent className="z-[1000]">
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
        onClick={() => onRemove(levelIndex)}
        title={t('operations.removeSortLevel', 'Remove sort level')}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default SortLevelItem;
