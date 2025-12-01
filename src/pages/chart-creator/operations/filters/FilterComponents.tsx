'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { NumberFormat } from '@/contexts/DatasetContext';
import {
  generateId,
  getOperatorsForType,
  getOperatorLabelLower,
  getGranularityFromFormat,
  formatNumberDisplay,
  formatDateDisplay,
  normalizeNumberInput,
  validateDateCondition,
  validateNumberCondition,
  validateTextCondition,
} from '@/utils/filterUtils';
import type { DatasetColumnType, DatasetFilterCondition, DatasetFilterColumn } from '@/types/chart';

export type DateGranularity = 'year' | 'year_month' | 'date' | 'datetime';

const displayValueLabel = (value: string) => (value === '' ? '(blank)' : value);

// Simple debounce utility (per-instance)
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number): T => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
};
const isRangeOperator = (operator: string) =>
  operator === 'between' || operator === 'between_exclusive';
const isNoValueOperator = (operator: string) =>
  operator === 'is_empty' || operator === 'is_not_empty';

// Helper component for error icon with tooltip
const ErrorIcon: React.FC<{ message: string }> = ({ message }) => (
  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 group">
    <AlertCircle className="w-4 h-4 text-red-500" />
    <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-2 py-1 text-xs text-red-700 dark:text-red-300 whitespace-nowrap shadow-lg">
        {message}
      </div>
    </div>
  </div>
);

