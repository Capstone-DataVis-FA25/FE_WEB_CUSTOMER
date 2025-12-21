import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, Eye, RotateCcw, Database, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import ChartTab from '../chart-creator/ChartTab';
import DataTab from '../chart-creator/DataTab';
import type { DataHeader } from '@/utils/dataProcessors';
import type { NumberFormat, DateFormat } from '@/contexts/DatasetContext';
import { useDataset } from '@/features/dataset/useDataset';
import { convertToChartData } from '@/utils/dataConverter';
import { useCharts } from '@/features/charts/useCharts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/toast-container';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setChartData as setChartDataAction,
  setWorkingDataset,
} from '@/features/chartEditor/chartEditorSlice';
import { selectWorkingDataset } from '@/features/chartEditor/chartEditorSelectors';
import { useChartEditor } from '@/features/chartEditor';
import type { SortLevel, DatasetConfig } from '@/types/chart';
import { buildColumnIndexMap, applyMultiLevelSort, applyDatasetFilters } from '@/utils/datasetOps';
import { applyAggregation } from '@/utils/aggregationUtils';
import { applyPivot } from '@/utils/pivotUtils';
import { useChartHistory } from '@/features/chartHistory/useChartHistory';
import Routers from '@/router/routers';
import RestoreConfirmDialog from '@/components/charts/RestoreConfirmDialog';
import Utils from '@/utils/Utils';
import { ChartType } from '@/features/charts';

const normalizeDateFormat = (fmt?: string) => {
  if (!fmt) return fmt;
  return fmt.replace(/Month/g, 'MMMM');
};

const ChartHistoryViewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const dispatch = useAppDispatch();

  // Get historyId from URL params
  const historyId = searchParams.get('historyId') || undefined;
  const chartId = searchParams.get('chartId') || undefined;

  // ============================================================
  // LOCAL STATE
  // ============================================================
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'data'>('chart');

  // ============================================================
  // HOOKS
  // ============================================================
  const {
    setChartConfig,
    setCurrentChartType,
    setEditableName,
    setEditableDescription,
    clearChartEditor,
  } = useChartEditor();

  const { getDatasetById, currentDataset, loading: isDatasetLoading } = useDataset();
  const { getChartById } = useCharts();
  const working = useAppSelector(selectWorkingDataset);

  const { selectedHistory, restoring, getHistoryById, restoreFromHistory, getChartHistory } =
    useChartHistory();

  // ============================================================
  // LOAD HISTORY DATA
  // ============================================================
  useEffect(() => {
    if (!historyId) {
      showError(t('chartHistory.noHistoryId'));
      navigate(Routers.WORKSPACE_CHARTS);
      return;
    }

    (async () => {
      try {
        const res = await getHistoryById(historyId);
        const history = (res as any)?.payload;

        if (history) {
          // Load history data into editor
          setChartConfig(history.config);
          setCurrentChartType(history.type);
          setEditableName(history.name);
          setEditableDescription(history.description);

          // Load dataset
          if (history.datasetId) {
            await getDatasetById(history.datasetId);
          }
        } else {
          showError(t('chartHistory.loadFailed'));
        }
      } catch (e: any) {
        const msg = e?.message || t('chartHistory.errorLoading');
        showError(msg);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyId]);

  // ============================================================
  // PROCESS DATASET
  // ============================================================
  const excelInitial = useMemo(() => {
    if (!currentDataset) {
      return { initialColumns: undefined, initialData: undefined };
    }

    const headers: any[] = (currentDataset?.headers as any[]) || [];
    let initialColumns: DataHeader[] | undefined;
    let initialData: string[][] | undefined;

    if (headers.length) {
      initialColumns = headers.map((h, idx) => ({
        id: (h as any).id,
        name: h.name ?? `Column ${idx + 1}`,
        type: (h.type as 'text' | 'number' | 'date') ?? 'text',
        dateFormat: h.dateFormat,
        index: idx,
        width: h.width ?? 200,
      }));

      const maxLen = Math.max(0, ...headers.map(h => (Array.isArray(h.data) ? h.data.length : 0)));
      initialData = Array.from({ length: Math.max(maxLen, 0) }).map((_, r) =>
        headers.map(h => {
          const raw = (h.data && h.data[r]) ?? '';
          if (h?.type === 'date') {
            const fmt: string | undefined = normalizeDateFormat(h?.dateFormat);
            const d = dayjs(raw);
            return d.isValid() ? d.format(fmt || 'YYYY-MM-DD') : String(raw ?? '');
          }
          return String(raw ?? '');
        })
      );
    }

    return { initialColumns, initialData };
  }, [currentDataset]);

  const excelFormats = useMemo(() => {
    if (!currentDataset) {
      return { initialNumberFormat: undefined, initialDateFormat: undefined };
    }

    const ds: any = currentDataset || {};
    const initialNumberFormat: NumberFormat | undefined =
      ds.detectedNumberFormat ||
      (ds.decimalSeparator && ds.thousandsSeparator
        ? { decimalSeparator: ds.decimalSeparator, thousandsSeparator: ds.thousandsSeparator }
        : ds.numberFormat || undefined);
    const initialDateFormat: DateFormat | undefined =
      ds.detectedDateFormat || ds.dateFormat || undefined;
    return { initialNumberFormat, initialDateFormat };
  }, [currentDataset]);

  // ============================================================
  // highlightHeaderIds - Same as ChartEditorPage
  // ============================================================
  const chartConfig = useMemo(() => selectedHistory?.config, [selectedHistory?.config]);

  const { highlightHeaderIds } = useMemo(() => {
    if (!chartConfig) return { highlightHeaderIds: [] as string[] };
    const ids = new Set<string>();
    const nameToId = new Map<string, string>();
    const idSet = new Set<string>();

    const collect = (arr?: any[]) => {
      (arr || []).forEach(h => {
        if (h?.name && (h?.id || h?.headerId)) {
          const key = String(h.name).trim().toLowerCase();
          const val = (h.id ?? h.headerId) as string;
          if (key && val && !nameToId.has(key)) nameToId.set(key, val);
        }
        const hid = (h?.id ?? h?.headerId) as string | undefined;
        if (hid) idSet.add(hid);
      });
    };

    const headersFromDataset = (currentDataset?.headers as any[]) || [];
    const headersFromWorking = (working?.headers as any[]) || [];
    const headersFromInitial = excelInitial.initialColumns || [];
    collect(headersFromDataset);
    collect(headersFromWorking);
    collect(headersFromInitial as any[]);

    const visit = (node: any) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      for (const [k, v] of Object.entries(node)) {
        if (k === 'headerId' && typeof v === 'string' && v) {
          ids.add(v);
        } else if (k.endsWith('Key') && typeof v === 'string' && v) {
          const raw = String(v).trim();
          const mapped = nameToId.get(raw.toLowerCase());
          if (mapped) ids.add(mapped);
          else if (idSet.has(raw)) ids.add(raw);
        } else if (k === 'dataColumn' && typeof v === 'string' && v) {
          const raw = String(v).trim();
          const mapped = nameToId.get(raw.toLowerCase());
          if (mapped) ids.add(mapped);
          else if (idSet.has(raw)) ids.add(raw);
        } else if (k.endsWith('ColumnId') && typeof v === 'string' && v) {
          const raw = String(v).trim();
          if (idSet.has(raw)) ids.add(raw);
        } else if (v && typeof v === 'object') {
          visit(v);
        }
      }
    };

    visit(chartConfig);
    const outAll = Array.from(ids);
    const out = outAll.filter(id => idSet.has(id));
    return { highlightHeaderIds: out };
  }, [chartConfig, currentDataset?.headers, working?.headers, excelInitial.initialColumns]);

  // ============================================================
  // EFFECT: Initialize working dataset from loaded dataset
  // ============================================================
  useEffect(() => {
    if (!excelInitial.initialColumns || !excelInitial.initialData) return;

    const formats = {
      number: excelFormats.initialNumberFormat,
      date: excelFormats.initialDateFormat,
    };

    dispatch(
      setWorkingDataset({
        headers: excelInitial.initialColumns,
        data: excelInitial.initialData,
        formats,
      })
    );
  }, [
    excelInitial.initialColumns,
    excelInitial.initialData,
    excelFormats.initialNumberFormat,
    excelFormats.initialDateFormat,
    dispatch,
  ]);

  // ============================================================
  // HANDLE RESTORE
  // ============================================================
  const handleRestoreClick = () => {
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async (changeNote?: string) => {
    if (!chartId || !historyId) return;

    try {
      await restoreFromHistory(chartId, {
        historyId,
        changeNote,
      }).unwrap();

      setRestoreDialogOpen(false);
      showSuccess(t('chartHistory.restoreSuccess'));
      await getChartById(chartId);
      await getChartHistory(chartId);
      window.location.href = `${Routers.CHART_EDITOR}?chartId=${chartId}`;
    } catch (error) {
      console.error('[ChartHistoryViewPage] Failed to restore:', error);
      showError(t('chartHistory.restoreFailed'));
    }
  };

  const handleBack = () => {
    // Clear chart editor state before navigating back to ensure ChartEditorPage loads fresh data
    clearChartEditor();

    if (chartId) {
      navigate(`${Routers.CHART_EDITOR}?chartId=${chartId}`);
    } else {
      navigate(Routers.WORKSPACE_CHARTS);
    }
  };

  // ============================================================
  // PROCESS DATA (filter → sort → aggregation) - Same as ChartEditorPage
  // ============================================================

  // Store original dataset (before any processing)
  const originalDataset = useMemo(() => {
    return {
      headers: excelInitial.initialColumns || working?.headers,
      data: excelInitial.initialData || working?.data,
    };
  }, [excelInitial.initialColumns, excelInitial.initialData, working?.headers, working?.data]);

  // Get datasetConfig from selectedHistory config
  const datasetConfig: DatasetConfig | undefined = useMemo(() => {
    if (!selectedHistory?.config) return undefined;
    return (selectedHistory.config as any)?.datasetConfig as DatasetConfig | undefined;
  }, [selectedHistory?.config]);

  const sortLevels: SortLevel[] = useMemo(() => datasetConfig?.sort ?? [], [datasetConfig]);

  // Serialize filters and aggregation for dependency tracking
  const filtersKey = useMemo(() => {
    return JSON.stringify(datasetConfig?.filters || []);
  }, [datasetConfig]);

  const aggregationKey = useMemo(() => {
    return JSON.stringify(datasetConfig?.aggregation || {});
  }, [datasetConfig]);

  const pivotKey = useMemo(() => JSON.stringify(datasetConfig?.pivot || {}), [datasetConfig]);

  // Compute processedData (filter → sort → aggregation/pivot) - Same as ChartEditorPage
  const processedData = useMemo(() => {
    // Always use original dataset for operations (filter/sort/aggregation/pivot)
    // working.data/headers might be aggregated/pivoted, so use originalDataset
    const dataToProcess = originalDataset.data || working?.data;
    const headersToUse = originalDataset.headers || working?.headers;

    if (!headersToUse || !dataToProcess) {
      return { data: undefined, headers: undefined };
    }

    // Get current filters, aggregation, and pivot from datasetConfig (read fresh each time)
    const currentFilters = (datasetConfig as any)?.filters;
    const currentAggregation = datasetConfig?.aggregation;
    const currentPivot = datasetConfig?.pivot;

    try {
      // Build column index map from ORIGINAL headers (not aggregated/pivoted)
      const colIndexMap = buildColumnIndexMap(headersToUse as unknown as DataHeader[]);

      // Filter using original data and original headers
      const filtered =
        applyDatasetFilters(
          dataToProcess,
          currentFilters,
          colIndexMap,
          headersToUse as unknown as DataHeader[]
        ) || dataToProcess;

      // Sort using filtered data
      const multiSorted = applyMultiLevelSort(filtered, sortLevels, colIndexMap) || filtered;

      // Check if pivot is active (pivot takes precedence over aggregation)
      const hasPivot =
        currentPivot &&
        ((currentPivot.rows?.length ?? 0) > 0 ||
          (currentPivot.columns?.length ?? 0) > 0 ||
          (currentPivot.values?.length ?? 0) > 0);

      let finalHeaders: DataHeader[];
      let finalData: string[][];

      if (hasPivot) {
        // Apply pivot transformation - use FILTERED AND SORTED data (multiSorted)
        // Note: Number formatting is NOT applied here - it will be applied by preformatDataToFormats in DataTab
        const pivotResult = applyPivot(
          multiSorted, // This is the filtered + sorted data
          headersToUse as unknown as DataHeader[],
          currentPivot,
          colIndexMap
        );

        // Use pivoted data/headers if pivot is active, otherwise use sorted data
        finalHeaders = pivotResult
          ? pivotResult.headers
          : (headersToUse as unknown as DataHeader[]);
        finalData = pivotResult ? pivotResult.data : multiSorted;
      } else {
        // Apply aggregation if configured - use FILTERED AND SORTED data (multiSorted)
        // Note: Number formatting is NOT applied here - it will be applied by preformatDataToFormats in DataTab
        const aggregationResult = applyAggregation(
          multiSorted, // This is the filtered + sorted data
          headersToUse as unknown as DataHeader[],
          currentAggregation,
          colIndexMap
        );

        // Use aggregated data/headers if aggregation is active, otherwise use sorted data
        finalHeaders = aggregationResult
          ? aggregationResult.headers
          : (headersToUse as unknown as DataHeader[]);
        finalData = aggregationResult ? aggregationResult.data : multiSorted;
      }

      return { data: finalData, headers: finalHeaders };
    } catch (e) {
      console.error('[ChartHistoryViewPage] Error processing data:', e);
      return { data: undefined, headers: undefined };
    }
  }, [
    originalDataset.data,
    originalDataset.headers,
    working?.data,
    working?.headers,
    filtersKey, // Use serialized filters key to detect changes
    sortLevels,
    aggregationKey, // Use serialized aggregation key to detect changes
    pivotKey, // Use serialized pivot key to detect changes
    datasetConfig, // Also depend on datasetConfig to ensure we read fresh values
  ]);

  // ============================================================
  // EFFECT: Update working dataset with aggregated/pivoted headers when aggregation/pivot changes
  // ============================================================
  useEffect(() => {
    if (!processedData.headers || !processedData.data) return;

    // Check if aggregation or pivot is active
    const hasAggregation =
      datasetConfig?.aggregation &&
      (datasetConfig.aggregation.groupBy?.length || datasetConfig.aggregation.metrics?.length);
    const hasPivot =
      datasetConfig?.pivot &&
      ((datasetConfig.pivot.rows?.length ?? 0) > 0 ||
        (datasetConfig.pivot.columns?.length ?? 0) > 0 ||
        (datasetConfig.pivot.values?.length ?? 0) > 0);

    // Only update if aggregation or pivot is active and headers changed
    if (hasAggregation || hasPivot) {
      const headersChanged =
        processedData.headers.length !== working?.headers.length ||
        processedData.headers.some((h, idx) => {
          const existing = working?.headers[idx];
          return !existing || h.id !== (existing as any).id || h.name !== existing.name;
        });

      if (headersChanged && working) {
        dispatch(
          setWorkingDataset({
            headers: processedData.headers as any,
            data: processedData.data,
            formats: working.formats,
          })
        );
      }
    }
  }, [
    processedData.headers,
    processedData.data,
    datasetConfig?.aggregation,
    datasetConfig?.pivot,
    working,
    dispatch,
  ]);

  // ============================================================
  // EFFECT: Sync chart data from processed data
  // ============================================================
  useEffect(() => {
    if (!processedData.headers || !processedData.data) {
      dispatch(setChartDataAction([]));
      return;
    }

    try {
      const headerNames = processedData.headers.map(h => h.name);
      const arrayData: (string | number)[][] = [headerNames, ...processedData.data];
      const converted = convertToChartData(arrayData);
      dispatch(setChartDataAction(converted));
    } catch (e) {
      dispatch(setChartDataAction([]));
    }
  }, [processedData.headers, processedData.data, dispatch]);

  // Compute processedHeaders from processedData
  const processedHeaders = useMemo(() => {
    if (!processedData.headers) return undefined;
    return processedData.headers.map(col => ({ ...col }));
  }, [processedData.headers]);

  // Get chart info based on chart type (MUST be before early return)
  const chartInfo = useMemo(() => {
    const chartType = selectedHistory?.type;
    switch (chartType) {
      case ChartType.Line:
        return {
          name: t('chart_type_line'),
          icon: '📈',
          color: 'bg-blue-500',
        };
      case ChartType.Bar:
        return {
          name: t('chart_type_bar'),
          icon: '📊',
          color: 'bg-green-500',
        };
      case ChartType.Area:
        return {
          name: t('chart_type_area'),
          icon: '📉',
          color: 'bg-purple-500',
        };
      case ChartType.Scatter:
        return {
          name: t('chart_type_scatter'),
          icon: '⚪️',
          color: 'bg-indigo-500',
        };
      case ChartType.Pie:
        return {
          name: t('chart_type_pie'),
          icon: '🥧',
          color: 'bg-pink-500',
        };
      case ChartType.Donut:
        return {
          name: t('chart_type_donut'),
          icon: '🍩',
          color: 'bg-yellow-500',
        };
      case ChartType.CyclePlot:
        return {
          name: t('chart_type_cycle_plot'),
          icon: '🔄',
          color: 'bg-teal-500',
        };
      default:
        return {
          name: t('chart_type_default'),
          icon: '📊',
          color: 'bg-gray-500',
        };
    }
  }, [selectedHistory?.type, t]);

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (!selectedHistory || isDatasetLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <LoadingSpinner
          title={t('chartHistory.loadingTitle')}
          subtitle={t('chartHistory.loadingSubtitle')}
        />
      </div>
    );
  }

  console.log('Processed Data:', processedData);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col">
      {/* Header - Similar to ChartEditorHeader */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0"
      >
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Chart Icon */}
              <div
                className={`w-10 h-10 ${chartInfo.color} rounded-lg flex items-center justify-center text-white text-lg shadow-lg`}
              >
                {chartInfo.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedHistory.name || t('chartHistory.viewTitle')}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <BarChart3 className="w-3 h-3" />
                      {chartInfo.name}
                    </Badge>
                    {currentDataset?.name && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:bg-blue-900/30"
                        title={currentDataset.name}
                      >
                        <Database className="w-3 h-3" />
                        <span className="max-w-[250px] truncate">{currentDataset.name}</span>
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 text-xs border-orange-300 text-orange-600 bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:bg-orange-900/20"
                    >
                      <Eye className="w-3 h-3" />
                      {t('viewOnly')}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {selectedHistory.description && (
                    <div className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t('description')}:
                      </span>
                      <span
                        className="text-xs text-gray-700 dark:text-gray-300"
                        style={{ fontWeight: '500', fontSize: '14px' }}
                      >
                        {selectedHistory.description}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {selectedHistory.createdAt && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                        <span className="font-medium">{t('chart_created')}:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {Utils.getDate(selectedHistory.createdAt, 18)}
                        </span>
                      </div>
                    )}

                    {selectedHistory.updatedBy && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                        <span className="font-medium">{t('updatedBy')}:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {selectedHistory.updatedBy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common_back')}
              </Button>
              <Button
                size="sm"
                onClick={handleRestoreClick}
                disabled={restoring}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {restoring ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('restoring')}
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    {t('restore')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        {/* Tabs Section */}
        <div className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="px-6">
            <div className="flex justify-center">
              <div className="relative inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('chart')}
                  className={`relative w-28 h-[42px] px-3 text-sm font-medium cursor-pointer transition-colors ${
                    activeTab === 'chart'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  aria-selected={activeTab === 'chart'}
                >
                  <span className="inline-flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {t('tab_chart')}
                  </span>
                  {activeTab === 'chart' && (
                    <motion.div
                      layoutId="tab-underline-history"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('data')}
                  className={`relative w-28 h-[42px] px-3 text-sm font-medium cursor-pointer transition-colors ${
                    activeTab === 'data'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  aria-selected={activeTab === 'data'}
                >
                  <span className="inline-flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    {t('tab_data')}
                  </span>
                  {activeTab === 'data' && (
                    <motion.div
                      layoutId="tab-underline-history"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"
                    />
                  )}
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart/Data Content */}
      <div className="flex-1 min-h-0 min-w-0 bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full min-h-0 min-w-0 flex"
        >
          <div
            style={{ display: activeTab === 'chart' ? 'block' : 'none' }}
            className="w-full h-full min-h-0"
          >
            <ChartTab
              processedHeaders={processedHeaders}
              setDataId={() => {}} // No-op in view mode
              datasetId={selectedHistory.datasetId}
              showLeftSidebar={false}
            />
          </div>

          <div
            style={{ display: activeTab === 'data' ? 'block' : 'none' }}
            className="w-full h-full min-h-0"
          >
            <DataTab
              initialColumns={processedData.headers}
              initialData={processedData.data}
              originalColumns={originalDataset.headers}
              originalData={originalDataset.data}
              initialNumberFormat={excelFormats.initialNumberFormat}
              initialDateFormat={excelFormats.initialDateFormat}
              onDataChange={() => {}} // No-op in view mode - read only
              highlightHeaderIds={highlightHeaderIds}
              datasetName={currentDataset?.name || ''}
              datasetConfig={datasetConfig}
              onDatasetConfigChange={() => {}} // No-op in view mode
            />
          </div>
        </motion.div>
      </div>

      {/* Restore Confirmation Dialog */}
      <RestoreConfirmDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        onConfirm={handleRestoreConfirm}
        isRestoring={restoring}
        versionInfo={
          selectedHistory
            ? {
                name: selectedHistory.name,
                description: selectedHistory.description,
                type: selectedHistory.type,
                createdAt: selectedHistory.createdAt,
                updatedBy: selectedHistory.updatedBy,
              }
            : undefined
        }
      />

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default ChartHistoryViewPage;
