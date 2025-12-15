import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, ChevronDown, AlertCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '../ui/card';
import { ModalConfirm } from '../ui/modal-confirm';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/toast-container';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import type {
  DatasetFilterColumn,
  DatasetColumnType,
  SortLevel,
  GroupByColumn,
  AggregationMetric,
  PivotDimension,
  PivotValue,
} from '@/types/chart';
import type { DataHeader } from '@/utils/dataProcessors';
import { useAppSelector } from '@/store/hooks';
// import { selectWorkingDataset } from '@/features/chartEditor/chartEditorSelectors';
import ColumnPalette, { ColumnChipOverlay } from './drag-drop/ColumnPalette';
import OperationTabs, { type OperationTab } from './drag-drop/OperationTabs';
import FilterTab from './drag-drop/FilterTab';
import SortTab from './drag-drop/SortTab';
// import AggregationTab from './drag-drop/AggregationTab'; // Hidden - pivot handles everything
import PivotTab from './drag-drop/PivotTab';
import OperationsPreview from './drag-drop/OperationsPreview';
import { autoConfigureFromProcessedHeaders, MAX_AUTO_SERIES } from '@/utils/autoSeriesDetection';

interface DragDropDatasetOperationProps {
  className?: string;
  processedHeaders?: DataHeader[];
}

interface DraggedColumn {
  id: string;
  name: string;
  type: DatasetColumnType;
  dateFormat?: string;
}

interface DragItem {
  type: 'column';
  column: DraggedColumn;
}

