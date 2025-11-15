'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const displayValueLabel = (value: string) => (value === '' ? '(blank)' : value);

const UniqueValuePicker: React.FC<{
  uniqueValues?: string[];
  selectedValues: string[];
  onChange: (next: string[]) => void;
  columnType?: DatasetColumnType;
  errorMsg?: string | null;
  onRemove?: () => void;
}> = ({ uniqueValues, selectedValues, onChange, columnType, errorMsg, onRemove }) => {
  const [search, setSearch] = useState('');

  const normalizedValues = useMemo(() => {
    if (!uniqueValues) return [] as string[];
    return uniqueValues.map(v => (v ?? '').toString());
  }, [uniqueValues]);

  // Normalize search term and values for comparison (remove formatting for numbers)
  const normalizeForSearch = useCallback(
    (value: string) => {
      if (columnType === 'number') {
        // Remove commas, spaces, and other formatting for number comparison
        return value.replace(/[,\s]/g, '').toLowerCase();
      }
      return value.toLowerCase();
    },
    [columnType]
  );

  const filteredValues = useMemo(() => {
    if (!search.trim()) return normalizedValues;
    const normalizedTerm = normalizeForSearch(search);
    return normalizedValues.filter(v => {
      const normalizedValue = normalizeForSearch(v);
      return normalizedValue.includes(normalizedTerm);
    });
  }, [normalizedValues, search, normalizeForSearch]);

  const limitedValues = useMemo(() => filteredValues.slice(0, 100), [filteredValues]);
  const hasMoreThanLimit = filteredValues.length > 100;

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

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <div className="flex gap-2 items-center flex-1 min-w-0">
        <Input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search"
          className="h-8 text-xs flex-1 min-w-0"
        />
        {errorMsg && (
          <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
            {errorMsg}
          </span>
        )}
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
        <button type="button" onClick={handleSelectAllVisible} className="hover:underline">
          Select visible
        </button>
        <button type="button" onClick={handleClear} className="hover:underline">
          Clear
        </button>
      </div>
      <ScrollArea className="h-40 border border-gray-200 dark:border-gray-700 rounded-md">
        <div className="p-2 space-y-1">
          {limitedValues.length === 0 ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">No matches</p>
          ) : (
            limitedValues.map(value => {
              const checked = selectedValues.includes(value);
              return (
                <label
                  key={value || '__blank__'}
                  className="flex items-center gap-2 text-xs cursor-pointer"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleValue(value)}
                    className="h-4 w-4"
                  />
                  <span className="truncate" title={displayValueLabel(value)}>
                    {displayValueLabel(value)}
                  </span>
                </label>
              );
            })
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

  const handleOperatorChange = (nextOperator: string) => {
    let nextValue: DatasetFilterCondition['value'] = condition.value;
    let nextValueEnd: DatasetFilterCondition['valueEnd'] = condition.valueEnd;

    const isCurrentArrayOperator = operator === 'equals' || operator === 'not_equals';
    const isNextArrayOperator = nextOperator === 'equals' || nextOperator === 'not_equals';

    if (nextOperator === 'equals' || nextOperator === 'not_equals') {
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
    } else if (nextOperator === 'between') {
      nextValue = null;
      nextValueEnd = null;
    } else {
      nextValueEnd = undefined;
      if (Array.isArray(condition.value)) {
        nextValue = condition.value.length > 0 ? condition.value[0] : null;
      }
    }

    onUpdate({
      ...condition,
      operator: nextOperator,
      value: nextValue,
      valueEnd: nextValueEnd,
    });
  };

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

  const containerClass = uniquePickerEnabled
    ? 'flex gap-2 items-start flex-1 min-w-0'
    : 'flex gap-2 items-end flex-1 min-w-0';

  return (
    <div className={containerClass}>
      {isOr && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0">
          OR
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
        {uniquePickerEnabled ? (
          <div className="flex-1 min-w-0">
            <UniqueValuePicker
              uniqueValues={uniqueValues}
              selectedValues={selectedValues}
              onChange={values => onUpdate({ ...condition, value: values })}
              columnType={columnType}
              errorMsg={errorMsg}
              onRemove={canRemove ? onRemove : undefined}
            />
          </div>
        ) : (
          <>
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
                        value={toInputValue(
                          Array.isArray(condition.value) ? condition.value[0] : condition.value
                        )}
                        onChange={e => onUpdate({ ...condition, value: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      <Input
                        type="number"
                        placeholder="To year"
                        min={0}
                        step={1}
                        required
                        value={condition.valueEnd ?? ''}
                        onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      {errorMsg && (
                        <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                          {errorMsg}
                        </span>
                      )}
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
                      <Input
                        type="month"
                        required
                        value={toInputValue(
                          Array.isArray(condition.value) ? condition.value[0] : condition.value
                        )}
                        onChange={e => onUpdate({ ...condition, value: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      <Input
                        type="month"
                        required
                        value={(condition.valueEnd as string) || ''}
                        onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      {errorMsg && (
                        <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                          {errorMsg}
                        </span>
                      )}
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
                      <Input
                        type="date"
                        required
                        value={toInputValue(
                          Array.isArray(condition.value) ? condition.value[0] : condition.value
                        )}
                        onChange={e => onUpdate({ ...condition, value: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      <Input
                        type="date"
                        required
                        value={(condition.valueEnd as string) || ''}
                        onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      {errorMsg && (
                        <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                          {errorMsg}
                        </span>
                      )}
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
                      <Input
                        type="datetime-local"
                        required
                        value={toInputValue(
                          Array.isArray(condition.value) ? condition.value[0] : condition.value
                        )}
                        onChange={e => onUpdate({ ...condition, value: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      <Input
                        type="datetime-local"
                        required
                        value={(condition.valueEnd as string) || ''}
                        onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      {errorMsg && (
                        <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                          {errorMsg}
                        </span>
                      )}
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
                      <Input
                        type="number"
                        placeholder="Year"
                        min={0}
                        step={1}
                        required
                        value={singleValueForInputs ?? ''}
                        onChange={e => onUpdate({ ...condition, value: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      {errorMsg && (
                        <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                          {errorMsg}
                        </span>
                      )}
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
                      <Input
                        type="month"
                        required
                        value={String(singleValueForInputs ?? '')}
                        onChange={e => onUpdate({ ...condition, value: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      {errorMsg && (
                        <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                          {errorMsg}
                        </span>
                      )}
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
                      <Input
                        type="date"
                        required
                        value={String(singleValueForInputs ?? '')}
                        onChange={e => onUpdate({ ...condition, value: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      {errorMsg && (
                        <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                          {errorMsg}
                        </span>
                      )}
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
                      <Input
                        type="datetime-local"
                        required
                        value={String(singleValueForInputs ?? '')}
                        onChange={e => onUpdate({ ...condition, value: e.target.value })}
                        className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                      />
                      {errorMsg && (
                        <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                          {errorMsg}
                        </span>
                      )}
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
            ) : operator === 'between' ? (
              columnType === 'number' ? (
                <>
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
                    className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
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
                    className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                  />
                  {errorMsg && (
                    <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                      {errorMsg}
                    </span>
                  )}
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
                  <Input
                    type="text"
                    required
                    placeholder="From"
                    value={toInputValue(
                      Array.isArray(condition.value) ? condition.value[0] : condition.value
                    )}
                    onChange={e => onUpdate({ ...condition, value: e.target.value })}
                    className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                  />
                  <Input
                    type="text"
                    required
                    placeholder="To"
                    value={String(condition.valueEnd ?? '')}
                    onChange={e => onUpdate({ ...condition, valueEnd: e.target.value })}
                    className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                  />
                  {errorMsg && (
                    <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                      {errorMsg}
                    </span>
                  )}
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
                  className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                />
                {errorMsg && (
                  <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                    {errorMsg}
                  </span>
                )}
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
                <Input
                  type="text"
                  required
                  placeholder="Value"
                  value={toInputValue(singleValueForInputs)}
                  onChange={e => onUpdate({ ...condition, value: e.target.value })}
                  className={`flex-1 min-w-0 h-9 text-xs ${errorMsg ? 'border-red-500' : ''}`}
                />
                {errorMsg && (
                  <span className="text-[11px] text-red-500 whitespace-nowrap flex-shrink-0">
                    {errorMsg}
                  </span>
                )}
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
}> = ({
  column,
  availableColumns,
  usedColumnIds,
  onUpdate,
  onRemove,
  numberFormat,
  uniqueValues,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const createDefaultCondition = (columnType: DatasetColumnType): DatasetFilterCondition => {
    // Use non-unique-picker operators by default to avoid loading all unique values
    const operators = getOperatorsForType(columnType);
    // Default operators are now at index 0 (contains for text, greater_than for number/date)
    const defaultOperator = operators[0]?.value || 'contains';
    return {
      id: generateId(),
      operator: defaultOperator,
      value: null,
      valueEnd: defaultOperator === 'between' ? null : undefined,
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
        </>
      )}
    </div>
  );
};
