'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export type ColumnType = 'text' | 'number' | 'date';

export interface FilterCondition {
  id: string;
  operator: string;
  value: string | number | null;
  valueEnd?: string | number | null;
}

export interface FilterColumn {
  id: string;
  columnId: string;
  columnName: string;
  columnType: ColumnType;
  conditions: FilterCondition[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (columns: FilterColumn[]) => void;
  availableColumns: { id: string; name: string; type: ColumnType }[];
  initialColumns?: FilterColumn[];
}

const getOperatorsForType = (type: ColumnType): { value: string; label: string }[] => {
  switch (type) {
    case 'text':
      return [
        { value: 'equals', label: 'equals' },
        { value: 'contains', label: 'contains' },
        { value: 'not_contains', label: 'not contains' },
        { value: 'starts_with', label: 'starts with' },
        { value: 'ends_with', label: 'ends with' },
      ];
    case 'number':
      return [
        { value: 'equals', label: 'equals' },
        { value: 'greater_than', label: 'greater than' },
        { value: 'less_than', label: 'less than' },
        { value: 'between', label: 'between' },
      ];
    case 'date':
      return [
        { value: 'equals', label: 'equals' },
        { value: 'after', label: 'after' },
        { value: 'before', label: 'before' },
        { value: 'between', label: 'between' },
      ];
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const getOperatorLabelLower = (type: ColumnType, operator: string): string => {
  const operators = getOperatorsForType(type);
  return operators.find(o => o.value === operator)?.label || operator.replace(/_/g, ' ');
};

const ConditionRow: React.FC<{
  condition: FilterCondition;
  operator: string;
  columnType: ColumnType;
  onUpdate: (condition: FilterCondition) => void;
  onRemove: () => void;
  isOr: boolean;
}> = ({ condition, operator, columnType, onUpdate, onRemove, isOr }) => {
  const operators = getOperatorsForType(columnType);

  return (
    <div className="flex gap-2 items-end">
      {isOr && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
          OR
        </span>
      )}

      <Select value={operator} onValueChange={value => onUpdate({ ...condition, operator: value })}>
        <SelectTrigger className="w-28 h-9 text-xs outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0">
          <span className="block truncate">{getOperatorLabelLower(columnType, operator)}</span>
        </SelectTrigger>
        <SelectContent>
          {operators.map(op => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {operator === 'between' ? (
        <>
          <Input
            type="text"
            placeholder="From"
            value={condition.value || ''}
            onChange={e => onUpdate({ ...condition, value: e.target.value })}
            className="w-24 h-9 text-xs"
          />
          <Input
            type="text"
            placeholder="To"
            value={condition.valueEnd || ''}
            onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
            className="w-24 h-9 text-xs"
          />
        </>
      ) : (
        <Input
          type="text"
          placeholder="Value"
          value={condition.value || ''}
          onChange={e => onUpdate({ ...condition, value: e.target.value })}
          className="flex-1 h-9 text-xs"
        />
      )}

      <Button
        onClick={onRemove}
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

const ColumnFilterSection: React.FC<{
  column: FilterColumn;
  availableColumns: { id: string; name: string; type: ColumnType }[];
  usedColumnIds: string[];
  onUpdate: (column: FilterColumn) => void;
  onRemove: () => void;
}> = ({ column, availableColumns, usedColumnIds, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddCondition = () => {
    const newCondition: FilterCondition = {
      id: generateId(),
      operator: getOperatorsForType(column.columnType)[0]?.value || 'equals',
      value: null,
    };
    onUpdate({
      ...column,
      conditions: [...column.conditions, newCondition],
    });
  };

  const handleUpdateCondition = (index: number, condition: FilterCondition) => {
    const newConditions = [...column.conditions];
    newConditions[index] = condition;
    onUpdate({ ...column, conditions: newConditions });
  };

  const handleRemoveCondition = (index: number) => {
    onUpdate({
      ...column,
      conditions: column.conditions.filter((_, i) => i !== index),
    });
  };

  const handleColumnChange = (newColumnId: string) => {
    const selectedColumn = availableColumns.find(c => c.id === newColumnId);
    if (selectedColumn) {
      const newCondition: FilterCondition = {
        id: generateId(),
        operator: getOperatorsForType(selectedColumn.type)[0]?.value || 'equals',
        value: null,
      };
      onUpdate({
        ...column,
        columnId: newColumnId,
        columnName: selectedColumn.name,
        columnType: selectedColumn.type,
        conditions: [newCondition],
      });
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100 flex-1 min-w-0"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-sm truncate">{column.columnName}</span>
        </button>

        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {isExpanded && (
        <>
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Column
            </label>
            <Select value={column.columnId} onValueChange={handleColumnChange}>
              <SelectTrigger className="w-full h-9 text-xs outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0">
                <span className="block truncate">
                  {availableColumns.find(c => c.id === column.columnId)?.name ||
                    column.columnName ||
                    column.columnId}
                </span>
              </SelectTrigger>
              <SelectContent>
                {availableColumns
                  .filter(col => !usedColumnIds.includes(col.id) || col.id === column.columnId)
                  .map(col => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {column.conditions.map((condition, index) => (
              <ConditionRow
                key={condition.id}
                condition={condition}
                operator={condition.operator}
                columnType={column.columnType}
                onUpdate={c => handleUpdateCondition(index, c)}
                onRemove={() => handleRemoveCondition(index)}
                isOr={index > 0}
              />
            ))}
          </div>

          <Button
            onClick={handleAddCondition}
            variant="outline"
            size="sm"
            className="text-xs h-8 gap-1 bg-transparent w-full"
          >
            <Plus className="w-3 h-3" />
            Add Condition
          </Button>
        </>
      )}
    </div>
  );
};

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  availableColumns,
  initialColumns = [],
}) => {
  const [columns, setColumns] = useState<FilterColumn[]>(initialColumns);
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
    const newColumn: FilterColumn = {
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

  const handleUpdateColumn = (index: number, column: FilterColumn) => {
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
                <div className="flex flex-col gap-3 h-[40vh] overflow-y-auto pr-1 min-h-0 custom-scrollbar">
                  {columns.map((column, index) => (
                    <ColumnFilterSection
                      key={column.id}
                      column={column}
                      availableColumns={availableColumns}
                      usedColumnIds={columns.map(c => c.columnId)}
                      onUpdate={col => handleUpdateColumn(index, col)}
                      onRemove={() => handleRemoveColumn(index)}
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
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                      Applied Filters:
                    </p>
                    <div className="space-y-1">
                      {columns.map((col, idx) => (
                        <div key={col.id} className="text-xs text-blue-900 dark:text-blue-100">
                          <span className="font-semibold mr-1">{idx + 1}.</span>
                          <span className="font-medium mr-1">{col.columnName}</span>
                          {(col.conditions || []).map((cond, cidx) => (
                            <span
                              key={cond.id || cidx}
                              className="inline-flex items-center gap-1 mr-2"
                            >
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                                {getOperatorLabelLower(col.columnType, cond.operator)}
                              </span>
                              {cond.operator === 'between' ? (
                                <span>
                                  <span className="font-semibold">{String(cond.value ?? '?')}</span>
                                  <span className="mx-1">and</span>
                                  <span className="font-semibold">
                                    {String(cond.valueEnd ?? '?')}
                                  </span>
                                </span>
                              ) : (
                                <span className="font-semibold">{String(cond.value ?? '?')}</span>
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
