'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { NumberFormat } from '@/contexts/DatasetContext';
import {
  generateId,
  getOperatorsForType,
  getOperatorLabelLower,
  getGranularityFromFormat,
  formatNumberDisplay,
  normalizeNumberInput,
  validateDateCondition,
  validateNumberCondition,
  validateTextCondition,
} from '@/utils/filterUtils';
import type { DatasetColumnType, DatasetFilterCondition, DatasetFilterColumn } from '@/types/chart';

export type DateGranularity = 'year' | 'year_month' | 'date' | 'datetime';

export const ConditionRow: React.FC<{
  condition: DatasetFilterCondition;
  operator: string;
  columnType: DatasetColumnType;
  dateGranularity?: DateGranularity;
  onUpdate: (condition: DatasetFilterCondition) => void;
  onRemove: () => void;
  isOr: boolean;
  numberFormat?: NumberFormat;
  canRemove: boolean;
}> = ({
  condition,
  operator,
  columnType,
  dateGranularity,
  onUpdate,
  onRemove,
  isOr,
  numberFormat,
  canRemove,
}) => {
  const operators = getOperatorsForType(columnType);

  let errorMsg: string | null = null;
  if (columnType === 'date') {
    errorMsg = validateDateCondition(
      dateGranularity as any,
      operator,
      condition.value,
      condition.valueEnd
    );
  } else if (columnType === 'number') {
    errorMsg = validateNumberCondition(operator, condition.value, condition.valueEnd);
  } else if (columnType === 'text') {
    errorMsg = validateTextCondition(operator, condition.value);
  }

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

      {columnType === 'date' ? (
        operator === 'between' ? (
          <>
            {dateGranularity === 'year' && (
              <>
                <Input
                  type="number"
                  placeholder="From year"
                  min={0}
                  step={1}
                  required
                  value={condition.value ?? ''}
                  onChange={e => onUpdate({ ...condition, value: e.target.value })}
                  className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                />
                <Input
                  type="number"
                  placeholder="To year"
                  min={0}
                  step={1}
                  required
                  value={condition.valueEnd ?? ''}
                  onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
                  className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                />
              </>
            )}
            {dateGranularity === 'year_month' && (
              <>
                <Input
                  type="month"
                  required
                  value={(condition.value as string) || ''}
                  onChange={e => onUpdate({ ...condition, value: e.target.value })}
                  className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                />
                <Input
                  type="month"
                  required
                  value={(condition.valueEnd as string) || ''}
                  onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
                  className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                />
              </>
            )}
            {dateGranularity === 'date' && (
              <>
                <Input
                  type="date"
                  required
                  value={(condition.value as string) || ''}
                  onChange={e => onUpdate({ ...condition, value: e.target.value })}
                  className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                />
                <Input
                  type="date"
                  required
                  value={(condition.valueEnd as string) || ''}
                  onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
                  className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                />
              </>
            )}
            {dateGranularity === 'datetime' && (
              <>
                <Input
                  type="datetime-local"
                  required
                  value={(condition.value as string) || ''}
                  onChange={e => onUpdate({ ...condition, value: e.target.value })}
                  className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                />
                <Input
                  type="datetime-local"
                  required
                  value={(condition.valueEnd as string) || ''}
                  onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
                  className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                />
              </>
            )}
          </>
        ) : (
          <>
            {dateGranularity === 'year' && (
              <Input
                type="number"
                placeholder="Year"
                min={0}
                step={1}
                required
                value={condition.value ?? ''}
                onChange={e => onUpdate({ ...condition, value: e.target.value })}
                className={`flex-1 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
              />
            )}
            {dateGranularity === 'year_month' && (
              <Input
                type="month"
                required
                value={(condition.value as string) || ''}
                onChange={e => onUpdate({ ...condition, value: e.target.value })}
                className={`flex-1 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
              />
            )}
            {dateGranularity === 'date' && (
              <Input
                type="date"
                required
                value={(condition.value as string) || ''}
                onChange={e => onUpdate({ ...condition, value: e.target.value })}
                className={`flex-1 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
              />
            )}
            {dateGranularity === 'datetime' && (
              <Input
                type="datetime-local"
                required
                value={(condition.value as string) || ''}
                onChange={e => onUpdate({ ...condition, value: e.target.value })}
                className={`flex-1 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
              />
            )}
          </>
        )
      ) : operator === 'between' ? (
        columnType === 'number' ? (
          <>
            <Input
              type="text"
              inputMode="decimal"
              required
              placeholder={`From e.g. ${formatNumberDisplay('1234.56', numberFormat)}`}
              value={formatNumberDisplay(String(condition.value ?? ''), numberFormat)}
              onChange={e =>
                onUpdate({
                  ...condition,
                  value: normalizeNumberInput(e.target.value, numberFormat),
                })
              }
              className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
            />
            <Input
              type="text"
              inputMode="decimal"
              required
              placeholder={`To e.g. ${formatNumberDisplay('1234.56', numberFormat)}`}
              value={formatNumberDisplay(String(condition.valueEnd ?? ''), numberFormat)}
              onChange={e =>
                onUpdate({
                  ...condition,
                  valueEnd: normalizeNumberInput(e.target.value, numberFormat),
                })
              }
              className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
            />
          </>
        ) : (
          <>
            <Input
              type="text"
              required
              placeholder="From"
              value={String(condition.value ?? '')}
              onChange={e => onUpdate({ ...condition, value: e.target.value })}
              className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
            />
            <Input
              type="text"
              required
              placeholder="To"
              value={String(condition.valueEnd ?? '')}
              onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
              className={`w-28 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
            />
          </>
        )
      ) : columnType === 'number' ? (
        <Input
          type="text"
          inputMode="decimal"
          required
          placeholder={`e.g. ${formatNumberDisplay('1234.56', numberFormat)}`}
          value={formatNumberDisplay(String(condition.value ?? ''), numberFormat)}
          onChange={e =>
            onUpdate({ ...condition, value: normalizeNumberInput(e.target.value, numberFormat) })
          }
          className={`flex-1 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
        />
      ) : (
        <Input
          type="text"
          required
          placeholder="Value"
          value={String(condition.value ?? '')}
          onChange={e => onUpdate({ ...condition, value: e.target.value })}
          className={`flex-1 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
        />
      )}
      {errorMsg && <span className="text-[11px] text-red-500 ml-auto">{errorMsg}</span>}

      {canRemove && (
        <Button
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export const ColumnFilterSection: React.FC<{
  column: DatasetFilterColumn;
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  usedColumnIds: string[];
  onUpdate: (column: DatasetFilterColumn) => void;
  onRemove: () => void;
  numberFormat?: NumberFormat;
}> = ({ column, availableColumns, usedColumnIds, onUpdate, onRemove, numberFormat }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddCondition = () => {
    const newCondition: DatasetFilterCondition = {
      id: generateId(),
      operator: getOperatorsForType(column.columnType)[0]?.value || 'equals',
      value: null,
    };
    onUpdate({
      ...column,
      conditions: [...column.conditions, newCondition],
    });
  };

  const handleUpdateCondition = (index: number, condition: DatasetFilterCondition) => {
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
      if (selectedColumn.type === column.columnType) {
        onUpdate({
          ...column,
          columnId: newColumnId,
          columnName: selectedColumn.name,
          columnType: selectedColumn.type,
          conditions: [...column.conditions],
        });
      } else {
        const newCondition: DatasetFilterCondition = {
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
                  {(() => {
                    const sel = availableColumns.find(c => c.id === column.columnId);
                    const label = sel?.name || column.columnName || column.columnId;
                    const type = sel?.type || column.columnType;
                    const fmt = sel?.dateFormat;
                    const typeWithFmt = type === 'date' && fmt ? `${type} - ${fmt}` : type;
                    return `${label} (${typeWithFmt})`;
                  })()}
                </span>
              </SelectTrigger>
              <SelectContent>
                {availableColumns
                  .filter(col => !usedColumnIds.includes(col.id) || col.id === column.columnId)
                  .map(col => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name} (
                      {col.type === 'date' && col.dateFormat
                        ? `${col.type} - ${col.dateFormat}`
                        : col.type}
                      )
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 space-y-2">
            {column.conditions.map((condition, index) => (
              <ConditionRow
                key={condition.id}
                condition={condition}
                operator={condition.operator}
                columnType={column.columnType}
                dateGranularity={getGranularityFromFormat(
                  availableColumns.find(c => c.id === column.columnId)?.dateFormat
                )}
                onUpdate={c => handleUpdateCondition(index, c)}
                onRemove={() => handleRemoveCondition(index)}
                isOr={index > 0}
                numberFormat={numberFormat}
                canRemove={column.conditions.length > 1}
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
