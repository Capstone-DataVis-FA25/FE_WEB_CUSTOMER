'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SortLevelItem from './sort-level-item';
import type { SortLevel } from '@/types/chart';
import './operations.css';

interface MultiLevelSortPanelProps {
  sortLevels: SortLevel[];
  onSortChange: (sorts: SortLevel[]) => void;
  availableColumns: { id: string; name: string }[];
}

export const MultiLevelSortPanel: React.FC<MultiLevelSortPanelProps> = ({
  sortLevels,
  onSortChange,
  availableColumns,
}) => {
  const handleAddSort = () => {
    if (availableColumns.length === 0) return;
    const used = new Set(sortLevels.map(s => s.columnId));
    const next = availableColumns.find(c => !used.has(c.id));
    if (!next) return; // nothing unused left
    const newSort: SortLevel = { columnId: next.id, direction: 'asc' };
    onSortChange([...sortLevels, newSort]);
  };

  const handleUpdateSort = (index: number, updated: SortLevel) => {
    // If updating the columnId to one that already exists elsewhere, swap their positions
    const current = sortLevels[index];
    const isColumnChange = updated.columnId !== current.columnId;
    if (isColumnChange) {
      const existingIdx = sortLevels.findIndex(s => s.columnId === updated.columnId);
      if (existingIdx !== -1 && existingIdx !== index) {
        const newSorts = [...sortLevels];
        // swap positions: move this item to existingIdx and the other to index
        const temp = newSorts[existingIdx];
        newSorts[existingIdx] = { ...current }; // keep original current (with its column)
        newSorts[index] = { ...temp }; // keep the other (with its column)
        onSortChange(newSorts);
        return;
      }
    }

    const newSorts = [...sortLevels];
    newSorts[index] = updated;
    onSortChange(newSorts);
  };

  const handleRemoveSort = (index: number) => {
    onSortChange(sortLevels.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 ops-scroll">
        {sortLevels.length === 0 ? (
          <div className="py-6 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">No sort levels added yet</p>
          </div>
        ) : (
          sortLevels.map((sort, index) => (
            <SortLevelItem
              key={index}
              level={sort}
              levelIndex={index}
              availableColumns={availableColumns}
              onUpdate={handleUpdateSort}
              onRemove={handleRemoveSort}
            />
          ))
        )}
      </div>

      <Button
        onClick={handleAddSort}
        variant="outline"
        size="sm"
        className="w-full gap-2 bg-transparent rounded-xl justify-center"
        disabled={
          availableColumns.length === 0 ||
          availableColumns.every(c => sortLevels.some(s => s.columnId === c.id))
        }
      >
        <Plus className="w-4 h-4" />
        Add Sort Level
      </Button>

      {sortLevels.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">Sort Order:</p>
          <div className="flex flex-wrap gap-1">
            {sortLevels.map((sort, index) => {
              const columnName =
                availableColumns.find(c => c.id === sort.columnId)?.name || sort.columnId;
              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                >
                  <span className="font-semibold">{index + 1}.</span>
                  <span>{columnName}</span>
                  <span className="font-mono text-gray-600 dark:text-gray-400">
                    {sort.direction === 'asc' ? '↑' : '↓'}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiLevelSortPanel;
