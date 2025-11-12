'use client';

import React, { useEffect, useState } from 'react';
import { Plus, RotateCcw, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NumberFormat } from '@/contexts/DatasetContext';
import {
  generateId,
  getOperatorsForType,
  getOperatorLabelLower,
  getGranularityFromFormat,
  formatDateDisplay,
  validateDateCondition,
  validateNumberCondition,
  validateTextCondition,
  formatNumberDisplay,
} from '@/utils/filterUtils';
import type { DatasetColumnType, DatasetFilterColumn } from '@/types/chart';
import { ColumnFilterSection } from './FilterComponents';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (columns: DatasetFilterColumn[]) => void;
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  initialColumns?: DatasetFilterColumn[];
  numberFormat?: NumberFormat;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  availableColumns,
  initialColumns = [],
  numberFormat,
}) => {
  const [columns, setColumns] = useState<DatasetFilterColumn[]>(initialColumns);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Keep modal state in sync with external config
  useEffect(() => {
    if (isOpen) {
      setColumns(initialColumns);
    }
  }, [isOpen, initialColumns]);

  const handleAddColumn = () => {
    const usedIds = columns.map(c => c.columnId);
    const candidate = availableColumns.find(c => !usedIds.includes(c.id));
    if (!candidate) return;
    const newColumn: DatasetFilterColumn = {
      id: generateId(),
      columnId: candidate.id,
      columnName: candidate.name,
      columnType: candidate.type,
      conditions: [
        {
          id: generateId(),
          operator: getOperatorsForType(candidate.type)[0]?.value || 'equals',
          value: null,
        },
      ],
    };
    setColumns([...columns, newColumn]);
  };

  const handleUpdateColumn = (index: number, column: DatasetFilterColumn) => {
    const newColumns = [...columns];
    newColumns[index] = column;
    setColumns(newColumns);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setColumns([]);
    setShowResetConfirm(false);
  };

  const previewHasLines = columns.length > 0 && columns.some(c => (c.conditions || []).length > 0);

  const hasInvalid = React.useMemo(() => {
    for (const col of columns) {
      const fmt = availableColumns.find(c => c.id === col.columnId)?.dateFormat;
      const g = getGranularityFromFormat(fmt);
      for (const cond of col.conditions) {
        let err: string | null = null;
        if (col.columnType === 'date')
          err = validateDateCondition(g, cond.operator, cond.value, cond.valueEnd);
        else if (col.columnType === 'number')
          err = validateNumberCondition(cond.operator, cond.value, cond.valueEnd);
        else err = validateTextCondition(cond.operator, cond.value);
        if (err) return true;
      }
    }
    return false;
  }, [columns, availableColumns]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Configuration
            </h2>
            <Button onClick={onClose} variant="ghost" size="sm" className="h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar">
            {columns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 dark:text-gray-600 mb-3">
                  <AlertCircle className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No filters added yet
                </p>
                <Button
                  onClick={handleAddColumn}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <Plus className="w-4 h-4" />
                  Add Filter Column
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {columns.map((column, index) => (
                    <ColumnFilterSection
                      key={column.id}
                      column={column}
                      availableColumns={availableColumns}
                      usedColumnIds={columns.map(c => c.columnId)}
                      onUpdate={col => handleUpdateColumn(index, col)}
                      onRemove={() => handleRemoveColumn(index)}
                      numberFormat={numberFormat}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleAddColumn}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent w-fit"
                  disabled={availableColumns.every(c => columns.some(col => col.columnId === c.id))}
                >
                  <Plus className="w-4 h-4" />
                  Add Filter Column
                </Button>

                {previewHasLines && (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                      Applied Filters:
                    </p>
                    <div className="space-y-3">
                      {columns.map((col, idx) => (
                        <div key={col.id} className="text-xs text-blue-900 dark:text-blue-100">
                          <span className="font-semibold mr-1">{idx + 1}.</span>
                          <span className="font-medium mr-1">{col.columnName}</span>
                          {(col.conditions || []).map((cond, cidx) => (
                            <span
                              key={cond.id || cidx}
                              className="inline-flex items-center gap-1.5 mr-3"
                            >
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                                {getOperatorLabelLower(col.columnType, cond.operator)}
                              </span>
                              {cond.operator === 'between' ? (
                                <span>
                                  <span className="font-semibold">
                                    {col.columnType === 'date'
                                      ? formatDateDisplay(
                                          getGranularityFromFormat(
                                            availableColumns.find(c => c.id === col.columnId)
                                              ?.dateFormat
                                          ),
                                          cond.value as any,
                                          availableColumns.find(c => c.id === col.columnId)
                                            ?.dateFormat
                                        )
                                      : col.columnType === 'number'
                                        ? formatNumberDisplay(cond.value as any, numberFormat)
                                        : String(cond.value ?? '?')}
                                  </span>
                                  <span className="mx-1">and</span>
                                  <span className="font-semibold">
                                    {col.columnType === 'date'
                                      ? formatDateDisplay(
                                          getGranularityFromFormat(
                                            availableColumns.find(c => c.id === col.columnId)
                                              ?.dateFormat
                                          ),
                                          cond.valueEnd as any,
                                          availableColumns.find(c => c.id === col.columnId)
                                            ?.dateFormat
                                        )
                                      : col.columnType === 'number'
                                        ? formatNumberDisplay(cond.valueEnd as any, numberFormat)
                                        : String(cond.valueEnd ?? '?')}
                                  </span>
                                </span>
                              ) : (
                                <span className="font-semibold">
                                  {col.columnType === 'date'
                                    ? formatDateDisplay(
                                        getGranularityFromFormat(
                                          availableColumns.find(c => c.id === col.columnId)
                                            ?.dateFormat
                                        ),
                                        cond.value as any,
                                        availableColumns.find(c => c.id === col.columnId)
                                          ?.dateFormat
                                      )
                                    : String(cond.value ?? '?')}
                                </span>
                              )}
                              {cidx < (col.conditions?.length || 0) - 1 && (
                                <span className="text-blue-700 dark:text-blue-300">OR</span>
                              )}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setShowResetConfirm(true)}
              variant="outline"
              className="gap-2 bg-transparent"
              disabled={columns.length === 0}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={() => {
                onApply(columns);
                onClose();
              }}
              className="flex-1 gap-2"
              disabled={hasInvalid}
            >
              <Check className="w-4 h-4" />
              Apply Filter
            </Button>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-sm w-full mx-4 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Reset all filters?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to reset all filters? This action cannot be undone.
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

export default FilterModal;