const DragDropDatasetOperation: React.FC<DragDropDatasetOperationProps> = ({
  className = '',
  processedHeaders,
}) => {
  const { t } = useTranslation();
  const { showError, showWarning, toasts, removeToast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<OperationTab>('filter');
  const [activeColumn, setActiveColumn] = useState<DraggedColumn | null>(null);
  const [overlayContainer, setOverlayContainer] = useState<HTMLElement | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showClearPivotConfirm, setShowClearPivotConfirm] = useState(false);
  const [showClearAggregationConfirm, setShowClearAggregationConfirm] = useState(false);
  const [pendingTab, setPendingTab] = useState<OperationTab | null>(null);
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setOverlayContainer(document.body);
    }
  }, []);
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  const currentDataset = useAppSelector(state => state.dataset.currentDataset);
  // const working = useAppSelector(selectWorkingDataset);

  const datasetConfig = (chartConfig as any)?.datasetConfig;

  // Track previous chart type to detect changes
  const prevChartTypeRef = useRef(currentChartType);

  // Use ref to track latest processedHeaders for async callbacks
  const processedHeadersRef = useRef(processedHeaders);
  useEffect(() => {
    processedHeadersRef.current = processedHeaders;
  }, [processedHeaders]);

  // Helper function to trigger auto-selection after pivot changes
  // This is called from onPivotChange callback (user interaction only)
  // newPivotConfig: new pivot config (if undefined/null, pivot was cleared - don't auto-select)
  const triggerAutoSelection = useCallback(
    (newPivotConfig?: any) => {
      if (!chartConfig) return;

      // If newPivotConfig is explicitly undefined/null, pivot was cleared - don't auto-select
      if (newPivotConfig === undefined || newPivotConfig === null) {
        console.log(
          '[AutoSeries] triggerAutoSelection: Pivot was cleared, skipping auto-selection'
        );
        return;
      }

      // Check if the provided pivot config has any active dimensions
      const hasPivot = Boolean(
        newPivotConfig &&
          ((newPivotConfig.rows?.length ?? 0) > 0 ||
            (newPivotConfig.columns?.length ?? 0) > 0 ||
            (newPivotConfig.values?.length ?? 0) > 0 ||
            (newPivotConfig.filters?.length ?? 0) > 0)
      );

      // Only auto-select if pivot is active
      if (!hasPivot) {
        console.log('[AutoSeries] triggerAutoSelection: No pivot active, skipping');
        return;
      }

      // Check if auto-select is enabled (defaults to true if not set)
      const autoSelectEnabled = (newPivotConfig as any)?.autoSelectEnabled !== false;
      if (!autoSelectEnabled) {
        console.log('[AutoSeries] triggerAutoSelection: Auto-select is disabled, skipping');
        return;
      }

      console.log(
        '[AutoSeries] triggerAutoSelection: Pivot changed, waiting for processedHeaders to update',
        {
          pivotRows: newPivotConfig.rows?.length || 0,
          pivotColumns: newPivotConfig.columns?.length || 0,
          pivotValues: newPivotConfig.values?.length || 0,
          chartType: (chartConfig as any).chartType,
        }
      );

      // Use multiple requestAnimationFrame calls to ensure processedHeaders has updated
      // This is more reliable than setTimeout(0) for waiting for React state updates
      let attempts = 0;
      const maxAttempts = 10; // Wait up to ~160ms (10 frames at 60fps)

      const checkAndAutoSelect = () => {
        attempts++;
        const currentHeaders = processedHeadersRef.current;

        // Check if headers have been updated (they should have pivot structure if pivot is active)
        const hasPivotedHeaders = currentHeaders && currentHeaders.length > 0;

        if (!hasPivotedHeaders && attempts < maxAttempts) {
          // Headers not ready yet, try again next frame
          requestAnimationFrame(checkAndAutoSelect);
          return;
        }

        if (!currentHeaders) {
          console.log(
            '[AutoSeries] triggerAutoSelection: No processedHeaders available after waiting'
          );
          return;
        }

        console.log('[AutoSeries] triggerAutoSelection: Processing auto-selection', {
          headersCount: currentHeaders.length,
          attempts,
        });

        const autoConfigResult = autoConfigureFromProcessedHeaders(
          chartConfig as any,
          currentHeaders,
          newPivotConfig // Use the provided pivot config
        );

        if (!autoConfigResult) {
          const chartType = (chartConfig as any).chartType;
          const currentXAxisKey = (chartConfig as any).axisConfigs?.xAxisKey;
          const currentSeries = (chartConfig as any).axisConfigs?.seriesConfigs || [];

          // Only clear if there's something to clear
          if (currentXAxisKey || currentSeries.length > 0) {
            console.log(
              '[AutoSeries] triggerAutoSelection: Auto-config returned null, clearing existing selection'
            );

            // Clear X-axis and series for charts that use them
            if (
              chartType === 'line' ||
              chartType === 'bar' ||
              chartType === 'area' ||
              chartType === 'scatter'
            ) {
              handleConfigChange({
                axisConfigs: {
                  ...((chartConfig as any).axisConfigs || {}),
                  xAxisKey: undefined,
                  seriesConfigs: [],
                } as any,
              });
            } else if (chartType === 'pie' || chartType === 'donut') {
              handleConfigChange({
                config: {
                  ...((chartConfig as any).config || {}),
                  labelKey: undefined,
                  valueKey: undefined,
                },
              } as any);
            } else if (chartType === 'heatmap') {
              handleConfigChange({
                axisConfigs: {
                  ...((chartConfig as any).axisConfigs || {}),
                  xAxisKey: undefined,
                  yAxisKey: undefined,
                  valueKey: undefined,
                } as any,
              });
            } else if (chartType === 'cycleplot') {
              handleConfigChange({
                axisConfigs: {
                  ...((chartConfig as any).axisConfigs || {}),
                  cycleKey: undefined,
                  periodKey: undefined,
                  valueKey: undefined,
                } as any,
              });
            } else if (chartType === 'histogram') {
              handleConfigChange({
                axisConfigs: {
                  ...((chartConfig as any).axisConfigs || {}),
                  xAxisKey: undefined,
                } as any,
              });
            }
          }
          return;
        }

        const autoConfig = autoConfigResult.config;
        const { skippedCount } = autoConfigResult;

        // Show warning if series were skipped
        if (skippedCount > 0) {
          showWarning(
            'Series Limit',
            `Auto-selected ${MAX_AUTO_SERIES} series. ${skippedCount} additional series were skipped to prevent chart overload. You can manually add more series if needed.`
          );
        }

        // Check if config changed (same comparison logic as before)
        const chartType = (chartConfig as any).chartType;
        let configChanged = false;

        if (chartType === 'pie' || chartType === 'donut') {
          const currentLabelKey = (chartConfig as any).config?.labelKey;
          const currentValueKey = (chartConfig as any).config?.valueKey;
          const newLabelKey = (autoConfig as any).config?.labelKey;
          const newValueKey = (autoConfig as any).config?.valueKey;
          configChanged = currentLabelKey !== newLabelKey || currentValueKey !== newValueKey;
        } else if (chartType === 'heatmap') {
          const currentX = (chartConfig as any).axisConfigs?.xAxisKey;
          const currentY = (chartConfig as any).axisConfigs?.yAxisKey;
          const currentValue = (chartConfig as any).axisConfigs?.valueKey;
          const newX = (autoConfig as any).axisConfigs?.xAxisKey;
          const newY = (autoConfig as any).axisConfigs?.yAxisKey;
          const newValue = (autoConfig as any).axisConfigs?.valueKey;
          configChanged = currentX !== newX || currentY !== newY || currentValue !== newValue;
        } else if (chartType === 'cycleplot') {
          const currentCycle = (chartConfig as any).axisConfigs?.cycleKey;
          const currentPeriod = (chartConfig as any).axisConfigs?.periodKey;
          const currentValue = (chartConfig as any).axisConfigs?.valueKey;
          const newCycle = (autoConfig as any).axisConfigs?.cycleKey;
          const newPeriod = (autoConfig as any).axisConfigs?.periodKey;
          const newValue = (autoConfig as any).axisConfigs?.valueKey;
          configChanged =
            currentCycle !== newCycle || currentPeriod !== newPeriod || currentValue !== newValue;
        } else if (chartType === 'histogram') {
          const currentX = (chartConfig as any).axisConfigs?.xAxisKey;
          const newX = (autoConfig as any).axisConfigs?.xAxisKey;
          configChanged = currentX !== newX;
        } else {
          // Line/Bar/Area/Scatter
          const currentXAxisKey = (chartConfig as any).axisConfigs?.xAxisKey;
          const currentSeries = (chartConfig as any).axisConfigs?.seriesConfigs || [];
          const newXAxisKey = (autoConfig as any).axisConfigs?.xAxisKey;
          const newSeries = (autoConfig as any).axisConfigs?.seriesConfigs || [];

          const xAxisChanged = currentXAxisKey !== newXAxisKey;
          const currentSeriesDataColumns = new Set(
            currentSeries.map((s: any) => s.dataColumn).filter(Boolean)
          );
          const newSeriesDataColumns = new Set(
            newSeries.map((s: any) => s.dataColumn).filter(Boolean)
          );
          const seriesDataColumnsChanged =
            currentSeriesDataColumns.size !== newSeriesDataColumns.size ||
            [...newSeriesDataColumns].some(col => !currentSeriesDataColumns.has(col));

          const currentSeriesMap = new Map(currentSeries.map((s: any) => [s.dataColumn, s.name]));
          const seriesNamesChanged = newSeries.some((s: any) => {
            const currentName = currentSeriesMap.get(s.dataColumn);
            return currentName !== s.name;
          });

          configChanged = xAxisChanged || seriesDataColumnsChanged || seriesNamesChanged;
        }

        if (configChanged) {
          console.log('[AutoSeries] triggerAutoSelection: Config changed, applying autoConfig', {
            chartType,
            configChanged,
          });
          handleConfigChange(autoConfig);
        } else {
          console.log('[AutoSeries] triggerAutoSelection: Config already matches, skipping update');
        }
      };

      // Start checking for updated headers
      requestAnimationFrame(checkAndAutoSelect);
    },
    [chartConfig, datasetConfig?.pivot, handleConfigChange, showWarning]
  );

  // Effect: Trigger auto-selection when chart type changes (if auto-select is enabled and pivot is active)
  useEffect(() => {
    if (!chartConfig || !processedHeaders || !currentChartType) return;

    const prevChartType = prevChartTypeRef.current;

    // Only trigger if chart type actually changed
    if (prevChartType === currentChartType) {
      prevChartTypeRef.current = currentChartType;
      return;
    }

    // Check if pivot is active
    const hasPivot = Boolean(
      datasetConfig?.pivot &&
        ((datasetConfig.pivot.rows?.length ?? 0) > 0 ||
          (datasetConfig.pivot.columns?.length ?? 0) > 0 ||
          (datasetConfig.pivot.values?.length ?? 0) > 0 ||
          (datasetConfig.pivot.filters?.length ?? 0) > 0)
    );

    if (!hasPivot) {
      prevChartTypeRef.current = currentChartType;
      return;
    }

    // Check if auto-select is enabled
    const autoSelectEnabled = (datasetConfig?.pivot as any)?.autoSelectEnabled !== false;
    if (!autoSelectEnabled) {
      prevChartTypeRef.current = currentChartType;
      return;
    }

    console.log('[AutoSeries] Chart type changed, triggering auto-selection', {
      from: prevChartType,
      to: currentChartType,
    });

    // Trigger auto-selection with current pivot config
    triggerAutoSelection(datasetConfig?.pivot);

    // Update ref
    prevChartTypeRef.current = currentChartType;
  }, [currentChartType, chartConfig, processedHeaders, datasetConfig?.pivot, triggerAutoSelection]);

  // Check if aggregation or pivot is active
  const hasAggregation = Boolean(
    datasetConfig?.aggregation &&
      ((datasetConfig.aggregation.groupBy?.length ?? 0) > 0 ||
        (datasetConfig.aggregation.metrics?.length ?? 0) > 0)
  );
  const hasPivot = Boolean(
    datasetConfig?.pivot &&
      ((datasetConfig.pivot.rows?.length ?? 0) > 0 ||
        (datasetConfig.pivot.columns?.length ?? 0) > 0 ||
        (datasetConfig.pivot.values?.length ?? 0) > 0 ||
        (datasetConfig.pivot.filters?.length ?? 0) > 0)
  );

  // Determine disabled tabs
  const disabledTabs = useMemo<OperationTab[]>(() => {
    const disabled: OperationTab[] = [];
    // Aggregation tab is hidden, so no need to disable it
    // if (hasAggregation) {
    //   disabled.push('pivot');
    // }
    // if (hasPivot) {
    //   disabled.push('aggregation');
    // }
    return disabled;
  }, [hasAggregation, hasPivot]);

  // Handle tab change with mutual exclusivity
  const handleTabChange = useCallback(
    (tab: OperationTab) => {
      // Aggregation tab is hidden, so no need to handle switching
      // if (tab === 'aggregation' && hasPivot) {
      //   setPendingTab(tab);
      //   setShowClearPivotConfirm(true);
      //   return;
      // }
      // if (tab === 'pivot' && hasAggregation) {
      //   setPendingTab(tab);
      //   setShowClearAggregationConfirm(true);
      //   return;
      // }
      setActiveTab(tab);
    },
    [hasAggregation, hasPivot]
  );

  const handleConfirmClearPivot = useCallback(() => {
    // Preserve autoSelectEnabled when clearing pivot
    const autoSelectEnabled = (datasetConfig?.pivot as any)?.autoSelectEnabled;
    handleConfigChange({
      datasetConfig: {
        ...(datasetConfig || {}),
        pivot: autoSelectEnabled !== undefined ? { autoSelectEnabled } : undefined,
      },
    } as any);
    setShowClearPivotConfirm(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  }, [datasetConfig, handleConfigChange, pendingTab]);

  const handleConfirmClearAggregation = useCallback(() => {
    handleConfigChange({
      datasetConfig: {
        ...(datasetConfig || {}),
        aggregation: undefined,
      },
    } as any);
    setShowClearAggregationConfirm(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  }, [datasetConfig, handleConfigChange, pendingTab]);

  // Get available columns
  const datasetDateFormat =
    (currentDataset as any)?.detectedDateFormat || currentDataset?.dateFormat;

  const availableColumns = useMemo(() => {
    const fallbackFormat = datasetDateFormat;

    if (currentDataset?.headers) {
      return (currentDataset.headers as any[]).map((h: any) => ({
        id: h.id || h.headerId || String(h.name || ''),
        name: h.name || '',
        type: (h.type as DatasetColumnType) || 'text',
        dateFormat:
          ((h.type as DatasetColumnType) || 'text') === 'date'
            ? h.dateFormat || fallbackFormat
            : undefined,
      }));
    }
    if (processedHeaders) {
      return processedHeaders.map((h, idx) => ({
        id: (h as any).id || (h as any).headerId || String(h.name || `col_${idx + 1}`),
        name: h.name || '',
        type: ((h as any).type as DatasetColumnType) || 'text',
        dateFormat:
          (((h as any).type as DatasetColumnType) || 'text') === 'date'
            ? (h as any).dateFormat || fallbackFormat
            : undefined,
      }));
    }
    return [];
  }, [currentDataset?.headers, processedHeaders, datasetDateFormat]);

  const numberFormat = useMemo(() => {
    if (currentDataset) {
      const ds: any = currentDataset;
      return (
        ds.detectedNumberFormat ||
        (ds.decimalSeparator && ds.thousandsSeparator
          ? { decimalSeparator: ds.decimalSeparator, thousandsSeparator: ds.thousandsSeparator }
          : ds.numberFormat || undefined)
      );
    }
    return undefined;
  }, [currentDataset]);

  const uniqueValuesByColumn = useMemo(() => {
    // Always derive uniques from the original dataset headers, not the aggregated working dataset.
    if (!currentDataset?.headers) return {} as Record<string, string[]>;

    const headers = currentDataset.headers as any[];
    const MAX_TRACKED_UNIQUE_VALUES = Number.POSITIVE_INFINITY;
    const result: Record<string, string[]> = {};

    headers.forEach((h: any, idx: number) => {
      // BackendDataHeader keeps column data in `data`
      const colData: any[] = Array.isArray(h.data) ? h.data : [];
      const map = new Map<string, string>();

      colData.forEach(cell => {
        if (cell != null && cell !== '') {
          const str = String(cell).trim();
          if (str) map.set(str, str);
        }
      });

      const colId = h.id || h.headerId || String(h.name || `col_${idx + 1}`);
      const unique = Array.from(map.values()).sort();
      result[colId] =
        unique.length > MAX_TRACKED_UNIQUE_VALUES
          ? unique.slice(0, MAX_TRACKED_UNIQUE_VALUES)
          : unique;
    });

    return result;
  }, [currentDataset?.headers]);

  // dnd-kit sensors & handlers
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragItem | undefined;
    if (data?.type === 'column') {
      setActiveColumn(data.column);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const activeData = active?.data?.current as DragItem | undefined;
      const zone = (over?.data?.current as { zone?: string } | undefined)?.zone;
      if (!activeData || activeData.type !== 'column' || !zone) {
        setActiveColumn(null);
        setActiveDropZone(null);
        return;
      }

      const column = activeData.column;

      // Check if aggregation or pivot is active (recalculate inside callback)
      const currentConfig = (chartConfig as any)?.datasetConfig;
      const hasAgg = Boolean(
        currentConfig?.aggregation &&
          ((currentConfig.aggregation.groupBy?.length ?? 0) > 0 ||
            (currentConfig.aggregation.metrics?.length ?? 0) > 0)
      );
      const hasPiv = Boolean(
        currentConfig?.pivot &&
          ((currentConfig.pivot.rows?.length ?? 0) > 0 ||
            (currentConfig.pivot.columns?.length ?? 0) > 0 ||
            (currentConfig.pivot.values?.length ?? 0) > 0 ||
            (currentConfig.pivot.filters?.length ?? 0) > 0)
      );

      switch (zone) {
        case 'filter': {
          const currentFilters = (datasetConfig?.filters as DatasetFilterColumn[]) || [];
          if (!currentFilters.find(f => f.columnId === column.id)) {
            const newFilter: DatasetFilterColumn = {
              id: `filter_${Date.now()}`,
              columnId: column.id,
              columnName: column.name,
              columnType: column.type,
              conditions: [
                {
                  id: `cond_${Date.now()}`,
                  operator:
                    column.type === 'number'
                      ? 'greater_than'
                      : column.type === 'date'
                        ? 'greater_than'
                        : 'contains',
                  value: null,
                },
              ],
            };
            handleConfigChange({
              datasetConfig: {
                ...(datasetConfig || {}),
                filters: [...currentFilters, newFilter],
              },
            } as any);
          }
          setActiveColumn(null);
          setActiveDropZone(null);
          break;
        }

        case 'sort': {
          const currentSort = (datasetConfig?.sort as SortLevel[]) || [];
          if (!currentSort.find(s => s.columnId === column.id)) {
            const newSort: SortLevel = {
              columnId: column.id,
              direction: 'asc',
            };
            handleConfigChange({
              datasetConfig: {
                ...(datasetConfig || {}),
                sort: [...currentSort, newSort],
              },
            } as any);
          }
          setActiveColumn(null);
          setActiveDropZone(null);
          break;
        }

        case 'aggregation-groupby': {
          // Prevent if pivot is active
          if (hasPiv) {
            setActiveColumn(null);
            setActiveDropZone(null);
            break;
          }
          const currentGroupBy = (datasetConfig?.aggregation?.groupBy as GroupByColumn[]) || [];
          if (!currentGroupBy.find(g => g.id === column.id)) {
            const newGroupBy: GroupByColumn = {
              id: column.id,
              name: column.name,
              timeUnit: column.type === 'date' ? 'day' : undefined,
            };
            handleConfigChange({
              datasetConfig: {
                ...(datasetConfig || {}),
                aggregation: {
                  ...(datasetConfig?.aggregation || {}),
                  groupBy: [...currentGroupBy, newGroupBy],
                },
              },
            } as any);
          }
          setActiveColumn(null);
          setActiveDropZone(null);
          break;
        }

        case 'aggregation-metrics': {
          // Prevent if pivot is active
          if (hasPiv) {
            setActiveColumn(null);
            setActiveDropZone(null);
            break;
          }
          if (column.type === 'number') {
            const currentMetrics =
              (datasetConfig?.aggregation?.metrics as AggregationMetric[]) || [];

            // Find used operation types for this column
            const usedTypes = new Set(
              currentMetrics.filter(m => m.columnId === column.id).map(m => m.type)
            );

            // Find first available operation type
            const allTypes: AggregationMetric['type'][] = ['sum', 'average', 'min', 'max', 'count'];
            const availableType = allTypes.find(type => !usedTypes.has(type));

            // If all operations are used, don't allow adding
            if (!availableType) {
              setActiveColumn(null);
              setActiveDropZone(null);
              break;
            }

            const newMetric: AggregationMetric = {
              id: `metric_${Date.now()}`,
              type: availableType,
              columnId: column.id,
              alias: '', // Start with empty, like modal version
            };
            handleConfigChange({
              datasetConfig: {
                ...(datasetConfig || {}),
                aggregation: {
                  ...(datasetConfig?.aggregation || {}),
                  metrics: [...currentMetrics, newMetric],
                },
              },
            } as any);
          }
          setActiveColumn(null);
          setActiveDropZone(null);
          break;
        }

        case 'pivot-rows': {
          // Prevent if aggregation is active
          if (hasAgg) {
            setActiveColumn(null);
            setActiveDropZone(null);
            break;
          }
          const currentRows = (datasetConfig?.pivot?.rows as PivotDimension[]) || [];
          if (!currentRows.find(d => d.columnId === column.id)) {
            const newDimension: PivotDimension = {
              id: `pivot-row_${Date.now()}`,
              columnId: column.id,
              name: column.name,
              columnType: column.type,
              timeUnit: column.type === 'date' ? 'day' : undefined,
            };
            const newRows = [...currentRows, newDimension];
            const newPivotConfig = {
              ...(datasetConfig?.pivot || {}),
              rows: newRows,
            };
            handleConfigChange({
              datasetConfig: {
                ...(datasetConfig || {}),
                pivot: newPivotConfig,
              },
            } as any);
            // Trigger auto-selection after dropping field into pivot zone
            // Pass the new pivot config explicitly so it checks against the updated state
            triggerAutoSelection(newPivotConfig);
          }
          setActiveColumn(null);
          setActiveDropZone(null);
          break;
        }

        case 'pivot-columns': {
          // Prevent if aggregation is active
          if (hasAgg) {
            setActiveColumn(null);
            setActiveDropZone(null);
            break;
          }
          const currentColumns = (datasetConfig?.pivot?.columns as PivotDimension[]) || [];
          if (!currentColumns.find(d => d.columnId === column.id)) {
            const newDimension: PivotDimension = {
              id: `pivot-col_${Date.now()}`,
              columnId: column.id,
              name: column.name,
              columnType: column.type,
              timeUnit: column.type === 'date' ? 'day' : undefined,
            };
            const newColumns = [...currentColumns, newDimension];
            const newPivotConfig = {
              ...(datasetConfig?.pivot || {}),
              columns: newColumns,
            };
            handleConfigChange({
              datasetConfig: {
                ...(datasetConfig || {}),
                pivot: newPivotConfig,
              },
            } as any);
            // Trigger auto-selection after dropping field into pivot zone
            // Pass the new pivot config explicitly so it checks against the updated state
            triggerAutoSelection(newPivotConfig);
          }
          setActiveColumn(null);
          setActiveDropZone(null);
          break;
        }

        case 'pivot-values': {
          // Prevent if aggregation is active
          if (hasAgg) {
            setActiveColumn(null);
            setActiveDropZone(null);
            break;
          }
          // All column types can be used in values (Count works for all, numeric operations for numbers)
          const currentValues = (datasetConfig?.pivot?.values as PivotValue[]) || [];

          // Determine available operations based on column type
          const allOperations: PivotValue['aggregationType'][] = [
            'sum',
            'average',
            'min',
            'max',
            'count',
          ];
          const availableOperations =
            column.type === 'number'
              ? allOperations
              : (['count'] as PivotValue['aggregationType'][]);

          // Find used operation types for this column
          const usedTypes = new Set(
            currentValues.filter(v => v.columnId === column.id).map(v => v.aggregationType)
          );

          // Find first available operation type
          const availableType = availableOperations.find(type => !usedTypes.has(type));

          // If all available operations are used, don't allow adding
          if (!availableType) {
            setActiveColumn(null);
            setActiveDropZone(null);
            break;
          }

          const newValue: PivotValue = {
            id: `pivot-val_${Date.now()}`,
            columnId: column.id,
            name: column.name,
            aggregationType: availableType,
          };
          const newPivotConfig = {
            ...(datasetConfig?.pivot || {}),
            values: [...currentValues, newValue],
          };
          handleConfigChange({
            datasetConfig: {
              ...(datasetConfig || {}),
              pivot: newPivotConfig,
            },
          } as any);
          // Trigger auto-selection after dropping field into pivot zone
          // Pass the new pivot config explicitly so it checks against the updated state
          triggerAutoSelection(newPivotConfig);

          setActiveColumn(null);
          setActiveDropZone(null);
          break;
        }

        case 'pivot-filters': {
          // Prevent if aggregation is active
          if (hasAgg) {
            setActiveColumn(null);
            setActiveDropZone(null);
            break;
          }
          const currentFilters = (datasetConfig?.pivot?.filters as PivotDimension[]) || [];
          if (!currentFilters.find(d => d.columnId === column.id)) {
            const newDimension: PivotDimension = {
              id: `pivot-filter_${Date.now()}`,
              columnId: column.id,
              name: column.name,
              columnType: column.type,
              timeUnit: column.type === 'date' ? 'day' : undefined,
            };
            handleConfigChange({
              datasetConfig: {
                ...(datasetConfig || {}),
                pivot: {
                  ...(datasetConfig?.pivot || {}),
                  filters: [...currentFilters, newDimension],
                },
              },
            } as any);
          }
          setActiveColumn(null);
          setActiveDropZone(null);
          break;
        }
        default:
          setActiveColumn(null);
          break;
      }
    },
    [chartConfig, datasetConfig, handleConfigChange]
  );

  const handleDragCancel = useCallback(() => {
    setActiveColumn(null);
    setActiveDropZone(null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const zone = (event.over?.data?.current as { zone?: string } | undefined)?.zone || null;
    setActiveDropZone(zone);
  }, []);

  const paletteColumns = useMemo(() => {
    if (!activeTab) return availableColumns;

    if (activeTab === 'filter') {
      const filters = (datasetConfig?.filters as DatasetFilterColumn[]) || [];
      const excludedIds = new Set(filters.map(f => f.columnId));
      return availableColumns.filter(col => !excludedIds.has(col.id));
    }

    if (activeTab === 'sort') {
      const sortLevels = (datasetConfig?.sort as SortLevel[]) || [];
      const excludedIds = new Set(sortLevels.map(s => s.columnId));
      return availableColumns.filter(col => !excludedIds.has(col.id));
    }

    // For aggregation we allow reusing the same column in both group-by and metrics,
    // so keep the full palette visible.
    if (activeTab === 'aggregation') {
      return availableColumns;
    }

    return availableColumns;
  }, [
    activeTab,
    availableColumns,
    datasetConfig?.filters,
    datasetConfig?.sort,
    datasetConfig?.aggregation?.groupBy,
  ]);

  const hasDataset = currentDataset && availableColumns.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className={`select-none ${className}`}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              {t('chart_editor_dataset_operation', 'Dataset Operation')}
            </h3>
            <motion.div
              className="flex items-center gap-2"
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </motion.div>
          </div>
        </CardHeader>

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="dataset-operation-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <CardContent className="space-y-4 mt-4">
                {!hasDataset ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                    {t(
                      'chart_editor_dataset_operation_no_dataset',
                      'Select a dataset to enable filter operations.'
                    )}
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                    onDragOver={handleDragOver}
                  >
                    <div className="space-y-4">
                      {/* Column Palette - Top */}
                      <ColumnPalette columns={paletteColumns} />

                      {/* Operation Tabs */}
                      <div className="space-y-3 flex flex-col h-full">
                        <OperationTabs
                          activeTab={activeTab}
                          onTabChange={handleTabChange}
                          disabledTabs={disabledTabs}
                        />

                        {/* Mutual Exclusivity Banner */}
                        {/* Hidden - aggregation tab is removed */}
                        {false &&
                          (hasAggregation || hasPivot) &&
                          !bannerDismissed &&
                          (activeTab === 'aggregation' || activeTab === 'pivot') && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={cn(
                                'rounded-lg border-2 p-3 flex items-start gap-3 relative',
                                hasAggregation
                                  ? 'border-purple-500/50 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-amber-500/50 bg-amber-50 dark:bg-amber-900/20'
                              )}
                            >
                              <AlertCircle
                                className={cn(
                                  'w-5 h-5 flex-shrink-0 mt-0.5',
                                  hasAggregation
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    'text-sm font-semibold mb-1',
                                    hasAggregation
                                      ? 'text-purple-900 dark:text-purple-100'
                                      : 'text-amber-900 dark:text-amber-100'
                                  )}
                                >
                                  {hasAggregation
                                    ? 'Aggregation Mode Active'
                                    : 'Pivot Table Mode Active'}
                                </p>
                                <p
                                  className={cn(
                                    'text-xs leading-relaxed',
                                    hasAggregation
                                      ? 'text-purple-700 dark:text-purple-300'
                                      : 'text-amber-700 dark:text-amber-300'
                                  )}
                                >
                                  {hasAggregation
                                    ? 'You can only use either Aggregation or Pivot Table at a time. Pivot Table is a more advanced version of aggregation. Switch to Pivot Table tab to use it instead.'
                                    : 'You can only use either Aggregation or Pivot Table at a time. Pivot Table provides more flexibility with rows, columns, values, and filters.'}
                                </p>
                              </div>
                              <button
                                onClick={() => setBannerDismissed(true)}
                                className={cn(
                                  'flex-shrink-0 p-1.5 rounded-md transition-all cursor-pointer',
                                  'hover:bg-black/5 dark:hover:bg-white/10',
                                  'active:scale-95',
                                  hasAggregation
                                    ? 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300'
                                    : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
                                )}
                                title="Close banner"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          )}

                        {/* Operation Content */}
                        <div className="flex-1 min-h-0 flex flex-col">
                          <div className="flex-1 overflow-visible">
                            <AnimatePresence mode="wait">
                              {activeTab === 'filter' && (
                                <FilterTab
                                  availableColumns={availableColumns}
                                  filters={
                                    (datasetConfig?.filters as unknown as DatasetFilterColumn[]) ||
                                    []
                                  }
                                  numberFormat={numberFormat}
                                  uniqueValuesByColumn={uniqueValuesByColumn}
                                  onFilterChange={cols =>
                                    handleConfigChange({
                                      datasetConfig: {
                                        ...(datasetConfig || {}),
                                        filters: cols.length ? (cols as any) : undefined,
                                      },
                                    } as any)
                                  }
                                />
                              )}

                              {activeTab === 'sort' && (
                                <SortTab
                                  availableColumns={availableColumns}
                                  sortLevels={(datasetConfig?.sort as SortLevel[]) || []}
                                  onSortChange={(levels: SortLevel[]) =>
                                    handleConfigChange({
                                      datasetConfig: {
                                        ...(datasetConfig || {}),
                                        sort: levels.length ? levels : undefined,
                                      },
                                    } as any)
                                  }
                                />
                              )}

                              {/* Aggregation tab hidden - pivot handles everything */}
                              {false &&
                                activeTab === 'aggregation' &&
                                // <AggregationTab
                                //   availableColumns={availableColumns}
                                //   groupBy={
                                //     (datasetConfig?.aggregation?.groupBy as GroupByColumn[]) || []
                                //   }
                                //   metrics={
                                //     (datasetConfig?.aggregation?.metrics as AggregationMetric[]) ||
                                //     []
                                //   }
                                //   onAggregationChange={(groupBy, metrics) =>
                                //     handleConfigChange({
                                //       datasetConfig: {
                                //         ...(datasetConfig || {}),
                                //         aggregation:
                                //           groupBy.length > 0 || metrics.length > 0
                                //             ? {
                                //                 ...(datasetConfig?.aggregation || {}),
                                //                 groupBy,
                                //                 metrics,
                                //               }
                                //             : undefined,
                                //       },
                                //     } as any)
                                //   }
                                // />
                                null}

                              {activeTab === 'pivot' && (
                                <PivotTab
                                  autoSelectEnabled={
                                    (datasetConfig?.pivot as any)?.autoSelectEnabled !== false
                                  }
                                  onAutoSelectToggle={enabled => {
                                    handleConfigChange({
                                      datasetConfig: {
                                        ...(datasetConfig || {}),
                                        pivot: {
                                          ...(datasetConfig?.pivot || {}),
                                          autoSelectEnabled: enabled,
                                        },
                                      },
                                    } as any);
                                  }}
                                  availableColumns={availableColumns}
                                  rows={(datasetConfig?.pivot?.rows as PivotDimension[]) || []}
                                  columns={
                                    (datasetConfig?.pivot?.columns as PivotDimension[]) || []
                                  }
                                  values={(datasetConfig?.pivot?.values as PivotValue[]) || []}
                                  filters={
                                    (datasetConfig?.pivot?.filters as PivotDimension[]) || []
                                  }
                                  onPivotChange={(rows, columns, values, filters) => {
                                    // Update pivot config
                                    const newPivotConfig =
                                      rows.length > 0 ||
                                      columns.length > 0 ||
                                      values.length > 0 ||
                                      filters.length > 0
                                        ? {
                                            ...(datasetConfig?.pivot || {}),
                                            rows,
                                            columns,
                                            values,
                                            filters,
                                          }
                                        : undefined;

                                    const pivotUpdate: any = {
                                      datasetConfig: {
                                        ...(datasetConfig || {}),
                                        pivot: newPivotConfig,
                                      },
                                    };

                                    handleConfigChange(pivotUpdate);

                                    // Trigger auto-selection after pivot change (user interaction)
                                    // Pass the new pivot config explicitly so it checks against the updated state
                                    if (newPivotConfig) {
                                      triggerAutoSelection(newPivotConfig);
                                    } else {
                                      // Pivot cleared, don't trigger auto-selection
                                      triggerAutoSelection(undefined);
                                    }
                                  }}
                                  onError={showError}
                                />
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Operations Preview - Fixed height at bottom */}
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Applied Operations Preview
                            </div>
                            <div className="max-h-[280px] overflow-y-auto preview-scrollbar bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                              <style>{`
                                .preview-scrollbar::-webkit-scrollbar {
                                  width: 8px;
                                }
                                .preview-scrollbar::-webkit-scrollbar-track {
                                  background: transparent;
                                  border-radius: 4px;
                                }
                                .preview-scrollbar::-webkit-scrollbar-thumb {
                                  background: linear-gradient(180deg, rgba(156, 163, 175, 0.4), rgba(156, 163, 175, 0.6));
                                  border-radius: 4px;
                                  border: 1px solid rgba(255, 255, 255, 0.1);
                                }
                                .preview-scrollbar::-webkit-scrollbar-thumb:hover {
                                  background: linear-gradient(180deg, rgba(156, 163, 175, 0.6), rgba(156, 163, 175, 0.8));
                                }
                                .dark .preview-scrollbar::-webkit-scrollbar-thumb {
                                  background: linear-gradient(180deg, rgba(75, 85, 99, 0.5), rgba(75, 85, 99, 0.7));
                                  border: 1px solid rgba(0, 0, 0, 0.2);
                                }
                                .dark .preview-scrollbar::-webkit-scrollbar-thumb:hover {
                                  background: linear-gradient(180deg, rgba(75, 85, 99, 0.7), rgba(75, 85, 99, 0.9));
                                }
                                .preview-scrollbar {
                                  scrollbar-width: thin;
                                  scrollbar-color: rgba(156, 163, 175, 0.6) transparent;
                                }
                                .dark .preview-scrollbar {
                                  scrollbar-color: rgba(75, 85, 99, 0.7) transparent;
                                }
                              `}</style>
                              <OperationsPreview
                                availableColumns={availableColumns}
                                filters={(datasetConfig?.filters as DatasetFilterColumn[]) || []}
                                sortLevels={(datasetConfig?.sort as SortLevel[]) || []}
                                groupBy={
                                  (datasetConfig?.aggregation?.groupBy as GroupByColumn[]) || []
                                }
                                metrics={
                                  (datasetConfig?.aggregation?.metrics as AggregationMetric[]) || []
                                }
                                pivotRows={(datasetConfig?.pivot?.rows as PivotDimension[]) || []}
                                pivotColumns={
                                  (datasetConfig?.pivot?.columns as PivotDimension[]) || []
                                }
                                pivotValues={(datasetConfig?.pivot?.values as PivotValue[]) || []}
                                pivotFilters={
                                  (datasetConfig?.pivot?.filters as PivotDimension[]) || []
                                }
                                numberFormat={numberFormat}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {overlayContainer &&
                      createPortal(
                        <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
                          {activeColumn ? (
                            <motion.div
                              initial={{ scale: 1, opacity: 1 }}
                              animate={
                                activeDropZone
                                  ? { scale: 0.95, opacity: 1 }
                                  : { scale: 1.02, opacity: 1 }
                              }
                              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                              className="pointer-events-none"
                            >
                              <ColumnChipOverlay
                                column={activeColumn}
                                accent={
                                  activeDropZone === 'filter'
                                    ? 'filter'
                                    : activeDropZone === 'sort'
                                      ? 'sort'
                                      : activeDropZone === 'aggregation-groupby'
                                        ? 'groupby'
                                        : activeDropZone === 'aggregation-metrics'
                                          ? 'metric'
                                          : activeDropZone === 'pivot-rows'
                                            ? 'groupby'
                                            : activeDropZone === 'pivot-columns'
                                              ? 'groupby'
                                              : activeDropZone === 'pivot-values'
                                                ? 'metric'
                                                : activeDropZone === 'pivot-filters'
                                                  ? 'filter'
                                                  : activeDropZone?.startsWith('aggregation')
                                                    ? 'aggregation'
                                                    : null
                                }
                              />
                            </motion.div>
                          ) : null}
                        </DragOverlay>,
                        overlayContainer
                      )}
                  </DndContext>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Confirmation Dialogs - Aggregation tab is hidden, so these are not needed */}
      {false && (
        <>
          <ModalConfirm
            isOpen={showClearPivotConfirm}
            onClose={() => {
              setShowClearPivotConfirm(false);
              setPendingTab(null);
            }}
            onConfirm={handleConfirmClearPivot}
            title="Clear Pivot Table"
            message="Switching to Aggregation will clear all pivot table settings. Are you sure you want to continue?"
            confirmText="Clear & Switch"
            cancelText="Cancel"
            type="warning"
          />

          <ModalConfirm
            isOpen={showClearAggregationConfirm}
            onClose={() => {
              setShowClearAggregationConfirm(false);
              setPendingTab(null);
            }}
            onConfirm={handleConfirmClearAggregation}
            title="Clear Aggregation"
            message="Switching to Pivot Table will clear all aggregation settings. Are you sure you want to continue?"
            confirmText="Clear & Switch"
            cancelText="Cancel"
            type="warning"
          />
        </>
      )}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </motion.div>
  );
};

export default DragDropDatasetOperation;