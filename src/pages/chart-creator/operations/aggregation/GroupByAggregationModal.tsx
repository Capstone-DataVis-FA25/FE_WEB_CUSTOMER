'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

import { Input } from '@/components/ui/input';

import { Plus, X, Eye, AlertCircle } from 'lucide-react';

const MAX_METRICS = 5;

export interface GroupByColumn {
  id: string;
  name: string;
  timeUnit?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'quarter' | 'year';
}

export interface AggregationMetric {
  id: string;
  type: 'sum' | 'average' | 'min' | 'max' | 'count';
  columnId?: string;
  alias?: string;
}

interface Column {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date';
  dateFormat?: string;
}

interface GroupByAggregationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableColumns: Column[];
  onApply?: (groupBy: GroupByColumn[], metrics: AggregationMetric[]) => void;
  initialGroupBy?: GroupByColumn[];
  initialMetrics?: AggregationMetric[];
}

export const GroupByAggregationModal: React.FC<GroupByAggregationModalProps> = ({
  open,
  onOpenChange,
  availableColumns,
  onApply,
  initialGroupBy = [],
  initialMetrics = [],
}) => {
  const [groupByColumns, setGroupByColumns] = useState<GroupByColumn[]>(initialGroupBy);
  const [metrics, setMetrics] = useState<AggregationMetric[]>(initialMetrics);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    // Inject custom scrollbar styles
    const styleId = 'preview-scrollbar-styles';
    let style = document.getElementById(styleId) as HTMLStyleElement;

    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      .preview-scrollbar-modal {
        scrollbar-width: thin;
        scrollbar-color: #d1d5db transparent;
        padding-right: 8px;
      }
      .preview-scrollbar-modal::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        display: block;
      }
      .preview-scrollbar-modal::-webkit-scrollbar-track {
        background: transparent;
      }
      .preview-scrollbar-modal::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }
      .preview-scrollbar-modal::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
      .dark .preview-scrollbar-modal {
        scrollbar-color: #6b7280 transparent;
      }
      .dark .preview-scrollbar-modal::-webkit-scrollbar-track {
        background: transparent;
      }
      .dark .preview-scrollbar-modal::-webkit-scrollbar-thumb {
        background: #6b7280;
      }
      .dark .preview-scrollbar-modal::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
    `;

    return () => {
      // Don't remove on unmount, keep it for other instances
    };
  }, []);

  React.useEffect(() => {
    if (open) {
      setGroupByColumns(initialGroupBy);
      setMetrics(initialMetrics);
    }
  }, [open, initialGroupBy, initialMetrics]);

  const addGroupByColumn = () => {
    const usedIds = groupByColumns.map(col => col.id);
    const candidate = availableColumns.find(col => !usedIds.includes(col.id));
    if (!candidate) return;
    setGroupByColumns([
      ...groupByColumns,
      {
        id: candidate.id,
        name: candidate.name,
        timeUnit: candidate.type === 'date' ? 'day' : undefined,
      },
    ]);
  };

  const updateGroupByColumn = (oldColumnId: string, newColumnId: string) => {
    const column = availableColumns.find(col => col.id === newColumnId);
    if (!column) return;
    setGroupByColumns(
      groupByColumns.map(col =>
        col.id === oldColumnId
          ? {
              id: newColumnId,
              name: column.name,
              timeUnit: column.type === 'date' ? 'day' : undefined,
            }
          : col
      )
    );
  };

  const removeGroupByColumn = (columnId: string) => {
    setGroupByColumns(groupByColumns.filter(col => col.id !== columnId));
  };

  const updateTimeUnit = (
    columnId: string,
    timeUnit: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'quarter' | 'year'
  ) => {
    setGroupByColumns(
      groupByColumns.map(col => (col.id === columnId ? { ...col, timeUnit } : col))
    );
  };

  const addMetric = () => {
    if (metrics.length >= MAX_METRICS) return; // Limit to MAX_METRICS
    const candidate = aggregableColumns.find(col => !metrics.some(m => m.columnId === col.id));
    const metric: AggregationMetric = {
      id: Math.random().toString(36),
      type: candidate ? 'sum' : 'count',
      columnId: candidate ? candidate.id : undefined,
      alias: '', // Start with empty, will use default only if user doesn't input
    };
    setMetrics([...metrics, metric]);
  };

  const removeMetric = (metricId: string) => {
    setMetrics(metrics.filter(m => m.id !== metricId));
  };

  const handleApply = () => {
    // Use default alias if user didn't provide one (empty or whitespace only)
    // Track used names to prevent duplicates
    const usedNames = new Set<string>();
    const getUniqueName = (baseName: string): string => {
      if (!usedNames.has(baseName)) {
        usedNames.add(baseName);
        return baseName;
      }
      // If duplicate, add numeric suffix
      let counter = 1;
      let uniqueName = `${baseName}_${counter}`;
      while (usedNames.has(uniqueName)) {
        counter++;
        uniqueName = `${baseName}_${counter}`;
      }
      usedNames.add(uniqueName);
      return uniqueName;
    };

    const processedMetrics = metrics.map(metric => {
      const trimmedAlias = (metric.alias || '').trim();
      if (trimmedAlias === '') {
        // Generate default alias
        let baseAlias = '';
        if (metric.type === 'count') {
          baseAlias = 'count()';
        } else if (metric.columnId) {
          const col = availableColumns.find(c => c.id === metric.columnId);
          baseAlias = `${metric.type}(${col?.name || ''})`;
        } else {
          baseAlias = `${metric.type}()`;
        }
        return { ...metric, alias: getUniqueName(baseAlias) };
      }
      // Even user-provided aliases need to be unique
      return { ...metric, alias: getUniqueName(trimmedAlias) };
    });
    onApply?.(groupByColumns, processedMetrics);
    onOpenChange(false);
  };

  const aggregableColumns = availableColumns.filter(col => col.type === 'number');

  // Collect all used names from groupBy columns
  const groupByNames = React.useMemo(() => {
    const names = new Set<string>();
    groupByColumns.forEach(gb => {
      const col = availableColumns.find(c => c.id === gb.id);
      const name = col?.name || gb.name;
      const fullName = name + (gb.timeUnit ? ` (${gb.timeUnit})` : '');
      names.add(fullName);
    });
    return names;
  }, [groupByColumns, availableColumns]);

  // Generate unique names for metrics (for display in placeholder and preview)
  // Also check for duplicate user-provided aliases
  const { uniqueMetricNames, duplicateAliases, defaultPlaceholders } = React.useMemo(() => {
    const usedNames = new Set<string>(groupByNames); // Start with groupBy names
    const duplicates = new Set<string>();
    const placeholders = new Map<string, string>();

    const getUniqueName = (baseName: string): string => {
      if (!usedNames.has(baseName)) {
        usedNames.add(baseName);
        return baseName;
      }
      let counter = 1;
      let uniqueName = `${baseName}_${counter}`;
      while (usedNames.has(uniqueName)) {
        counter++;
        uniqueName = `${baseName}_${counter}`;
      }
      usedNames.add(uniqueName);
      return uniqueName;
    };

    // First pass: collect all user-provided aliases and check for duplicates
    metrics.forEach(metric => {
      const trimmedAlias = (metric.alias || '').trim();
      if (trimmedAlias !== '') {
        // Check if this user-provided alias conflicts with groupBy or other metrics
        if (usedNames.has(trimmedAlias)) {
          duplicates.add(metric.id);
        } else {
          usedNames.add(trimmedAlias);
        }
      }
    });

    // Second pass: generate default names and unique names for display
    const nameMap = new Map<string, string>();
    usedNames.clear();
    groupByNames.forEach(name => usedNames.add(name)); // Reset with groupBy names

    metrics.forEach(metric => {
      const trimmedAlias = (metric.alias || '').trim();
      let baseName = '';
      let defaultName = '';

      if (trimmedAlias !== '') {
        baseName = trimmedAlias;
        // For user-provided, use as-is (duplicate check already done above)
        if (!duplicates.has(metric.id)) {
          usedNames.add(baseName);
        }
      } else {
        // Generate default alias
        if (metric.type === 'count') {
          defaultName = 'count()';
        } else if (metric.columnId) {
          const col = availableColumns.find(c => c.id === metric.columnId);
          defaultName = `${metric.type}(${col?.name || ''})`;
        } else {
          defaultName = `${metric.type}()`;
        }
        baseName = defaultName;

        // Check if default name conflicts, if so show unique version in placeholder
        if (usedNames.has(defaultName)) {
          const uniqueDefault = getUniqueName(defaultName);
          placeholders.set(metric.id, uniqueDefault);
        } else {
          placeholders.set(metric.id, defaultName);
          usedNames.add(defaultName);
        }
      }

      // Generate unique name for display (for preview)
      const uniqueName = getUniqueName(baseName);
      nameMap.set(metric.id, uniqueName);
    });

    return {
      uniqueMetricNames: nameMap,
      duplicateAliases: duplicates,
      defaultPlaceholders: placeholders,
    };
  }, [metrics, availableColumns, groupByNames]);

  const generatePreview = () => {
    const hasGroupBy = groupByColumns.length > 0;
    const hasMetrics = metrics.length > 0;

    if (!hasGroupBy && !hasMetrics) return null;

    return { groupByColumns, metrics, hasGroupBy, hasMetrics };
  };

  if (!open) return null;

  // Use portal to render modal at body level to avoid z-index/overflow issues
  const modalContent = (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] select-none">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-7xl h-[85vh] flex flex-col select-none">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Group By & Aggregation
            </h2>
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-4 min-h-0 overflow-hidden">
            <div className="flex gap-6 min-h-0 flex-1 overflow-hidden">
              {/* Group By Section */}
              <div className="flex flex-col gap-3 flex-[3] border-r border-gray-200 dark:border-gray-700 pr-6 min-h-0 overflow-hidden">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Dimensions (Group By)
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Select columns to group your data
                  </p>
                </div>
                <div className="space-y-2 flex-1 min-h-0 overflow-y-auto preview-scrollbar-modal">
                  {groupByColumns.length === 0 ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic py-2">
                      No columns selected
                    </div>
                  ) : (
                    groupByColumns.map(col => {
                      const columnMeta = availableColumns.find(c => c.id === col.id);
                      const isDateColumn = columnMeta?.type === 'date';
                      const availableOptions = availableColumns.filter(
                        c => c.id === col.id || !groupByColumns.find(gc => gc.id === c.id)
                      );

                      const currentTimeUnit = col.timeUnit || 'day';

                      const selectedColumnName = columnMeta?.name || col.name;
                      const selectedColumnType = columnMeta?.type;
                      const selectedColumnDateFormat = columnMeta?.dateFormat;

                      return (
                        <div
                          key={col.id}
                          className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <Select
                              value={col.id}
                              onValueChange={newColumnId =>
                                updateGroupByColumn(col.id, newColumnId)
                              }
                            >
                              <SelectTrigger className="w-full h-9 text-sm">
                                <div className="flex items-center justify-between w-full min-w-0">
                                  <span className="truncate">{selectedColumnName}</span>
                                  {selectedColumnType && (
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                      (
                                      {selectedColumnType === 'date' && selectedColumnDateFormat
                                        ? `${selectedColumnType} - ${selectedColumnDateFormat}`
                                        : selectedColumnType}
                                      )
                                    </span>
                                  )}
                                </div>
                              </SelectTrigger>
                              <SelectContent className="z-[1000]">
                                {availableOptions.map(option => (
                                  <SelectItem key={option.id} value={option.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{option.name}</span>
                                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                        (
                                        {option.type === 'date' && option.dateFormat
                                          ? `${option.type} - ${option.dateFormat}`
                                          : option.type}
                                        )
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {isDateColumn && (
                            <div className="flex-1 min-w-0">
                              <Select
                                value={currentTimeUnit}
                                onValueChange={value => updateTimeUnit(col.id, value as any)}
                              >
                                <SelectTrigger className="w-full h-9 text-xs">
                                  <span className="block truncate capitalize">
                                    {currentTimeUnit}
                                  </span>
                                </SelectTrigger>
                                <SelectContent className="z-[1000]">
                                  <SelectItem value="second">Second</SelectItem>
                                  <SelectItem value="minute">Minute</SelectItem>
                                  <SelectItem value="hour">Hour</SelectItem>
                                  <SelectItem value="day">Day</SelectItem>
                                  <SelectItem value="month">Month</SelectItem>
                                  <SelectItem value="quarter">Quarter</SelectItem>
                                  <SelectItem value="year">Year</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <button
                            onClick={() => removeGroupByColumn(col.id)}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <Button
                  onClick={addGroupByColumn}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 bg-transparent"
                  disabled={availableColumns.every(col =>
                    groupByColumns.some(gc => gc.id === col.id)
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Dimension
                </Button>
              </div>

              {/* Aggregation Section */}
              <div className="flex flex-col gap-3 flex-[3] border-r border-gray-200 dark:border-gray-700 pr-6 min-h-0 overflow-hidden">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Metrics (Aggregation)
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Define metrics to aggregate (max {MAX_METRICS})
                  </p>
                </div>
                <div className="space-y-2 flex-1 min-h-0 overflow-y-auto preview-scrollbar-modal">
                  {metrics.length === 0 ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic py-2">
                      No metrics added
                    </div>
                  ) : (
                    metrics.map(metric => {
                      const metricColumn = metric.columnId
                        ? availableColumns.find(c => c.id === metric.columnId)
                        : null;
                      return (
                        <div
                          key={metric.id}
                          className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <Select
                              value={metric.type}
                              onValueChange={value =>
                                setMetrics(
                                  metrics.map(m =>
                                    m.id === metric.id
                                      ? {
                                          ...m,
                                          type: value as any,
                                          columnId: value === 'count' ? undefined : m.columnId,
                                        }
                                      : m
                                  )
                                )
                              }
                            >
                              <SelectTrigger className="w-full h-9 text-sm">
                                <span className="block truncate capitalize">{metric.type}</span>
                              </SelectTrigger>
                              <SelectContent className="z-[1000]">
                                <SelectItem value="sum">Sum</SelectItem>
                                <SelectItem value="average">Average</SelectItem>
                                <SelectItem value="min">Min</SelectItem>
                                <SelectItem value="max">Max</SelectItem>
                                <SelectItem value="count">Count</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {metric.type !== 'count' && (
                            <div className="flex-1 min-w-0">
                              <Select
                                value={metric.columnId || ''}
                                onValueChange={value =>
                                  setMetrics(
                                    metrics.map(m =>
                                      m.id === metric.id ? { ...m, columnId: value } : m
                                    )
                                  )
                                }
                              >
                                <SelectTrigger className="w-full h-9 text-sm">
                                  <div className="flex items-center justify-between w-full min-w-0">
                                    <span className="truncate">
                                      {metricColumn?.name || 'Select column...'}
                                    </span>
                                    {metricColumn?.type && (
                                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                        (
                                        {metricColumn.type === 'date' && metricColumn.dateFormat
                                          ? `${metricColumn.type} - ${metricColumn.dateFormat}`
                                          : metricColumn.type}
                                        )
                                      </span>
                                    )}
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="z-[1000]">
                                  {aggregableColumns.map(col => (
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
                          <div className="flex-1 min-w-0">
                            <div className="relative">
                              <Input
                                value={metric.alias || ''}
                                onChange={e =>
                                  setMetrics(
                                    metrics.map(m =>
                                      m.id === metric.id ? { ...m, alias: e.target.value } : m
                                    )
                                  )
                                }
                                placeholder={
                                  metric.alias?.trim()
                                    ? 'Alias (e.g., Total Revenue)'
                                    : defaultPlaceholders.get(metric.id) ||
                                      'Alias (e.g., Total Revenue)'
                                }
                                className={`h-9 text-sm pr-8 ${
                                  duplicateAliases.has(metric.id)
                                    ? '!border-red-500 !ring-1 !ring-red-500 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500'
                                    : ''
                                }`}
                              />
                              {duplicateAliases.has(metric.id) && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 group">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-2 py-1 text-xs text-red-700 dark:text-red-300 whitespace-nowrap shadow-lg">
                                      Name already exists
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeMetric(metric.id)}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <Button
                  onClick={addMetric}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 bg-transparent"
                  disabled={
                    metrics.length >= MAX_METRICS ||
                    (aggregableColumns.length === 0 && metrics.some(m => m.type === 'count'))
                  }
                >
                  <Plus className="w-4 h-4" />
                  Add Metric
                </Button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 h-48">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Preview</h3>
              </div>
              <div className="h-[calc(100%-2.5rem)] overflow-y-auto preview-scrollbar-modal">
                {(() => {
                  const preview = generatePreview();
                  if (!preview) {
                    return (
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic p-4 rounded bg-gray-50 dark:bg-gray-800/50">
                        Add dimensions or metrics to see preview
                      </div>
                    );
                  }

                  return (
                    <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-2">
                        Applied Aggregation
                      </p>
                      <div className="space-y-2">
                        {preview.hasGroupBy && (
                          <div className="text-xs text-blue-900 dark:text-blue-100">
                            <span className="font-semibold mr-1">Group By:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {preview.groupByColumns.map((gb, idx) => {
                                const columnName =
                                  availableColumns.find(c => c.id === gb.id)?.name || gb.name;
                                return (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40"
                                  >
                                    <span>{columnName}</span>
                                    {gb.timeUnit && (
                                      <span className="text-blue-700 dark:text-blue-300 text-[10px]">
                                        ({gb.timeUnit})
                                      </span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {preview.hasMetrics && (
                          <div className="text-xs text-blue-900 dark:text-blue-100">
                            <span className="font-semibold mr-1">Metrics:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {preview.metrics.map((metric, idx) => {
                                // Use unique name from the map (shows suffix if duplicate)
                                const displayAlias =
                                  uniqueMetricNames.get(metric.id) || metric.alias || 'Unknown';
                                return (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40"
                                  >
                                    <span>{displayAlias}</span>
                                    <span className="text-blue-700 dark:text-blue-300 text-[10px]">
                                      ({metric.type})
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={metrics.length === 0 || duplicateAliases.size > 0}
              className="gap-2"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  // Only use portal if document.body exists (client-side)
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }

  // Fallback for SSR
  return modalContent;
};
