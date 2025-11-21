'use client';

import React, { useEffect, useState } from 'react';
import { Plus, RotateCcw, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SortLevel } from '@/types/chart';
import SortLevelRow from './SortLevelRow';

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (levels: SortLevel[]) => void;
  availableColumns: {
    id: string;
    name: string;
    type?: 'text' | 'number' | 'date';
    dateFormat?: string;
  }[];
  initialLevels?: SortLevel[];
}

export const SortModal: React.FC<SortModalProps> = ({
  isOpen,
  onClose,
  onApply,
  availableColumns,
  initialLevels = [],
}) => {
  const [levels, setLevels] = useState<SortLevel[]>(initialLevels);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Keep modal state in sync with external config
  useEffect(() => {
    if (isOpen) {
      setLevels(initialLevels);
    }
  }, [isOpen, initialLevels]);

  const handleAddLevel = () => {
    const usedIds = levels.map(l => l.columnId);
    const candidate = availableColumns.find(c => !usedIds.includes(c.id));
    if (!candidate) return;
    const newLevel: SortLevel = { columnId: candidate.id, direction: 'asc' };
    setLevels([...levels, newLevel]);
  };

  const handleUpdateLevel = (index: number, updated: SortLevel) => {
    // If updating the columnId to one that already exists elsewhere, swap their positions
    const current = levels[index];
    const isColumnChange = updated.columnId !== current.columnId;
    if (isColumnChange) {
      const existingIdx = levels.findIndex(l => l.columnId === updated.columnId);
      if (existingIdx !== -1 && existingIdx !== index) {
        const newLevels = [...levels];
        // swap positions: move this item to existingIdx and the other to index
        const temp = newLevels[existingIdx];
        newLevels[existingIdx] = { ...current }; // keep original current (with its column)
        newLevels[index] = { ...temp }; // keep the other (with its column)
        setLevels(newLevels);
        return;
      }
    }

    const newLevels = [...levels];
    newLevels[index] = updated;
    setLevels(newLevels);
  };

  const handleRemoveLevel = (index: number) => {
    setLevels(levels.filter((_, i) => i !== index));
  };

  const handleMoveLevel = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= levels.length) return;
    const newLevels = [...levels];
    const temp = newLevels[targetIndex];
    newLevels[targetIndex] = newLevels[index];
    newLevels[index] = temp;
    setLevels(newLevels);
  };

  const handleReset = () => {
    setLevels([]);
    setShowResetConfirm(false);
  };

  const handleApply = () => {
    onApply(levels);
    onClose();
  };

  const handleCancel = () => {
    setLevels(initialLevels);
    onClose();
  };

  const hasChanges = JSON.stringify(levels) !== JSON.stringify(initialLevels);
  const canAddMore = availableColumns.some(c => !levels.some(l => l.columnId === c.id));

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 select-none">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[85vh] flex flex-col select-none">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sort Configuration
            </h2>
            <Button onClick={handleCancel} variant="ghost" size="sm" className="h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar">
            {levels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 dark:text-gray-600 mb-3">
                  <AlertCircle className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No sort levels added yet
                </p>
                <Button
                  onClick={handleAddLevel}
                  variant="outline"
                  className="gap-2 bg-transparent"
                  disabled={availableColumns.length === 0}
                >
                  <Plus className="w-4 h-4" />
                  Add Sort Level
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {levels.map((level, index) => (
                    <SortLevelRow
                      key={index}
                      level={level}
                      levelIndex={index}
                      availableColumns={availableColumns}
                      usedColumnIds={levels.map(l => l.columnId)}
                      onUpdate={updated => handleUpdateLevel(index, updated)}
                      onRemove={() => handleRemoveLevel(index)}
                      onMoveUp={() => handleMoveLevel(index, 'up')}
                      onMoveDown={() => handleMoveLevel(index, 'down')}
                      disableMoveUp={index === 0}
                      disableMoveDown={index === levels.length - 1}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleAddLevel}
                  variant="outline"
                  className="gap-2 bg-transparent self-start"
                  disabled={!canAddMore || availableColumns.length === 0}
                >
                  <Plus className="w-4 h-4" />
                  Add Sort Level
                </Button>

                {levels.length > 0 && (
                  <div className="mt-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
                      Sort Order:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {levels.map((level, index) => {
                        const columnName =
                          availableColumns.find(c => c.id === level.columnId)?.name ||
                          level.columnId;
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40"
                          >
                            <span className="font-semibold">{index + 1}.</span>
                            <span>{columnName}</span>
                            <span className="font-mono text-blue-700 dark:text-blue-300">
                              {level.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowResetConfirm(true)}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={levels.length === 0}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!hasChanges}
              >
                <Check className="w-4 h-4" />
                Apply Sort
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 select-none">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-sm w-full mx-4 overflow-hidden select-none">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Reset all sort levels?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to reset all sort levels? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setShowResetConfirm(false)}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleReset} variant="destructive" className="flex-1">
                Confirm Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
