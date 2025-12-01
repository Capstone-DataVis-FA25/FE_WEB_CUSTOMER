'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
import type { DatasetColumnType, DatasetFilterColumn, DatasetFilterCondition } from '@/types/chart';
import { ColumnFilterSection } from './FilterComponents';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (columns: DatasetFilterColumn[]) => void;
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  initialColumns?: DatasetFilterColumn[];
  numberFormat?: NumberFormat;
  uniqueValuesByColumn?: Record<string, string[]>;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  availableColumns,
  initialColumns = [],
  numberFormat,
  uniqueValuesByColumn,
}) => {
  const [columns, setColumns] = useState<DatasetFilterColumn[]>(initialColumns);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const resolveUniqueValues = useCallback(
    (col: DatasetFilterColumn): string[] | undefined => {
      const meta = availableColumns.find(c => c.id === col.columnId);
      const candidates = [col.columnId, meta?.id, meta?.name, col.columnName].filter(
        Boolean
      ) as string[];
      for (const candidate of candidates) {
        if (candidate && uniqueValuesByColumn?.[candidate]) {
          return uniqueValuesByColumn[candidate];
        }
      }
      return undefined;
    },
    [availableColumns, uniqueValuesByColumn]
  );

  const logColumnMeta = useCallback(
    (label: string, col: DatasetFilterColumn) => {
      const meta = availableColumns.find(c => c.id === col.columnId);
      console.log('[FilterModal]', label, {
        columnId: col.columnId,
        columnName: col.columnName,
        columnType: col.columnType,
        detectedFormat: meta?.dateFormat || '(none)',
      });
    },
    [availableColumns]
  );

  const formatSingleValue = useCallback(
    (col: DatasetFilterColumn, raw: string | number | null | undefined) => {
      const meta = availableColumns.find(c => c.id === col.columnId);
      if (col.columnType === 'date') {
        logColumnMeta('formatSingleValue', col);
      }
      if (raw == null || raw === '') return '(blank)';
      if (col.columnType === 'date') {
        return formatDateDisplay(
          getGranularityFromFormat(meta?.dateFormat),
          raw as any,
          meta?.dateFormat
        );
      }
      if (col.columnType === 'number') {
        return formatNumberDisplay(String(raw), numberFormat);
      }
      return String(raw);
    },
    [availableColumns, numberFormat]
  );

  const formatValueSummary = useCallback(
    (col: DatasetFilterColumn, cond: DatasetFilterCondition) => {
      if (Array.isArray(cond.value)) {
        if (cond.value.length === 0) return '(none selected)';
        const formatted = cond.value.map(v => formatSingleValue(col, v));
        if (formatted.length <= 3) return formatted.join(', ');
        return `${formatted.slice(0, 3).join(', ')}, +${formatted.length - 3} more`;
      }
      return formatSingleValue(col, cond.value as any);
    },
    [formatSingleValue]
  );

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
    // Use non-unique-picker operators by default to avoid loading all unique values
    const operators = getOperatorsForType(candidate.type);
    // Default operators are now at index 0 (contains for text, greater_than for number/date)
    const defaultOperator = operators[0]?.value || 'contains';
    const newColumn: DatasetFilterColumn = {
      id: generateId(),
      columnId: candidate.id,
      columnName: candidate.name,
      columnType: candidate.type,
      conditions: [
        {
          id: generateId(),
          operator: defaultOperator,
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

  const hasInvalid = useMemo(() => {
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

  // Use portal to render modal at body level to avoid z-index/overflow issues
  const modalContent = (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] select-none">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[85vh] flex flex-col select-none">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Configuration
            </h2>
            <Button onClick={onClose} variant="ghost" size="sm" className="h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-6 min-h-0 overflow-y-auto custom-scrollbar">
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
                <div className="flex flex-col gap-4">
                  {columns.map((column, index) => (
                    <ColumnFilterSection
                      key={column.id}
                      column={column}
                      availableColumns={availableColumns}
                      usedColumnIds={columns.map(c => c.columnId)}
                      onUpdate={col => handleUpdateColumn(index, col)}
                      onRemove={() => handleRemoveColumn(index)}
                      numberFormat={numberFormat}
                      uniqueValues={resolveUniqueValues(column)}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleAddColumn}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent w-fit mt-1"
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
                                    {formatSingleValue(col, cond.value as any)}
                                  </span>
                                  <span className="mx-1">and</span>
                                  <span className="font-semibold">
                                    {formatSingleValue(col, cond.valueEnd as any)}
                                  </span>
                                </span>
                              ) : (
                                <span className="font-semibold">
                                  {formatValueSummary(col, cond)}
                                </span>
                              )}
                              {cidx < (col.conditions?.length || 0) - 1 && (
                                <span className="text-blue-700 dark:text-blue-300">AND</span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[101] select-none">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-sm w-full mx-4 overflow-hidden select-none">
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

  // Only use portal if document.body exists (client-side)
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }

  // Fallback for SSR
  return modalContent;
};

export default FilterModal;