const UniqueValuePicker: React.FC<{
  uniqueValues?: string[];
  selectedValues: string[];
  onChange: (next: string[]) => void;
  columnType?: DatasetColumnType;
  errorMsg?: string | null;
  onRemove?: () => void;
  numberFormat?: NumberFormat;
  dateGranularity?: DateGranularity;
  dateFormat?: string;
}> = ({
  uniqueValues,
  selectedValues,
  onChange,
  columnType,
  errorMsg,
  onRemove,
  numberFormat,
  dateGranularity,
  dateFormat,
}) => {
  const [search, setSearch] = useState('');

  const normalizedValues = useMemo(() => {
    if (!uniqueValues) return [] as string[];
    return uniqueValues.map(v => (v ?? '').toString());
  }, [uniqueValues]);

  const filteredValues = useMemo(() => {
    const term = search.trim();
    if (!term) return normalizedValues;

    const lowerTerm = term.toLowerCase();

    if (columnType === 'number') {
      const normalizedTerm = normalizeNumberInput(term, numberFormat)?.toLowerCase() || '';
      return normalizedValues.filter(value => {
        const normalizedValue = normalizeNumberInput(value, numberFormat)?.toLowerCase() || '';
        if (normalizedTerm && normalizedValue.includes(normalizedTerm)) return true;
        const formattedLower = formatNumberDisplay(value, numberFormat)?.toLowerCase() || '';
        return formattedLower.includes(lowerTerm);
      });
    }

    if (columnType === 'date') {
      return normalizedValues.filter(value => {
        const formattedLower =
          formatDateDisplay(dateGranularity || 'date', value, dateFormat)?.toLowerCase() || '';
        const rawLower = value.toLowerCase();
        return (
          (formattedLower && formattedLower.includes(lowerTerm)) || rawLower.includes(lowerTerm)
        );
      });
    }

    return normalizedValues.filter(value => value.toLowerCase().includes(lowerTerm));
  }, [normalizedValues, search, columnType, numberFormat, dateGranularity, dateFormat]);

  const limitedValues = useMemo(() => filteredValues.slice(0, 100), [filteredValues]);
  const hasMoreThanLimit = filteredValues.length > 100;

  const formatDisplayValue = useCallback(
    (value: string) => {
      if (columnType === 'number') {
        const formatted = formatNumberDisplay(value, numberFormat);
        console.log('[UniqueValuePicker] number formatting', {
          value,
          formatted,
          decimalSeparator: numberFormat?.decimalSeparator,
          thousandsSeparator: numberFormat?.thousandsSeparator,
        });
        return formatted === '' ? displayValueLabel(value) : formatted;
      }
      if (columnType === 'date') {
        const formatted = formatDateDisplay(dateGranularity || 'date', value, dateFormat);
        console.log('[UniqueValuePicker] formatting value', {
          value,
          columnType,
          dateGranularity,
          dateFormat,
          formatted,
        });
        return !formatted || formatted === '?' ? displayValueLabel(value) : formatted;
      }
      return displayValueLabel(value);
    },
    [columnType, numberFormat, dateGranularity, dateFormat]
  );

  const toggleValue = (value: string) => {
    const exists = selectedValues.includes(value);
    const next = exists ? selectedValues.filter(v => v !== value) : [...selectedValues, value];
    onChange(next);
  };

  const handleSelectAllVisible = () => {
    const merged = new Set(selectedValues);
    limitedValues.forEach(v => merged.add(v));
    onChange(Array.from(merged));
  };

  const handleClear = () => {
    if (selectedValues.length === 0) return;
    onChange([]);
  };

  // Show selected values first, then unselected values
  const sortedValues = useMemo(() => {
    const selected = limitedValues.filter(v => selectedValues.includes(v));
    const unselected = limitedValues.filter(v => !selectedValues.includes(v));
    return [...selected, ...unselected];
  }, [limitedValues, selectedValues]);

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <div className="flex gap-2 items-end flex-1 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search values..."
            className={`h-9 text-xs flex-1 min-w-0 ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
            onKeyDown={e => {
              // Allow typing to filter, but don't prevent default behavior
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
          {errorMsg && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 group">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-2 py-1 text-xs text-red-700 dark:text-red-300 whitespace-nowrap shadow-lg">
                  {errorMsg}
                </div>
              </div>
            </div>
          )}
        </div>
        {onRemove && (
          <Button
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
        <button
          type="button"
          onClick={handleSelectAllVisible}
          className="hover:underline cursor-pointer"
        >
          Select visible
        </button>
        <button type="button" onClick={handleClear} className="hover:underline cursor-pointer">
          Clear
        </button>
      </div>
      <ScrollArea className="h-40 border border-gray-200 dark:border-gray-700 rounded-md">
        <div className="p-1.5 space-y-1">
          {limitedValues.length === 0 ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">No matches</p>
          ) : (
            <>
              {/* Show selected values first when no search */}
              {search.trim() === '' && selectedValues.length > 0 && (
                <>
                  <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 mb-1 -mx-1.5 px-3 py-1.5 sticky top-0 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    Selected ({selectedValues.length})
                  </div>
                  {selectedValues
                    .filter(v => normalizedValues.includes(v))
                    .slice(0, 100)
                    .map(value => {
                      const checked = selectedValues.includes(value);
                      return (
                        <label
                          key={`selected-${value || '__blank__'}`}
                          className="flex items-center gap-2 text-xs cursor-pointer bg-gray-100 dark:bg-gray-800 rounded px-2 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleValue(value)}
                            className="h-4 w-4"
                          />
                          <span className="truncate flex-1" title={formatDisplayValue(value)}>
                            {formatDisplayValue(value)}
                          </span>
                        </label>
                      );
                    })}
                  {limitedValues.some(v => !selectedValues.includes(v)) && (
                    <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 mb-1 mt-2 -mx-1.5 px-3 py-1.5 sticky top-0 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      Available
                    </div>
                  )}
                </>
              )}
              {/* Show all values (filtered by search, with selected first) */}
              {sortedValues.map(value => {
                const checked = selectedValues.includes(value);
                // Skip if already shown in selected section (when no search)
                if (search.trim() === '' && checked) return null;
                return (
                  <label
                    key={value || '__blank__'}
                    className={`flex items-center gap-2 text-xs cursor-pointer rounded px-2 py-1.5 transition-colors ${
                      checked
                        ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleValue(value)}
                      className="h-4 w-4"
                    />
                    <span className="truncate flex-1" title={formatDisplayValue(value)}>
                      {formatDisplayValue(value)}
                    </span>
                  </label>
                );
              })}
            </>
          )}
        </div>
      </ScrollArea>
      {hasMoreThanLimit && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Showing first 100 values. Refine your search to see more.
        </p>
      )}
    </div>
  );
};

