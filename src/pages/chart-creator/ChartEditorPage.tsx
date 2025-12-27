import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import ChartHistoryPanel from '@/components/charts/ChartHistoryPanel';

import ChartTab from './ChartTab';
import DataTab from './DataTab';
import type { DataHeader } from '@/utils/dataProcessors';
import type { NumberFormat, DateFormat } from '@/contexts/DatasetContext';
import { convertToChartData } from '@/utils/dataConverter';
import { useCharts } from '@/features/charts/useCharts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import UnsavedChangesModal from '@/components/ui/UnsavedChangesModal';
import ToastContainer from '@/components/ui/toast-container';
import ChartNoteSidebar from '@/components/charts/ChartNoteSidebar';
import { getDefaultChartConfig } from '@/utils/chartDefaults';
import { ChartType, type ChartRequest } from '@/features/charts';
import { clearCurrentDataset } from '@/features/dataset/datasetSlice';
import { fetchDatasetById, fetchDatasets } from '@/features/dataset/datasetThunk';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setWorkingDataset,
  updateWorkingData,
  setChartData as setChartDataAction,
  clearChartEditor,
} from '@/features/chartEditor/chartEditorSlice';
import { selectWorkingDataset } from '@/features/chartEditor/chartEditorSelectors';
import { clearCurrentChartNotes } from '@/features/chartNotes/chartNoteSlice';
import { useChartEditor } from '@/features/chartEditor';
import type { MainChartConfig, SortLevel, DatasetConfig } from '@/types/chart';
import { buildColumnIndexMap, applyMultiLevelSort, applyDatasetFilters } from '@/utils/datasetOps';
import { applyAggregation } from '@/utils/aggregationUtils';
import { applyPivot } from '@/utils/pivotUtils';
import ChartEditorHeader from './ChartEditorHeader';
import { resetBindings } from '@/utils/chartBindings';
import { cleanupChartConfig } from '@/utils/chartConfigCleanup';
import { useChartNotes } from '@/features/chartNotes/useChartNotes';
import { useChartHistory } from '@/features/chartHistory/useChartHistory';
import { captureAndUploadChartSnapshot } from '@/services/uploadService';
import DatasetSelectionDialog from '../chart/components/DatasetSelectionDialog';
import Routers from '@/router/routers';
import ChartAIEvaluation from '@/components/chart/ChartAIEvaluation';

const normalizeDateFormat = (fmt?: string) => {
  if (!fmt) return fmt;
  return fmt.replace(/Month/g, 'MMMM');
};

const ChartEditorPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const modalConfirm = useModalConfirm();
  const dispatch = useAppDispatch();

  // ============================================================
  // DERIVE STATE FROM URL - SINGLE SOURCE OF TRUTH
  // ============================================================
  const chartIdFromUrl = searchParams.get('chartId') || undefined;
  const datasetIdFromUrl = searchParams.get('datasetId') || undefined;
  const locationState = location.state as { type?: ChartType; datasetId?: string } | null;
  const chartTypeFromState = locationState?.type;

  // Determine mode based on URL
  const mode = chartIdFromUrl ? 'edit' : 'create';

  // ============================================================
  // LOCAL STATE
  // ============================================================
  const [currentModalAction, setCurrentModalAction] = useState<'save' | 'reset' | null>(null);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false);
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'data'>('chart');
  // sortLevels will be derived from chartConfig.dataset to make DataTab controlled by datasetConfig

  // Local datasetId state (can differ from URL in create mode after selection)
  const [datasetId, setDatasetId] = useState<string>(datasetIdFromUrl || '');

  // ============================================================
  // HOOKS
  // ============================================================
  const {
    setChartData,
    chartConfig,
    setChartConfig,
    currentChartType,
    setCurrentChartType,
    editableName,
    setEditableName,
    editableDescription,
    setEditableDescription,
    hasChanges,
    resetToOriginal,
    updateOriginals,
    handleConfigChange,
  } = useChartEditor();

  const {
    currentChart,
    loading: isChartLoading,
    getChartById,
    updateChart,
    clearCurrent: clearCurrentChart,
    createChart,
  } = useCharts();

  // Only subscribe to currentDataset to avoid re-renders when datasets list changes
  const currentDataset = useAppSelector(state => state.dataset.currentDataset);

  // Track if we're currently fetching a dataset by ID (not the list)
  // Only show loading when we have a datasetId and are actively fetching it
  const [isFetchingDatasetById, setIsFetchingDatasetById] = React.useState(false);

  // Only show loading spinner when fetching a specific dataset, not when fetching the list
  const isDatasetLoading = isFetchingDatasetById;

  // Get action functions without subscribing to datasets state (prevents re-render on dataset list refresh)
  const getDatasetById = React.useCallback(
    (id: string) => dispatch(fetchDatasetById(id)),
    [dispatch]
  );
  const getDatasets = React.useCallback(() => dispatch(fetchDatasets()), [dispatch]);
  const working = useAppSelector(selectWorkingDataset);

  // Background fetch helpers (notes & history)
  const { getChartNotes, setCurrentNotes } = useChartNotes();
  const { getChartHistory, getHistoryCount } = useChartHistory();

  // ============================================================
  // MEMOIZED VALUES
  // ============================================================
  const excelInitial = useMemo(() => {
    // Only use currentDataset if:
    // 1. There's a datasetId AND
    // 2. currentDataset.id matches the datasetId
    // This prevents showing a dataset that was created but not selected for this chart
    const shouldUseDataset = datasetId && currentDataset && currentDataset.id === datasetId;

    if (!shouldUseDataset) {
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
    } else if (Array.isArray((currentDataset as any)?.rows)) {
      const rows = (currentDataset as any).rows as any[];
      const headerNames = headers.length
        ? headers.map(h => h.name)
        : Array.from({ length: (rows[0] as any[])?.length || 0 }).map((_, i) => `Column ${i + 1}`);
      initialColumns = headerNames.map((name, idx) => ({
        name,
        type: 'text',
        index: idx,
        width: 200,
      }));
      initialData = rows.map((r: any[]) => r.map(v => String(v ?? '')));
    }

    return { initialColumns, initialData };
  }, [datasetId, currentDataset?.id, currentDataset?.headers, (currentDataset as any)?.rows]);

  const excelFormats = useMemo(() => {
    // Only use currentDataset if it matches the datasetId
    const shouldUseDataset = datasetId && currentDataset && currentDataset.id === datasetId;

    if (!shouldUseDataset) {
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
  }, [datasetId, currentDataset?.id, currentDataset]);

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
  // EFFECT: Clear everything on mount and fetch datasets once
  // ============================================================
  const datasetsFetchedRef = React.useRef(false);
  useEffect(() => {
    // console.log('[ChartEditorPage] Mount - clearing all state');
    clearCurrentChart();
    dispatch(clearCurrentDataset());
    dispatch(clearCurrentChartNotes());

    // Fetch datasets once on mount (for dataset selection dialog)
    if (!datasetsFetchedRef.current) {
      getDatasets();
      datasetsFetchedRef.current = true;
    }

    return () => {
      // console.log('[ChartEditorPage] Unmount - clearing all state');
      clearCurrentChart();
      dispatch(clearCurrentDataset());
      dispatch(clearCurrentChartNotes());
      dispatch(clearChartEditor());
    };
  }, [clearCurrentChart, dispatch, getDatasets]);

  // ============================================================
  // EFFECT: Load chart when chartId changes (EDIT MODE)
  // ============================================================
  useEffect(() => {
    if (mode !== 'edit' || !chartIdFromUrl) return;

    // console.log('[ChartEditorPage] Chart loader effect fired', {
    //   mode,
    //   chartIdFromUrl,
    //   currentChartId: currentChart?.id,
    // });

    // Clear previous chart before loading new one
    if (currentChart?.id !== chartIdFromUrl) {
      // console.log('[ChartEditorPage] Clearing previous chart before load');
      clearCurrentChart();
    }

    (async () => {
      try {
        // console.log('[ChartEditorPage] getChartById -> start', chartIdFromUrl);
        const res = await getChartById(chartIdFromUrl);
        const ok = (res as any)?.meta?.requestStatus === 'fulfilled';
        // console.log('[ChartEditorPage] getChartById -> done', { ok, chartIdFromUrl });

        if (!ok) {
          const msg = (res as any)?.payload?.message || 'Error loading chart';
          showError(msg);
        }
      } catch (e: any) {
        const msg = e?.message || 'Error loading chart';
        showError(msg);
      }
    })();
  }, [mode, chartIdFromUrl]); // Re-run when chartId in URL changes

  // ============================================================
  // EFFECT: Initialize form fields from loaded chart (EDIT MODE)
  // ============================================================
  useEffect(() => {
    if (mode !== 'edit' || !currentChart) return;

    // console.log('[ChartEditorPage] Populating form from currentChart', {
    //   currentChartId: currentChart.id,
    //   chartIdFromUrl,
    // });
    // Only populate if this is the chart we're supposed to be editing
    if (currentChart.id === chartIdFromUrl) {
      setEditableName(currentChart.name || '');
      setEditableDescription(currentChart.description || '');
      setChartConfig(currentChart.config as MainChartConfig);
      setCurrentChartType(currentChart.type as ChartType);

      // Set datasetId from chart
      if (currentChart.datasetId && currentChart.datasetId !== datasetId) {
        // console.log('[ChartEditorPage] Setting datasetId from chart', {
        //   from: datasetId,
        //   to: currentChart.datasetId,
        // });
        setDatasetId(currentChart.datasetId);
      }

      // Update originals after populating
      updateOriginals();
    }
  }, [mode, currentChart?.id, chartIdFromUrl]); // Depend on chart ID and URL chartId

  // ============================================================
  // EFFECT: Initialize form fields in CREATE MODE
  // ============================================================
  useEffect(() => {
    if (mode !== 'create') return;

    // Check for AI-generated config from URL parameter
    const configParam = searchParams.get('config');
    if (configParam && !chartConfig) {
      try {
        // Decode base64url config
        const decodedConfig = JSON.parse(atob(configParam.replace(/-/g, '+').replace(/_/g, '/')));

        // Set chart configuration from AI
        if (decodedConfig.config) {
          setChartConfig(decodedConfig.config as MainChartConfig);
        }

        // Set chart type from AI
        if (decodedConfig.type) {
          setCurrentChartType(decodedConfig.type as ChartType);
        }

        // Set name and description from AI
        if (decodedConfig.name) {
          setEditableName(decodedConfig.name);
        }
        if (decodedConfig.config?.title) {
          setEditableDescription(`AI-generated ${decodedConfig.type} chart`);
        }

        // Set datasetId from AI config
        if (decodedConfig.datasetId && decodedConfig.datasetId !== datasetId) {
          setDatasetId(decodedConfig.datasetId);

          // Update URL to persist datasetId (remove config param to avoid re-parsing)
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set('datasetId', decodedConfig.datasetId);
          newSearchParams.delete('config'); // Remove config param after parsing
          navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
        }

        // Update originals after setting AI config
        updateOriginals();
        return; // Skip default initialization
      } catch (error) {
        console.error('[ChartEditorPage] Failed to parse AI config from URL:', error);
        // Fall through to default initialization on error
      }
    }

    // Set chart type from location state if available
    if (chartTypeFromState && chartTypeFromState !== currentChartType) {
      setCurrentChartType(chartTypeFromState);
    }

    // Initialize config only if not already set
    if (!chartConfig) {
      const initialType = chartTypeFromState || currentChartType || ChartType.Line;
      setEditableName('New Chart'.trim());
      setEditableDescription('Chart created from template');
      setChartConfig(getDefaultChartConfig(initialType));
      setCurrentChartType(initialType);
    }

    // Set datasetId from URL or location state
    const initialDatasetId = datasetIdFromUrl || locationState?.datasetId;
    if (initialDatasetId && initialDatasetId !== datasetId) {
      setDatasetId(initialDatasetId);

      // Update URL to persist datasetId
      if (!datasetIdFromUrl) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('datasetId', initialDatasetId);
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
      }
    }
  }, [mode]); // Only run when mode changes

  // Derive current datasetConfig and sortLevels from chartConfig
  const datasetConfig: DatasetConfig | undefined = (chartConfig as any)?.datasetConfig as
    | DatasetConfig
    | undefined;
  const sortLevels: SortLevel[] = useMemo(() => datasetConfig?.sort ?? [], [datasetConfig]);

  useEffect(() => {
    if (!datasetId) {
      setChartData([]);
      setIsFetchingDatasetById(false);

      // Clear dataset-dependent config when dataset is removed
      if (chartConfig) {
        // Use type casting to handle the union type (MainChartConfig)
        // treating it as a intersection of all possible configs for reset purposes
        const currentConfig = chartConfig as any;
        const resetConfig = {
          ...currentConfig,
          datasetConfig: undefined,
          axisConfigs: currentConfig.axisConfigs
            ? {
                ...currentConfig.axisConfigs,
                xAxisKey: undefined,
                yAxisKey: undefined,
                valueKey: undefined,
                seriesConfigs: [],
                cycleKey: undefined,
                periodKey: undefined,
              }
            : undefined,
          config: currentConfig.config
            ? {
                ...currentConfig.config,
                labelKey: undefined,
                valueKey: undefined,
              }
            : undefined,
        };

        setChartConfig(resetConfig as MainChartConfig);
      }
      return;
    }

    setIsFetchingDatasetById(true);
    (async () => {
      try {
        const res = await getDatasetById(datasetId);
        const ok = (res as any)?.meta?.requestStatus === 'fulfilled';

        if (!ok) {
          const msg = (res as any)?.payload?.message || 'Error loading dataset';
          showError(msg);
        }
      } catch (e: any) {
        const msg = e?.message || 'Error loading dataset';
        showError(msg);
      } finally {
        setIsFetchingDatasetById(false);
      }
    })();
  }, [datasetId, getDatasetById]);

  // ============================================================
  // EFFECT: Background prefetch notes & history once per chart (EDIT MODE)
  // ============================================================
  const notesPrefetchedRef = React.useRef<string | null>(null);
  const historyPrefetchedRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (mode !== 'edit' || !chartIdFromUrl) return;

    // Notes prefetch once
    if (notesPrefetchedRef.current !== chartIdFromUrl) {
      (async () => {
        try {
          await getChartNotes(chartIdFromUrl);
          setCurrentNotes(chartIdFromUrl);
        } catch {}
      })();
      notesPrefetchedRef.current = chartIdFromUrl;
    }

    // History prefetch once (list + count)
    if (historyPrefetchedRef.current !== chartIdFromUrl) {
      (async () => {
        try {
          await Promise.all([getChartHistory(chartIdFromUrl), getHistoryCount(chartIdFromUrl)]);
        } catch {}
      })();
      historyPrefetchedRef.current = chartIdFromUrl;
    }
  }, [mode, chartIdFromUrl, getChartNotes, setCurrentNotes, getChartHistory, getHistoryCount]);

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

  // Store original dataset (before any processing) - used for filter/sort/aggregation operations
  const originalDataset = useMemo(() => {
    return {
      headers: excelInitial.initialColumns || working?.headers,
      data: excelInitial.initialData || working?.data,
    };
  }, [excelInitial.initialColumns, excelInitial.initialData, working?.headers, working?.data]);

  // Serialize filters to ensure useMemo detects changes (React does shallow comparison)
  // Depend on datasetConfig itself to catch any nested changes
  const filtersKey = useMemo(() => JSON.stringify(datasetConfig?.filters || []), [datasetConfig]);
  const aggregationKey = useMemo(
    () => JSON.stringify(datasetConfig?.aggregation || {}),
    [datasetConfig]
  );
  const pivotKey = useMemo(() => JSON.stringify(datasetConfig?.pivot || {}), [datasetConfig]);

  // ============================================================
  // COMPUTE: Processed data (filter → sort → aggregation/pivot)
  // ============================================================
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

      console.log('[DEBUG][Filter] Original data rows:', dataToProcess?.length);
      console.log('[DEBUG][Filter] Filtered data rows:', filtered?.length);
      console.log('[DEBUG][Filter] Has filters:', !!currentFilters && currentFilters.length > 0);
      console.log('[DEBUG][Filter] Filters:', currentFilters);

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

      console.log('[DEBUG][ProcessedData] Final data rows:', finalData?.length);
      console.log('[DEBUG][ProcessedData] Final headers count:', finalHeaders?.length);
      console.log(
        '[DEBUG][ProcessedData] Final headers:',
        finalHeaders?.map(h => ({ id: (h as any).id, name: h.name, type: h.type }))
      );
      console.log('[DEBUG][ProcessedData] Has pivot:', hasPivot);
      console.log('[DEBUG][ProcessedData] Has aggregation:', !!currentAggregation);

      return { data: finalData, headers: finalHeaders };
    } catch (e) {
      console.error('[ChartEditorPage] Error processing data:', e);
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
    excelFormats.initialNumberFormat,
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
  // EFFECT: Clean up chart config when headers change (e.g., aggregation changes)
  // ============================================================
  useEffect(() => {
    console.log('[DEBUG][CleanupEffect] Running cleanup effect');
    console.log('[DEBUG][CleanupEffect] processedData.headers:', processedData.headers?.length);
    console.log('[DEBUG][CleanupEffect] processedData.data:', processedData.data?.length);
    console.log('[DEBUG][CleanupEffect] chartConfig exists:', !!chartConfig);

    if (!processedData.headers || !chartConfig) {
      console.log('[DEBUG][CleanupEffect] Skipping cleanup - missing headers or config');
      return;
    }

    // Check if pivot is active
    const hasPivot =
      datasetConfig?.pivot &&
      ((datasetConfig.pivot.rows?.length ?? 0) > 0 ||
        (datasetConfig.pivot.columns?.length ?? 0) > 0 ||
        (datasetConfig.pivot.values?.length ?? 0) > 0);

    // CRITICAL FIX: Skip cleanup when pivot is active AND data is empty
    // When pivot data is empty, applyPivot returns null and we fall back to original headers
    // But chart config still has pivot-generated IDs (pivot-row_*, col-*) that don't match original headers
    // This mismatch is temporary - once data is not empty, pivot headers will be back
    // So we should NOT cleanup in this case to preserve the pivot config
    if (hasPivot && (!processedData.data || processedData.data.length === 0)) {
      console.log(
        '[DEBUG][CleanupEffect] Skipping cleanup - pivot active but data is empty (preserving pivot config)'
      );
      return;
    }

    console.log(
      '[DEBUG][CleanupEffect] Current xAxisKey:',
      (chartConfig as any)?.axisConfigs?.xAxisKey
    );
    console.log(
      '[DEBUG][CleanupEffect] Current series count:',
      (chartConfig as any)?.axisConfigs?.seriesConfigs?.length
    );
    console.log(
      '[DEBUG][CleanupEffect] Headers IDs:',
      processedData.headers.map(h => (h as any).id || h.name)
    );

    const cleanedConfig = cleanupChartConfig(chartConfig, processedData.headers);

    if (cleanedConfig !== chartConfig) {
      console.log('[DEBUG][CleanupEffect] Config changed!');
      console.log(
        '[DEBUG][CleanupEffect] New xAxisKey:',
        (cleanedConfig as any)?.axisConfigs?.xAxisKey
      );
      console.log(
        '[DEBUG][CleanupEffect] New series count:',
        (cleanedConfig as any)?.axisConfigs?.seriesConfigs?.length
      );
      setChartConfig(cleanedConfig);
    } else {
      console.log('[DEBUG][CleanupEffect] No changes to config');
    }
  }, [
    processedData.headers,
    processedData.data,
    chartConfig,
    setChartConfig,
    datasetConfig?.pivot,
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

  // ============================================================
  // EFFECT: Browser back button prevention
  // ============================================================
  useEffect(() => {
    if (mode !== 'edit') return;

    const handlePopState = (event: PopStateEvent) => {
      if (hasChanges && mode === 'edit') {
        event.preventDefault();
        window.history.pushState(null, '', window.location.href);
        setPendingNavigation(() => () => {
          navigate(Routers.WORKSPACE_CHARTS);
        });
        setShowUnsavedModal(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    if (hasChanges && mode === 'edit') {
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasChanges, mode, navigate]);

  // ============================================================
  // EFFECT: Unsaved changes warning on page unload
  // ============================================================
  useBeforeUnload({
    hasUnsavedChanges: hasChanges && mode === 'edit',
    message: t(
      'chart_unsaved_changes_warning',
      'You have unsaved changes to your chart. Are you sure you want to leave?'
    ),
  });

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleGridDataChange = React.useCallback(
    (nextData: string[][], nextCols: DataHeader[]) => {
      dispatch(updateWorkingData({ data: nextData, headers: nextCols }));

      try {
        const headerNames = nextCols.map(h => h.name);
        const arrayData: (string | number)[][] = [headerNames, ...nextData];
        const converted = convertToChartData(arrayData);
        dispatch(setChartDataAction(converted));
      } catch {
        dispatch(setChartDataAction([]));
      }
    },
    [dispatch]
  );

  const handleCreateChart = async () => {
    if (!editableName.trim()) {
      showError(t('chart_name_required'));
      return;
    }
    if (!editableDescription.trim()) {
      showError(t('chart_description_required'));
      return;
    }
    if (!chartConfig) {
      showError(t('chart_config_required'));
      return;
    }

    // Validate datasetId
    if (!datasetId) {
      console.error('[handleCreateChart] No datasetId available', {
        datasetId,
        datasetIdFromUrl,
        locationState: locationState?.datasetId,
      });
      showError(t('chart_dataset_required'));
      return;
    }

    setCurrentModalAction('save');
    modalConfirm.openConfirm(async () => {
      try {
        // Capture chart snapshot before creating
        let imageUrl: string | undefined;
        try {
          const url = await captureAndUploadChartSnapshot('.chart-container');
          if (url) {
            imageUrl = url;
          }
        } catch (error) {
          console.warn('Failed to capture chart snapshot:', error);
          // Continue with creation even if snapshot fails
        }

        const createData: ChartRequest = {
          name: editableName.trim(),
          description: editableDescription.trim(),
          datasetId: datasetId,
          type: currentChartType ?? ChartType.Line,
          config: chartConfig as unknown as ChartRequest['config'],
          imageUrl, // Include chart snapshot
        };

        const result = await createChart(createData).unwrap();
        showSuccess(t('chart_create_success'));

        // Navigate to edit mode with new chart ID
        navigate(`${location.pathname}?chartId=${result.id}`, {
          replace: true,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        showError(t('chart_create_error'), errorMessage);
        throw error;
      }
    });
  };

  const handleUpdateChart = async () => {
    if (!chartIdFromUrl || !currentChart) return;

    setCurrentModalAction('save');
    modalConfirm.openConfirm(async () => {
      try {
        // Capture new chart snapshot for the updated version
        let newImageUrl: string | undefined;
        try {
          const url = await captureAndUploadChartSnapshot('.chart-container');
          if (url) {
            newImageUrl = url;
          }
        } catch (error) {
          console.warn('Failed to capture chart snapshot:', error);
          // Continue with update even if snapshot fails
        }

        const updateData = {
          name: editableName.trim() || currentChart.name,
          description: editableDescription.trim() || currentChart.description,
          type: currentChartType ?? ChartType.Line,
          config: chartConfig || undefined,
          datasetId: datasetId ?? undefined,
          imageUrl: newImageUrl, // Ảnh mới của chart sau khi update
        };

        const response = await updateChart(chartIdFromUrl, updateData);
        if (response.meta.requestStatus === 'fulfilled') {
          updateOriginals();
          // After successful save, the current datasetId becomes the new baseline
          originalDatasetIdRef.current = datasetId ?? null;
          setDatasetDirty(false);
          showSuccess(t('chart_update_success', 'Chart updated successfully'));
          // Reload history and count after update
          if (chartIdFromUrl) {
            await getChartHistory(chartIdFromUrl);
            await getHistoryCount(chartIdFromUrl);
          }
        } else {
          showError(t('chart_update_error', 'Failed to update chart'));
        }
      } catch (error) {
        showError(t('chart_update_error', 'Failed to update chart'));
        throw error;
      }
    });
  };

  const handleSave = async () => {
    if (mode === 'create') {
      await handleCreateChart();
    } else if (mode === 'edit') {
      handleUpdateChart();
    }
  };

  const handleDatasetSelected = async (selectedDatasetId: string) => {
    setDatasetId(selectedDatasetId);
    setShowDatasetModal(false);

    // Update URL with datasetId to persist it
    if (mode === 'create') {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('datasetId', selectedDatasetId);
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    }

    try {
      if (chartConfig) {
        // Ensure reset uses an actual chart type (state -> config -> default)
        const typeForReset =
          (currentChartType as any) || (chartConfig as any)?.chartType || ChartType.Line;
        const cfgWithType = {
          ...(chartConfig as MainChartConfig),
          chartType: typeForReset,
        } as MainChartConfig;
        const nextCfg = resetBindings(cfgWithType);

        // When changing dataset, also reset dataset-level operations (filters/sort/aggregation)
        setChartConfig({
          ...nextCfg,
          datasetConfig: undefined,
        } as MainChartConfig);
      }
      // Track dirty state relative to original dataset id
      if (originalDatasetIdRef.current === null) {
        originalDatasetIdRef.current = selectedDatasetId;
        setDatasetDirty(false);
      } else {
        setDatasetDirty(originalDatasetIdRef.current !== selectedDatasetId);
      }
      showSuccess('Dataset selected successfully');
    } catch (error) {
      showError('Failed to load selected dataset');
    }
  };

  // Track original datasetId for reset
  const originalDatasetIdRef = React.useRef<string | null>(null);
  const [datasetDirty, setDatasetDirty] = useState(false);

  const handleReset = () => {
    if (hasChanges || datasetDirty) {
      setCurrentModalAction('reset');
      modalConfirm.openConfirm(async () => {
        try {
          // Determine which datasetId to reload
          let targetDatasetId: string | undefined;
          if (datasetDirty) {
            // restore datasetId to original snapshot
            const orig = originalDatasetIdRef.current;
            if (typeof orig === 'string') {
              setDatasetId(orig);
              targetDatasetId = orig;
            }
            setDatasetDirty(false);
          } else {
            // Use current datasetId
            targetDatasetId = datasetId || currentChart?.datasetId;
          }

          // STEP 1: Fetch the dataset FIRST to reset currentDataset in store
          // This ensures excelInitial → originalDataset → processedData have correct headers
          if (targetDatasetId) {
            setIsFetchingDatasetById(true);
            try {
              await getDatasetById(targetDatasetId);
              console.log('Dataset reloaded, now resetting config...');
            } catch (error) {
              console.error('Failed to fetch original dataset:', error);
            } finally {
              setIsFetchingDatasetById(false);
            }
          }

          // STEP 2: Reset config AFTER dataset is loaded
          // Now resetToOriginal will use the fresh dataset headers
          resetToOriginal();

          showSuccess(t('chart_reset', 'Chart reset to original values'));
        } catch (error) {
          console.error('Error resetting chart:', error);
          showError(t('chart_reset_error', 'Failed to reset chart'));
        }
      });
    }
  };

  const handleBack = () => {
    if (hasChanges && mode === 'edit') {
      setPendingNavigation(() => () => {
        navigate(Routers.WORKSPACE_CHARTS);
      });
      setShowUnsavedModal(true);
    } else {
      if (mode === 'edit') {
        navigate(Routers.WORKSPACE_CHARTS);
      } else if (mode === 'create' && datasetId) {
        navigate('/chart-gallery', { state: { datasetId } });
      } else {
        navigate('/chart-gallery');
      }
    }
  };

  const handleSaveAndLeave = async () => {
    if (mode === 'edit' && chartIdFromUrl && currentChart) {
      setIsSavingBeforeLeave(true);
      try {
        const updateData = {
          name: editableName.trim() || currentChart.name,
          description: editableDescription.trim() || currentChart.description,
          type: currentChartType ?? ChartType.Line,
          config: chartConfig || undefined,
          datasetId: datasetId ?? undefined,
        };

        const response = await updateChart(chartIdFromUrl, updateData);
        if (response.meta.requestStatus === 'fulfilled') {
          updateOriginals();
          showSuccess(t('chart_update_success', 'Chart updated successfully'));
        } else {
          showError(t('chart_update_error', 'Failed to update chart'));
        }

        if (pendingNavigation) {
          pendingNavigation();
        }
      } catch (error) {
        showError(t('chart_update_error', 'Failed to update chart'));
        throw error;
      } finally {
        setIsSavingBeforeLeave(false);
      }
    }
  };

  const handleLeaveAnyway = () => {
    if (pendingNavigation) {
      pendingNavigation();
    }
  };

  const handleStay = () => {
    setPendingNavigation(null);
    setShowUnsavedModal(false);
  };

  const handleModalClose = () => {
    setCurrentModalAction(null);
    modalConfirm.close();
  };

  // Initialize dataset baseline when chart loads (first time we have a dataset id)
  useEffect(() => {
    if (mode && (currentChart || mode === 'create')) {
      if (originalDatasetIdRef.current === null && datasetId) {
        originalDatasetIdRef.current = datasetId;
        setDatasetDirty(false);
      }
    }
  }, [mode, currentChart, datasetId]);

  const handleToggleHistorySidebar = () => {
    setIsHistorySidebarOpen(v => {
      const newValue = !v;
      // Close notes sidebar if opening history sidebar
      if (newValue) {
        setIsNotesSidebarOpen(false);
      }
      return newValue;
    });
  };
  const handleToggleNotesSidebar = () => {
    setIsNotesSidebarOpen(v => {
      const newValue = !v;
      // Close history sidebar if opening notes sidebar
      if (newValue) {
        setIsHistorySidebarOpen(false);
      }
      return newValue;
    });
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (isChartLoading || (isDatasetLoading && !showDatasetModal)) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col">
      <ChartEditorHeader
        onReset={handleReset}
        onSave={handleSave}
        onBack={handleBack}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        chartId={chartIdFromUrl}
        onToggleHistorySidebar={handleToggleHistorySidebar}
        mode={mode}
        dirty={hasChanges || datasetDirty}
        onOpenDatasetModal={() => setShowDatasetModal(true)}
        currentDatasetName={currentDataset?.name}
      />

      <div className="flex-1 min-h-0 min-w-0 bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full min-h-0 min-w-0 flex"
        >
          <div
            style={{ display: activeTab === 'chart' ? 'block' : 'none' }}
            className="flex-1 min-h-0 min-w-0"
          >
            <ChartTab
              processedHeaders={processedData.headers}
              datasetId={datasetId}
              setDataId={setDatasetId}
            />
          </div>
          <div
            style={{ display: activeTab === 'data' ? 'block' : 'none' }}
            className="flex-1 min-h-0 min-w-0"
          >
            <DataTab
              initialColumns={
                processedData.headers || working?.headers || excelInitial.initialColumns
              }
              initialData={processedData.data || working?.data || excelInitial.initialData}
              originalColumns={originalDataset.headers}
              originalData={originalDataset.data}
              loading={isDatasetLoading}
              onOpenDatasetModal={() => setShowDatasetModal(true)}
              initialNumberFormat={excelFormats.initialNumberFormat}
              initialDateFormat={excelFormats.initialDateFormat}
              onDataChange={handleGridDataChange}
              datasetName={currentDataset?.name || ''}
              highlightHeaderIds={highlightHeaderIds}
              datasetConfig={datasetConfig}
              onDatasetConfigChange={(next?: DatasetConfig) =>
                handleConfigChange({ datasetConfig: next } as any)
              }
            />
          </div>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="relative z-[70]">
        <ModalConfirm
          isOpen={modalConfirm.isOpen}
          onClose={handleModalClose}
          onConfirm={modalConfirm.confirm}
          loading={modalConfirm.isLoading}
          type="warning"
          title={
            currentModalAction === 'save'
              ? t('chart_save_confirm_title')
              : currentModalAction === 'reset'
                ? t('chart_reset_confirm_title')
                : t('chart_confirm_title')
          }
          message={
            currentModalAction === 'save'
              ? mode === 'create'
                ? t('chart_create_confirm_message')
                : t('chart_save_confirm_message')
              : currentModalAction === 'reset'
                ? t('chart_reset_confirm_message')
                : t('chart_confirm_message')
          }
          confirmText={
            currentModalAction === 'save'
              ? mode === 'create'
                ? t('chart_create_save')
                : t('common_save')
              : currentModalAction === 'reset'
                ? t('common_reset')
                : t('common_confirm')
          }
          cancelText={t('common_cancel')}
        />
      </div>

      <DatasetSelectionDialog
        open={showDatasetModal}
        onOpenChange={setShowDatasetModal}
        onSelectDataset={handleDatasetSelected}
        currentDatasetId={currentDataset?.id || datasetId || ''}
      />

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onSaveAndLeave={handleSaveAndLeave}
        onLeaveAnyway={handleLeaveAnyway}
        onStay={handleStay}
        loading={isSavingBeforeLeave}
      />

      {mode === 'edit' && chartIdFromUrl && activeTab === 'chart' && (
        <ChartNoteSidebar
          chartId={chartIdFromUrl}
          isOpen={isNotesSidebarOpen}
          onToggle={handleToggleNotesSidebar}
        />
      )}

      {mode === 'edit' && chartIdFromUrl && isHistorySidebarOpen && (
        <ChartHistoryPanel
          chartId={chartIdFromUrl}
          isOpen={true}
          onToggle={handleToggleHistorySidebar}
          setDatasetId={setDatasetId}
          onRestoreSuccess={async () => {
            if (chartIdFromUrl) {
              try {
                await getChartById(chartIdFromUrl);
                showSuccess(t('chart_restore_success', 'Chart restored successfully'));
              } catch (error) {
                console.error('[ChartEditorPage] Failed to reload chart after restore:', error);
              }
            }
          }}
        />
      )}

      {/* AI Chart Evaluation - Floating Button */}
      {mode === 'edit' && chartIdFromUrl && activeTab === 'chart' && datasetId && (
        <div className="fixed bottom-6 right-6 z-50">
          <ChartAIEvaluation
            chartId={chartIdFromUrl}
            chartContainerId="chart-display-section"
            chartConfig={chartConfig}
            language={t('language_code', 'vi')}
          />
        </div>
      )}
    </div>
  );
};

export default ChartEditorPage;
