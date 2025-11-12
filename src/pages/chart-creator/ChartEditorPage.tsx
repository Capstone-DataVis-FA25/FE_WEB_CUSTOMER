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
import { useDataset } from '@/features/dataset/useDataset';
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
import DatasetSelectionDialog from '@/pages/workspace/components/DatasetSelectionDialog';
import { getDefaultChartConfig } from '@/utils/chartDefaults';
import { ChartType, type ChartRequest } from '@/features/charts';
import { clearCurrentDataset } from '@/features/dataset/datasetSlice';
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
import type { MainChartConfig } from '@/types/chart';
import ChartEditorHeader from './ChartEditorHeader';
import { resetBindings } from '@/utils/chartBindings';
import { useChartNotes } from '@/features/chartNotes/useChartNotes';
import { useChartHistory } from '@/features/chartHistory/useChartHistory';
import { captureAndUploadChartSnapshot } from '@/services/uploadService';

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
  const [gridSort, setGridSort] = useState<{ column: number; direction: 'asc' | 'desc' } | null>(
    null
  );

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
  } = useChartEditor();

  const {
    currentChart,
    loading: isChartLoading,
    getChartById,
    updateChart,
    clearCurrent: clearCurrentChart,
    createChart,
  } = useCharts();

  const { getDatasetById, currentDataset, loading: isDatasetLoading } = useDataset();
  const working = useAppSelector(selectWorkingDataset);

  // Background fetch helpers (notes & history)
  const { getChartNotes, setCurrentNotes } = useChartNotes();
  const { getChartHistory, getHistoryCount } = useChartHistory();

  // ============================================================
  // MEMOIZED VALUES
  // ============================================================
  const excelInitial = useMemo(() => {
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
  }, [currentDataset?.headers, (currentDataset as any)?.rows]);

  const excelFormats = useMemo(() => {
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
  // EFFECT: Clear everything on mount
  // ============================================================
  useEffect(() => {
    // console.log('[ChartEditorPage] Mount - clearing all state');
    clearCurrentChart();
    dispatch(clearCurrentDataset());
    dispatch(clearCurrentChartNotes());

    return () => {
      // console.log('[ChartEditorPage] Unmount - clearing all state');
      clearCurrentChart();
      dispatch(clearCurrentDataset());
      dispatch(clearCurrentChartNotes());
      dispatch(clearChartEditor());
    };
  }, []);

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

    console.log('[ChartEditorPage] Initializing create mode', {
      chartTypeFromState,
      currentChartType,
    });

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
      console.log('[ChartEditorPage] Setting initial datasetId in create mode', initialDatasetId);
      setDatasetId(initialDatasetId);
    }
  }, [mode]); // Only run when mode changes

  // ============================================================
  // EFFECT: Load dataset when datasetId changes
  // ============================================================
  useEffect(() => {
    // console.log('[ChartEditorPage] Dataset loader effect fired', { datasetId });

    if (!datasetId) {
      setChartData([]);
      return;
    }

    (async () => {
      try {
        // console.log('[ChartEditorPage] getDatasetById -> start', datasetId);
        const res = await getDatasetById(datasetId);
        const ok = (res as any)?.meta?.requestStatus === 'fulfilled';
        // console.log('[ChartEditorPage] getDatasetById -> done', { ok, datasetId });

        if (!ok) {
          const msg = (res as any)?.payload?.message || 'Error loading dataset';
          showError(msg);
        }
      } catch (e: any) {
        const msg = e?.message || 'Error loading dataset';
        showError(msg);
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

  // ============================================================
  // EFFECT: Sync chart data from working dataset
  // ============================================================
  useEffect(() => {
    if (!working?.headers || !working?.data) {
      dispatch(setChartDataAction([]));
      return;
    }

    try {
      const headerNames = working.headers.map(h => h.name);
      const sortedRows = (() => {
        if (!gridSort) return working.data;
        const { column, direction } = gridSort;
        const type = working.headers[column]?.type ?? 'text';
        const rowsCopy = [...working.data];

        rowsCopy.sort((a, b) => {
          const aVal = a[column] || '';
          const bVal = b[column] || '';
          if (!aVal && !bVal) return 0;
          if (!aVal) return direction === 'asc' ? 1 : -1;
          if (!bVal) return direction === 'asc' ? -1 : 1;

          if (type === 'number') {
            const aNum = Number.parseFloat(aVal);
            const bNum = Number.parseFloat(bVal);
            const aSafe = Number.isNaN(aNum) ? 0 : aNum;
            const bSafe = Number.isNaN(bNum) ? 0 : bNum;
            return direction === 'asc' ? aSafe - bSafe : bSafe - aSafe;
          }

          if (type === 'date') {
            const fmt = normalizeDateFormat(
              (working.headers[column] as any)?.dateFormat as string | undefined
            );
            const aParsed = fmt ? dayjs(aVal, fmt, true) : dayjs(aVal);
            const bParsed = fmt ? dayjs(bVal, fmt, true) : dayjs(bVal);
            let aT = aParsed.isValid() ? aParsed.valueOf() : NaN;
            let bT = bParsed.isValid() ? bParsed.valueOf() : NaN;
            if (Number.isNaN(aT)) aT = new Date(aVal).getTime();
            if (Number.isNaN(bT)) bT = new Date(bVal).getTime();
            const aSafe = Number.isNaN(aT) ? -Infinity : aT;
            const bSafe = Number.isNaN(bT) ? -Infinity : bT;
            return direction === 'asc' ? aSafe - bSafe : bSafe - aSafe;
          }

          const aStr = String(aVal).toLowerCase();
          const bStr = String(bVal).toLowerCase();
          return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
        });

        return rowsCopy;
      })();

      const arrayData: (string | number)[][] = [headerNames, ...sortedRows];
      const converted = convertToChartData(arrayData);
      dispatch(setChartDataAction(converted));
    } catch (e) {
      dispatch(setChartDataAction([]));
    }
  }, [working?.version, chartConfig, gridSort, dispatch]);

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
          navigate('/workspace', { state: { tab: 'charts' } });
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
    try {
      if (!editableName.trim()) {
        showError('Chart name is required');
        return;
      }
      if (!editableDescription.trim()) {
        showError('Chart description is required');
        return;
      }
      if (!chartConfig) {
        showError('Chart configuration is required');
        return;
      }

      const createData: ChartRequest = {
        name: editableName.trim(),
        description: editableDescription.trim(),
        datasetId: datasetId || '',
        type: currentChartType ?? ChartType.Line,
        config: chartConfig as unknown as ChartRequest['config'],
      };

      const result = await createChart(createData).unwrap();
      showSuccess(t('chart_create_success', 'Chart created successfully'));

      // Navigate to edit mode with new chart ID
      navigate(`${location.pathname}?chartId=${result.id}`, {
        replace: true,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(t('chart_create_error', 'Failed to create chart'), errorMessage);
    }
  };

  const handleUpdateChart = async () => {
    if (!chartIdFromUrl || !currentChart) return;

    setCurrentModalAction('save');
    modalConfirm.openConfirm(async () => {
      try {
        // Capture and upload chart snapshot before updating
        let imageUrl: string | undefined;
        try {
          const url = await captureAndUploadChartSnapshot('.chart-container');
          if (url) {
            imageUrl = url;
            console.log('Chart snapshot captured and uploaded:', imageUrl);
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
          imageUrl, // Include the captured image URL
        };

        const response = await updateChart(chartIdFromUrl, updateData);
        if (response.meta.requestStatus === 'fulfilled') {
          updateOriginals();
          // After successful save, the current datasetId becomes the new baseline
          originalDatasetIdRef.current = datasetId ?? null;
          setDatasetDirty(false);
          showSuccess(t('chart_update_success', 'Chart updated successfully'));
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

    try {
      if (chartConfig) {
        // Debug: print bindings before/after reset
        const extractBindings = (cfg: MainChartConfig | null, type: any) => {
          if (!cfg) return {} as any;
          if (type === 'line' || type === 'bar' || type === 'area' || type === 'scatter') {
            const axis = (cfg as any)?.axisConfigs;
            const series = (axis?.seriesConfigs || []).map((s: any) => s?.dataKey);
            return {
              chartType: type,
              xAxisKey: axis?.xAxisKey,
              seriesDataKeys: series,
            };
          }
          if (type === 'pie' || type === 'donut') {
            const anyCfg = cfg as any;
            return {
              chartType: type,
              labelKey: anyCfg?.config?.labelKey,
              valueKey: anyCfg?.config?.valueKey,
            };
          }
          return { chartType: type } as any;
        };

        // Ensure reset uses an actual chart type (state -> config -> default)
        const typeForReset =
          (currentChartType as any) || (chartConfig as any)?.chartType || ChartType.Line;
        const cfgWithType = {
          ...(chartConfig as MainChartConfig),
          chartType: typeForReset,
        } as MainChartConfig;
        const before = extractBindings(cfgWithType, typeForReset);
        const nextCfg = resetBindings(cfgWithType);
        const after = extractBindings(nextCfg, typeForReset);

        console.groupCollapsed('[Dataset Change] Reset bindings');
        console.log('Dataset:', {
          previousDatasetId: originalDatasetIdRef.current,
          selectedDatasetId,
        });
        console.log('Before:', before);
        console.log('Type used for reset:', typeForReset);
        console.log('After :', after);
        console.groupEnd();

        // Apply reset config without chartType property
        const { chartType, ...cfgWithoutType } = nextCfg;
        setChartConfig(cfgWithoutType as MainChartConfig);
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
          resetToOriginal();
          if (datasetDirty) {
            // restore datasetId to original snapshot
            const orig = originalDatasetIdRef.current;
            if (typeof orig === 'string') {
              setDatasetId(orig);
            }
            setDatasetDirty(false);
          }
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
        navigate('/workspace', { state: { tab: 'charts' } });
      });
      setShowUnsavedModal(true);
    } else {
      if (mode === 'edit') {
        navigate('/workspace', { state: { tab: 'charts' } });
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

  const handleToggleHistorySidebar = () => setIsHistorySidebarOpen(v => !v);
  const handleToggleNotesSidebar = () => setIsNotesSidebarOpen(!isNotesSidebarOpen);

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
            <ChartTab />
          </div>
          <div
            style={{ display: activeTab === 'data' ? 'block' : 'none' }}
            className="flex-1 min-h-0 min-w-0"
          >
            <DataTab
              initialColumns={working?.headers || excelInitial.initialColumns}
              initialData={working?.data || excelInitial.initialData}
              loading={isDatasetLoading}
              onOpenDatasetModal={() => setShowDatasetModal(true)}
              initialNumberFormat={excelFormats.initialNumberFormat}
              initialDateFormat={excelFormats.initialDateFormat}
              onDataChange={handleGridDataChange}
              onSorting={setGridSort}
              datasetName={currentDataset?.name || ''}
              highlightHeaderIds={highlightHeaderIds}
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
              ? t('chart_save_confirm_title', 'Save Changes')
              : currentModalAction === 'reset'
                ? t('chart_reset_confirm_title', 'Reset Changes')
                : t('chart_confirm_title', 'Confirm Action')
          }
          message={
            currentModalAction === 'save'
              ? t(
                  'chart_save_confirm_message',
                  'Are you sure you want to save these changes? This will update your chart configuration.'
                )
              : currentModalAction === 'reset'
                ? t(
                    'chart_reset_confirm_message',
                    'Are you sure you want to reset all changes? This will restore your chart to its original state and all unsaved changes will be lost.'
                  )
                : t('chart_confirm_message', 'Are you sure you want to continue?')
          }
          confirmText={
            currentModalAction === 'save'
              ? t('common_save', 'Save')
              : currentModalAction === 'reset'
                ? t('common_reset', 'Reset')
                : t('common_confirm', 'Confirm')
          }
          cancelText={t('common_cancel', 'Cancel')}
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

      {mode === 'edit' && chartIdFromUrl && (
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
    </div>
  );
};

export default ChartEditorPage;