export const ConditionRow: React.FC<{
  condition: DatasetFilterCondition;
  operator: string;
  columnType: DatasetColumnType;
  dateGranularity?: DateGranularity;
  dateFormat?: string;
  onUpdate: (condition: DatasetFilterCondition) => void;
  onRemove: () => void;
  isOr: boolean;
  numberFormat?: NumberFormat;
  canRemove: boolean;
  uniqueValues?: string[];
}> = ({
  condition,
  operator,
  columnType,
  dateGranularity,
  dateFormat,
  onUpdate,
  onRemove,
  isOr,
  numberFormat,
  canRemove,
  uniqueValues,
}) => {
  const operators = getOperatorsForType(columnType);
  const uniquePickerEnabled =
    (operator === 'equals' || operator === 'not_equals') && (uniqueValues?.length ?? 0) > 0;

  React.useEffect(() => {
    if (uniquePickerEnabled && !Array.isArray(condition.value)) {
      const nextValue =
        condition.value == null || condition.value === '' ? [] : [String(condition.value)];
      onUpdate({ ...condition, value: nextValue });
    }
  }, [uniquePickerEnabled, condition.value, condition.id, onUpdate]);

  const selectedValues = useMemo(() => {
    if (Array.isArray(condition.value)) {
      return condition.value.map(v => (v == null ? '' : String(v)));
    }
    if (condition.value == null || condition.value === '') return [];
    return [String(condition.value)];
  }, [condition.value]);

  const singleValueForInputs = useMemo(() => {
    if (Array.isArray(condition.value)) {
      return condition.value[0] ?? '';
    }
    return condition.value ?? '';
  }, [condition.value]);

  const toInputValue = (val: unknown) => (val == null ? '' : String(val));

  // Debounced updater for free-text / numeric / date inputs
  const debouncedUpdate = useMemo(
    () => debounce((next: DatasetFilterCondition) => onUpdate(next), 250),
    [onUpdate, condition.id]
  );

  const handleOperatorChange = (nextOperator: string) => {
    let nextValue: DatasetFilterCondition['value'] = condition.value;
    let nextValueEnd: DatasetFilterCondition['valueEnd'] = condition.valueEnd;
    let nextIncludeStart = condition.includeStart;
    let nextIncludeEnd = condition.includeEnd;

    const isCurrentArrayOperator = operator === 'equals' || operator === 'not_equals';

    if (isNoValueOperator(nextOperator)) {
      // is_empty and is_not_empty don't need values
      nextValue = null;
      nextValueEnd = undefined;
      nextIncludeStart = undefined;
      nextIncludeEnd = undefined;
    } else if (nextOperator === 'equals' || nextOperator === 'not_equals') {
      // If switching from a non-array operator (like contains) to an array operator (equals/not_equals),
      // clear the value to avoid preserving old values
      if (!isCurrentArrayOperator) {
        nextValue = [];
      } else {
        // Already an array operator, preserve the array
        nextValue = Array.isArray(condition.value)
          ? condition.value
          : condition.value != null && condition.value !== ''
            ? [String(condition.value)]
            : [];
      }
      nextValueEnd = undefined;
      nextIncludeStart = undefined;
      nextIncludeEnd = undefined;
    } else if (isRangeOperator(nextOperator)) {
      nextValue = null;
      nextValueEnd = null;
      const defaultInclusive = nextOperator === 'between';
      nextIncludeStart = defaultInclusive;
      nextIncludeEnd = defaultInclusive;
    } else {
      // Switching to a non-array operator (like contains, starts_with, etc.)
      nextValueEnd = undefined;
      // Clear the value when switching from array operator to non-array operator
      // to avoid confusion (e.g., switching from "equals" ["Final", "Quiz"] to "contains" shouldn't show "Final")
      if (isCurrentArrayOperator) {
        nextValue = null;
      } else if (Array.isArray(condition.value)) {
        // Fallback: if somehow value is still an array, clear it
        nextValue = null;
      }
      // Otherwise, preserve the existing string value
      nextIncludeStart = undefined;
      nextIncludeEnd = undefined;
    }

    onUpdate({
      ...condition,
      operator: nextOperator,
      value: nextValue,
      valueEnd: nextValueEnd,
      includeStart: nextIncludeStart,
      includeEnd: nextIncludeEnd,
    });
  };

  const effectiveIncludeStart =
    condition.includeStart ??
    (operator === 'between' ? true : operator === 'between_exclusive' ? false : true);
  const effectiveIncludeEnd =
    condition.includeEnd ??
    (operator === 'between' ? true : operator === 'between_exclusive' ? false : true);

  let errorMsg: string | null = null;
  if (columnType === 'date') {
    errorMsg = validateDateCondition(
      dateGranularity as any,
      operator,
      condition.value,
      condition.valueEnd,
      effectiveIncludeStart,
      effectiveIncludeEnd
    );
  } else if (columnType === 'number') {
    errorMsg = validateNumberCondition(
      operator,
      condition.value,
      condition.valueEnd,
      effectiveIncludeStart,
      effectiveIncludeEnd
    );
  } else if (columnType === 'text') {
    errorMsg = validateTextCondition(operator, condition.value);
  }

  const containerClass = uniquePickerEnabled
    ? 'flex gap-2 items-start flex-1 min-w-0'
    : 'flex gap-2 items-end flex-1 min-w-0';

  return (
    <div className={containerClass}>
      {isOr && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0">
          AND
        </span>
      )}

      <Select value={operator} onValueChange={handleOperatorChange}>
        <SelectTrigger className="w-28 h-9 text-xs outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0 flex-shrink-0">
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

      <div className="flex gap-2 items-end flex-1 min-w-0">
        {isNoValueOperator(operator) ? (
          <div className="flex-1 min-w-0 text-sm text-gray-600 dark:text-gray-400 italic">
            No value required
          </div>
        ) : uniquePickerEnabled ? (
          <div className="flex-1 min-w-0">
            <UniqueValuePicker
              uniqueValues={uniqueValues}
              selectedValues={selectedValues}
              onChange={values => onUpdate({ ...condition, value: values })}
              columnType={columnType}
              errorMsg={errorMsg}
              onRemove={canRemove ? onRemove : undefined}
              numberFormat={numberFormat}
              dateGranularity={dateGranularity}
              dateFormat={dateFormat}
            />
          </div>
        ) : (
          <>
            {columnType === 'date' ? (
              isRangeOperator(operator) ? (
                <>
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-1">
                      <span>Left bound</span>
                      <Select
                        value={effectiveIncludeStart ? 'inclusive' : 'exclusive'}
                        onValueChange={val =>
                          onUpdate({
                            ...condition,
                            includeStart: val === 'inclusive',
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-24 text-[11px]">
                          {effectiveIncludeStart ? '≥ Start' : '> Start'}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusive">≥ Start</SelectItem>
                          <SelectItem value="exclusive">&gt; Start</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Right bound</span>
                      <Select
                        value={effectiveIncludeEnd ? 'inclusive' : 'exclusive'}
                        onValueChange={val =>
                          onUpdate({
                            ...condition,
                            includeEnd: val === 'inclusive',
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-24 text-[11px]">
                          {effectiveIncludeEnd ? 'End ≤' : 'End <'}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusive">End ≤</SelectItem>
                          <SelectItem value="exclusive">End &lt;</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {dateGranularity === 'year' && (
                    <>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="number"
                          placeholder="From year"
                          min={0}
                          step={1}
                          required
                          value={toInputValue(
                            Array.isArray(condition.value) ? condition.value[0] : condition.value
                          )}
                          onChange={e => debouncedUpdate({ ...condition, value: e.target.value })}
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="number"
                          placeholder="To year"
                          min={0}
                          step={1}
                          required
                          value={condition.valueEnd ?? ''}
                          onChange={e =>
                            debouncedUpdate({ ...condition, valueEnd: e.target.value })
                          }
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      {canRemove && (
                        <Button
                          onClick={onRemove}
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {dateGranularity === 'year_month' && (
                    <>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="month"
                          required
                          value={toInputValue(
                            Array.isArray(condition.value) ? condition.value[0] : condition.value
                          )}
                          onChange={e => debouncedUpdate({ ...condition, value: e.target.value })}
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="month"
                          required
                          value={(condition.valueEnd as string) || ''}
                          onChange={e =>
                            debouncedUpdate({ ...condition, valueEnd: e.target.value })
                          }
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      {canRemove && (
                        <Button
                          onClick={onRemove}
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {dateGranularity === 'date' && (
                    <>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="date"
                          required
                          value={toInputValue(
                            Array.isArray(condition.value) ? condition.value[0] : condition.value
                          )}
                          onChange={e => debouncedUpdate({ ...condition, value: e.target.value })}
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="date"
                          required
                          value={(condition.valueEnd as string) || ''}
                          onChange={e =>
                            debouncedUpdate({ ...condition, valueEnd: e.target.value })
                          }
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      {canRemove && (
                        <Button
                          onClick={onRemove}
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {dateGranularity === 'datetime' && (
                    <>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="datetime-local"
                          required
                          value={toInputValue(
                            Array.isArray(condition.value) ? condition.value[0] : condition.value
                          )}
                          onChange={e => debouncedUpdate({ ...condition, value: e.target.value })}
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="datetime-local"
                          required
                          value={(condition.valueEnd as string) || ''}
                          onChange={e =>
                            debouncedUpdate({ ...condition, valueEnd: e.target.value })
                          }
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      {canRemove && (
                        <Button
                          onClick={onRemove}
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {dateGranularity === 'year' && (
                    <>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="number"
                          placeholder="Year"
                          min={0}
                          step={1}
                          required
                          value={singleValueForInputs ?? ''}
                          onChange={e => debouncedUpdate({ ...condition, value: e.target.value })}
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      {canRemove && (
                        <Button
                          onClick={onRemove}
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {dateGranularity === 'year_month' && (
                    <>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="month"
                          required
                          value={String(singleValueForInputs ?? '')}
                          onChange={e => debouncedUpdate({ ...condition, value: e.target.value })}
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      {canRemove && (
                        <Button
                          onClick={onRemove}
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {dateGranularity === 'date' && (
                    <>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="date"
                          required
                          value={String(singleValueForInputs ?? '')}
                          onChange={e => debouncedUpdate({ ...condition, value: e.target.value })}
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      {canRemove && (
                        <Button
                          onClick={onRemove}
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {dateGranularity === 'datetime' && (
                    <>
                      <div className="relative flex-1 min-w-0">
                        <Input
                          type="datetime-local"
                          required
                          value={String(singleValueForInputs ?? '')}
                          onChange={e => onUpdate({ ...condition, value: e.target.value })}
                          className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                        />
                        {errorMsg && <ErrorIcon message={errorMsg} />}
                      </div>
                      {canRemove && (
                        <Button
                          onClick={onRemove}
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </>
              )
            ) : isRangeOperator(operator) ? (
              columnType === 'number' ? (
                <>
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-1">
                      <span>Left bound</span>
                      <Select
                        value={effectiveIncludeStart ? 'inclusive' : 'exclusive'}
                        onValueChange={val =>
                          onUpdate({
                            ...condition,
                            includeStart: val === 'inclusive',
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-24 text-[11px]">
                          {effectiveIncludeStart ? '≥ Start' : '> Start'}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusive">≥ Start</SelectItem>
                          <SelectItem value="exclusive">&gt; Start</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Right bound</span>
                      <Select
                        value={effectiveIncludeEnd ? 'inclusive' : 'exclusive'}
                        onValueChange={val =>
                          onUpdate({
                            ...condition,
                            includeEnd: val === 'inclusive',
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-24 text-[11px]">
                          {effectiveIncludeEnd ? 'End ≤' : 'End <'}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusive">End ≤</SelectItem>
                          <SelectItem value="exclusive">End &lt;</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <Input
                      type="text"
                      inputMode="decimal"
                      required
                      placeholder={`From e.g. ${formatNumberDisplay('1234.56', numberFormat)}`}
                      value={formatNumberDisplay(
                        String(
                          Array.isArray(condition.value)
                            ? (condition.value[0] ?? '')
                            : (condition.value ?? '')
                        ),
                        numberFormat
                      )}
                      onChange={e =>
                        onUpdate({
                          ...condition,
                          value: normalizeNumberInput(e.target.value, numberFormat),
                        })
                      }
                      className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                    />
                    {errorMsg && <ErrorIcon message={errorMsg} />}
                  </div>
                  <div className="relative flex-1 min-w-0">
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
                      className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                    />
                    {errorMsg && <ErrorIcon message={errorMsg} />}
                  </div>
                  {canRemove && (
                    <Button
                      onClick={onRemove}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-1">
                      <span>Left bound</span>
                      <Select
                        value={effectiveIncludeStart ? 'inclusive' : 'exclusive'}
                        onValueChange={val =>
                          onUpdate({
                            ...condition,
                            includeStart: val === 'inclusive',
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-24 text-[11px]">
                          {effectiveIncludeStart ? '≥ Start' : '> Start'}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusive">≥ Start</SelectItem>
                          <SelectItem value="exclusive">&gt; Start</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Right bound</span>
                      <Select
                        value={effectiveIncludeEnd ? 'inclusive' : 'exclusive'}
                        onValueChange={val =>
                          onUpdate({
                            ...condition,
                            includeEnd: val === 'inclusive',
                          })
                        }
                      >
                        <SelectTrigger className="h-7 w-24 text-[11px]">
                          {effectiveIncludeEnd ? 'End ≤' : 'End <'}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusive">End ≤</SelectItem>
                          <SelectItem value="exclusive">End &lt;</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <Input
                      type="text"
                      required
                      placeholder="From"
                      value={toInputValue(
                        Array.isArray(condition.value) ? condition.value[0] : condition.value
                      )}
                      onChange={e => onUpdate({ ...condition, value: e.target.value })}
                      className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                    />
                    {errorMsg && <ErrorIcon message={errorMsg} />}
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <Input
                      type="text"
                      required
                      placeholder="To"
                      value={String(condition.valueEnd ?? '')}
                      onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
                      className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                    />
                    {errorMsg && <ErrorIcon message={errorMsg} />}
                  </div>
                  {canRemove && (
                    <Button
                      onClick={onRemove}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )
            ) : columnType === 'number' ? (
              <>
                <div className="relative flex-1 min-w-0">
                  <Input
                    type="text"
                    inputMode="decimal"
                    required
                    placeholder={`e.g. ${formatNumberDisplay('1234.56', numberFormat)}`}
                    value={formatNumberDisplay(String(singleValueForInputs ?? ''), numberFormat)}
                    onChange={e =>
                      onUpdate({
                        ...condition,
                        value: normalizeNumberInput(e.target.value, numberFormat),
                      })
                    }
                    className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                  />
                  {errorMsg && <ErrorIcon message={errorMsg} />}
                </div>
                {canRemove && (
                  <Button
                    onClick={onRemove}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            ) : (
              <>
                <div className="relative flex-1 min-w-0">
                  <Input
                    type="text"
                    required
                    placeholder="Value"
                    value={toInputValue(singleValueForInputs)}
                    onChange={e => onUpdate({ ...condition, value: e.target.value })}
                    className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500 pr-8' : ''}`}
                  />
                  {errorMsg && <ErrorIcon message={errorMsg} />}
                </div>
                {canRemove && (
                  <Button
                    onClick={onRemove}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>
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
  uniqueValues?: string[];
  showRemoveButton?: boolean;
  showColumnSelector?: boolean;
  defaultExpanded?: boolean;
  collapseSignal?: number;
  excelStyle?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
}> = ({
  column,
  availableColumns,
  usedColumnIds,
  onUpdate,
  onRemove,
  numberFormat,
  uniqueValues,
  showRemoveButton = true,
  showColumnSelector = true,
  defaultExpanded = true,
  collapseSignal,
  excelStyle = false,
  onDragStart,
  onDragEnd,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  // When collapseSignal changes (e.g. drag started), force collapse to compact header size
  useEffect(() => {
    if (collapseSignal != null) {
      setIsExpanded(false);
    }
  }, [collapseSignal]);

  const selectedColumnMeta = useMemo(
    () => availableColumns.find(c => c.id === column.columnId),
    [availableColumns, column.columnId]
  );
  const columnDateFormat = selectedColumnMeta?.dateFormat;
  const columnDateGranularity = useMemo(
    () => getGranularityFromFormat(columnDateFormat),
    [columnDateFormat]
  );

  useEffect(() => {
    console.log('[ColumnFilterSection] unique values snapshot', {
      columnId: column.columnId,
      count: uniqueValues?.length || 0,
    });
  }, [column.columnId, uniqueValues?.length]);

  useEffect(() => {
    console.log('[ColumnFilterSection] column meta', {
      columnId: column.columnId,
      columnName: column.columnName,
      columnType: column.columnType,
      dateFormat: columnDateFormat || '(none)',
      granularity: columnDateGranularity,
    });
  }, [
    column.columnId,
    column.columnName,
    column.columnType,
    columnDateFormat,
    columnDateGranularity,
  ]);

  const createDefaultCondition = (columnType: DatasetColumnType): DatasetFilterCondition => {
    // Use non-unique-picker operators by default to avoid loading all unique values
    const operators = getOperatorsForType(columnType);
    // Default operators are now at index 0 (contains for text, greater_than for number/date)
    const defaultOperator = operators[0]?.value || 'contains';
    return {
      id: generateId(),
      operator: defaultOperator,
      value: null,
      valueEnd: isRangeOperator(defaultOperator) ? null : undefined,
    } as DatasetFilterCondition;
  };

  const handleAddCondition = () => {
    const newCondition = createDefaultCondition(column.columnType);
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
        const newCondition = createDefaultCondition(selectedColumn.type);
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
    <div
      className={cn(
        'border border-gray-300 dark:border-gray-600 rounded space-y-3',
        excelStyle ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4'
      )}
    >
      <div
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={cn(
          'flex items-center gap-2 h-[48px] px-3',
          onDragStart && 'cursor-grab active:cursor-grabbing'
        )}
        data-filter-header="true"
      >
        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100 min-w-0 flex-1">
          <span className="text-sm truncate">{column.columnName}</span>
          <span className="ml-auto text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {column.columnType === 'number'
              ? 'Number'
              : column.columnType === 'date'
                ? 'Date'
                : 'Text'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={e => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="h-8 w-8 text-slate-500 dark:text-slate-300 cursor-pointer flex-shrink-0"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {showRemoveButton && (
          <Button
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-1 focus-visible:ring-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className={excelStyle ? 'px-3 pb-2' : ''}>
          {showColumnSelector && (
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Column
              </label>
              <Select value={column.columnId} onValueChange={handleColumnChange}>
                <SelectTrigger className="w-full h-9 text-xs outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0">
                  {(() => {
                    const sel = availableColumns.find(c => c.id === column.columnId);
                    const label = sel?.name || column.columnName || column.columnId;
                    const type = sel?.type || column.columnType;
                    const fmt = sel?.dateFormat;
                    return (
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="truncate">{label}</span>
                        {type && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            ({type === 'date' && fmt ? `${type} - ${fmt}` : type})
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </SelectTrigger>
                <SelectContent>
                  {availableColumns
                    .filter(col => !usedColumnIds.includes(col.id) || col.id === column.columnId)
                    .map(col => (
                      <SelectItem key={col.id} value={col.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{col.name}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            (
                            {col.type === 'date' && col.dateFormat
                              ? `${col.type} - ${col.dateFormat}`
                              : col.type}
                            )
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2 space-y-2">
            {column.conditions.map((condition, index) => (
              <ConditionRow
                key={condition.id}
                condition={condition}
                operator={condition.operator}
                columnType={column.columnType}
                dateGranularity={columnDateGranularity}
                dateFormat={columnDateFormat}
                onUpdate={c => handleUpdateCondition(index, c)}
                onRemove={() => handleRemoveCondition(index)}
                isOr={index > 0}
                numberFormat={numberFormat}
                canRemove={column.conditions.length > 1}
                uniqueValues={uniqueValues}
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
        </div>
      )}
    </div>
  );
};
