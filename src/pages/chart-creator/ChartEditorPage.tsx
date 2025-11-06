import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import ChartHistoryPanel from '@/components/charts/ChartHistoryPanel';

// UnifiedChartEditor is used inside ChartTab
import ChartTab from './ChartTab';
import DataTab from './DataTab';
import type { DataHeader } from '@/utils/dataProcessors';
import type { NumberFormat, DateFormat } from '@/contexts/DatasetContext';
import { useDataset } from '@/features/dataset/useDataset';
import { convertToChartData } from '@/utils/dataConverter';
import { useCharts } from '@/features/charts/useCharts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
// Chart data types are now handled in contexts
import { useToast } from '@/hooks/useToast';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import UnsavedChangesModal from '@/components/ui/UnsavedChangesModal';
import ToastContainer from '@/components/ui/toast-container';
import ChartNoteSidebar from '@/components/charts/ChartNoteSidebar';
import DatasetSelectionDialog from '@/pages/workspace/components/DatasetSelectionDialog';
import { getDefaultChartConfig } from '@/utils/chartDefaults';
// MainChartConfig now handled by contexts
import type { ChartRequest, ChartType } from '@/features/charts';
// ChartType is imported in ChartEditorWithProviders
import { clearCurrentDataset } from '@/features/dataset/datasetSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setWorkingDataset,
  updateWorkingData,
  setChartData as setChartDataAction,
} from '@/features/chartEditor/chartEditorSlice';
import { selectWorkingDataset } from '@/features/chartEditor/chartEditorSelectors';
import { clearCurrentChartNotes } from '@/features/chartNotes/chartNoteSlice';
import { useChartEditor } from '@/features/chartEditor';
import type { MainChartConfig } from '@/types/chart';
import ChartEditorHeader from './ChartEditorHeader';
import { resetBindings } from '@/utils/chartBindings';

const ChartEditorPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const { getDatasetById, currentDataset, loading: isDatasetLoading } = useDataset();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const modalConfirm = useModalConfirm();
  const dispatch = useAppDispatch();
  const [currentModalAction, setCurrentModalAction] = useState<'save' | 'reset' | null>(null);
  // Chart history sidebar state
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const handleToggleHistorySidebar = () => setIsHistorySidebarOpen(v => !v);
  // Unsaved changes modal state
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false);

  // Chart editor context (now includes validation)
  const {
    mode,
    chartId,
    datasetId: contextDatasetId,
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

  // Helper to set originals from external data (for future use)
  // const setOriginalValues = useSetChartEditorOriginals();
  // const [dataset, setDataset] = useState<Dataset | undefined>(undefined);
  const {
    currentChart,
    loading: isChartLoading,
    getChartById,
    updateChart,
    clearCurrent: clearCurrentChart,
    createChart,
  } = useCharts();

  // Chart notes sidebar state
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);
  // Use datasetId from context, with local state for selection changes
  const [datasetId, setDatasetId] = useState<string>(contextDatasetId || '');

  // Handle notes sidebar
  const handleToggleNotesSidebar = () => {
    setIsNotesSidebarOpen(!isNotesSidebarOpen);
  };

  // State for dataset selection modal
  const [showDatasetModal, setShowDatasetModal] = useState(false);

  const [activeTab, setActiveTab] = useState<'chart' | 'data'>('chart');
  // Receive current grid sort from CustomExcel via DataTab
  const [gridSort, setGridSort] = useState<{ column: number; direction: 'asc' | 'desc' } | null>(
    null
  );

  const excelInitial = React.useMemo(() => {
    const headers: any[] = (currentDataset?.headers as any[]) || [];
    let initialColumns: DataHeader[] | undefined;
    let initialData: string[][] | undefined;

    if (headers.length) {
      initialColumns = headers.map((h, idx) => ({
        id: (h as any).id,
        name: h.name ?? `Column ${idx + 1}`,
        type: (h.type as 'text' | 'number' | 'date') ?? 'text',
        index: idx,
        width: h.width ?? 200,
      }));

      const maxLen = Math.max(0, ...headers.map(h => (Array.isArray(h.data) ? h.data.length : 0)));
      initialData = Array.from({ length: Math.max(maxLen, 0) }).map((_, r) =>
        headers.map(h => String((h.data && h.data[r]) ?? ''))
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

  const excelFormats = React.useMemo(() => {
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

  // Working dataset from Redux (preferred source for editor)
  const working = useAppSelector(selectWorkingDataset);

  // Derive used header IDs from chart config
  const { highlightHeaderIds } = React.useMemo(() => {
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
    const ax = (chartConfig as any)?.axisConfigs;
    const ser = Array.isArray(ax?.seriesConfigs) ? ax.seriesConfigs : [];
    console.log('[HighlightDebug] axis/series inspection', {
      xAxisKey: ax?.xAxisKey,
      xAxisKeyMapped:
        typeof ax?.xAxisKey === 'string'
          ? nameToId.get(String(ax.xAxisKey).trim().toLowerCase()) ||
            (idSet.has(String(ax.xAxisKey).trim()) ? String(ax.xAxisKey).trim() : null)
          : null,
      seriesConfigs: ser.map((s: any) => ({
        dataColumn: s?.dataColumn,
        mapped:
          typeof s?.dataColumn === 'string'
            ? nameToId.get(String(s.dataColumn).trim().toLowerCase()) ||
              (idSet.has(String(s.dataColumn).trim()) ? String(s.dataColumn).trim() : null)
            : null,
        headerId: s?.headerId ?? null,
      })),
    });
    console.log('[HighlightDebug] derived ids from chartConfig', {
      count: out.length,
      ids: out,
      rawIds: outAll,
      nameMapSize: nameToId.size,
      idSetSize: idSet.size,
      datasetHeaders: headersFromDataset.map(h => ({ id: h?.id ?? h?.headerId, name: h?.name })),
      workingHeaders: headersFromWorking.map(h => ({ id: h?.id ?? h?.headerId, name: h?.name })),
      initialHeaders: (headersFromInitial as any[]).map(h => ({
        id: h?.id ?? h?.headerId,
        name: h?.name,
      })),
    });
    return { highlightHeaderIds: out };
  }, [chartConfig, currentDataset?.headers, working?.headers, excelInitial.initialColumns]);

  // Initialize workingDataset after dataset changes (do not reset on config changes)
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
    // Chart data will be derived by the working-dataset sync effect
  }, [
    excelInitial.initialColumns,
    excelInitial.initialData,
    excelFormats.initialNumberFormat,
    excelFormats.initialDateFormat,
    dispatch,
  ]);

  //Run once on mount
  // useEffect #1: Clear current chart, dataset, notes on mount
  useEffect(() => {
    // console.log(
    //   'useEffect #1: mount - clearCurrentChart, clearCurrentDataset, clearCurrentChartNotes'
    // );
    clearCurrentChart();
    clearCurrentDataset();
    clearCurrentChartNotes();
  }, []);

  // ============================================================
  // EFFECT 1: Sync datasetId with context (simple sync)
  // ============================================================
  // useEffect #2: Sync datasetId with context
  useEffect(() => {
    // console.log('useEffect #2: contextDatasetId changed', contextDatasetId);
    setDatasetId(contextDatasetId || '');
  }, [contextDatasetId]);

  // ============================================================
  // EFFECT 2: Load chart in edit mode (independent)
  // ============================================================
  // useEffect #3: Load chart in edit mode
  useEffect(() => {
    // console.log('useEffect #3: mode or chartId changed', {
    //   mode,
    //   chartId,
    //   isChartLoading,
    //   currentChart,
    // });
    if (mode === 'edit' && chartId && !isChartLoading && !currentChart) {
      (async () => {
        try {
          const res = await getChartById(chartId);
          const ok = (res as any)?.meta?.requestStatus === 'fulfilled';
          if (!ok) {
            const msg = (res as any)?.payload?.message || 'Error loading chart';
            showError(msg);
          }
        } catch (e: any) {
          const msg = e?.message || 'Error loading chart';
          showError(msg);
        }
      })();
    }
  }, [mode, chartId]);

  // ============================================================
  // EFFECT 3: Initialize form fields when chart loads (edit mode)
  // ============================================================
  // useEffect #4: Initialize form fields when chart loads (edit mode)
  useEffect(() => {
    // console.log('useEffect #4: mode or currentChart?.id changed', { mode, currentChart });
    if (mode === 'edit' && currentChart) {
      setEditableName(currentChart.name || '');
      setEditableDescription(currentChart.description || '');
      setChartConfig(currentChart.config as MainChartConfig);
      setCurrentChartType(currentChart.type as ChartType);
      // Set datasetId from chart so effect 5 can fetch it
      if (currentChart.datasetId && currentChart.datasetId !== datasetId) {
        setDatasetId(currentChart.datasetId);
      }
      // Set originals right after populating
      updateOriginals();
    }
  }, [mode, currentChart?.id]); // Only depend on chart ID change, not chart object

  // ============================================================
  // EFFECT 4: Initialize form fields in create mode (independent)
  // ============================================================
  // useEffect #5: Initialize form fields in create mode
  useEffect(() => {
    // console.log('useEffect #5: mode or currentChartType changed', { mode, currentChartType });
    if (mode === 'create') {
      // Only initialize if not already set
      if (!chartConfig) {
        setEditableName('New Chart'.trim());
        setEditableDescription('Chart created from template');
        setChartConfig(getDefaultChartConfig(currentChartType));
      }
    }
  }, [mode, currentChartType]); // Only on mode or chart type change

  // ============================================================
  // EFFECT 5: Load dataset based on datasetId (independent)
  // ============================================================
  // useEffect #6: Load dataset based on datasetId
  useEffect(() => {
    // console.log('useEffect #6: datasetId changed', datasetId);
    if (!datasetId) {
      setChartData([]);
      return;
    }
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
      }
    })();
  }, [datasetId, getDatasetById]);

  // working already declared above for initialization guard

  // Keep chartData in sync when working dataset, config or grid sort changes
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
            const fmt = (working.headers[column] as any)?.dateFormat as string | undefined;
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
      console.log('[ChartEditorPage] Working convertToChartData ->', { arrayData, converted });
      dispatch(setChartDataAction(converted));
    } catch (e) {
      dispatch(setChartDataAction([]));
    }
  }, [working?.version, chartConfig, gridSort, dispatch]);

  // Handle live grid edits from DataTab/CustomExcel
  const handleGridDataChange = React.useCallback(
    (nextData: string[][], nextCols: DataHeader[]) => {
      // Update working dataset in Redux
      dispatch(updateWorkingData({ data: nextData, headers: nextCols }));
      // Recompute chart data from array format
      try {
        const headerNames = nextCols.map(h => h.name);
        const arrayData: (string | number)[][] = [headerNames, ...nextData];
        const converted = convertToChartData(arrayData);
        console.log('[ChartEditorPage] Grid change convertToChartData ->', {
          arrayData,
          converted,
        });
        dispatch(setChartDataAction(converted));
      } catch {
        dispatch(setChartDataAction([]));
      }
    },
    [dispatch]
  );

  // Thông báo rằng là chart chưa lưu -> người dùng lưu hoặc cancel (reload/close tab)
  useBeforeUnload({
    hasUnsavedChanges: hasChanges && mode === 'edit',
    message: t(
      'chart_unsaved_changes_warning',
      'You have unsaved changes to your chart. Are you sure you want to leave?'
    ),
  });

  // Chặn back trên trình duyệt khi đang chỉnh sửa (edit mode) và hiện modal xác nhận
  useEffect(() => {
    if (mode !== 'edit') return;
    const handlePopState = (event: PopStateEvent) => {
      if (hasChanges && mode === 'edit') {
        event.preventDefault();
        window.history.pushState(null, '', window.location.href);
        setPendingNavigation(() => () => {
          clearCurrentChart();
          navigate('/workspace', { state: { tab: 'charts' } });
        });
        setShowUnsavedModal(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    // Push dummy state to prevent immediate back
    if (hasChanges && mode === 'edit') {
      window.history.pushState(null, '', window.location.href);
    }
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasChanges, mode, navigate, clearCurrentChart]);

  // Handle create new chart
  const handleCreateChart = async () => {
    try {
      // Validate required fields
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
        datasetId: datasetId || '', // Use empty string instead of null for optional field
        type: currentChartType,
        config: chartConfig as unknown as ChartRequest['config'],
      };

      const result = await createChart(createData).unwrap();

      showSuccess(t('chart_create_success', 'Chart created successfully'));

      // Navigate to edit mode with only the chartId
      // The datasetId is stored in the chart and will be loaded automatically
      navigate(`${location.pathname}?chartId=${result.id}`, {
        replace: true,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(t('chart_create_error', 'Failed to create chart'), errorMessage);
    }
  };

  // Handle update existing chart
  const handleUpdateChart = () => {
    if (!chartId || !currentChart) return;

    setCurrentModalAction('save');
    modalConfirm.openConfirm(async () => {
      try {
        const updateData = {
          name: editableName.trim() || currentChart.name,
          description: editableDescription.trim() || currentChart.description,
          type: currentChartType ?? 'line',
          config: chartConfig || undefined,
        };

        const response = await updateChart(chartId, updateData);
        if (response.meta.requestStatus === 'fulfilled') {
          // Update original values after successful save using context
          updateOriginals();
          showSuccess(t('chart_update_success', 'Chart updated successfully'));
        } else {
          showError(t('chart_update_error', 'Failed to update chart'));
        }
      } catch (error) {
        showError(t('chart_update_error', 'Failed to update chart'));
        throw error; // Re-throw to let modal handle loading state
      }
    });
  };

  // Handle save/create chart - main dispatcher
  const handleSave = async () => {
    if (mode === 'create') {
      await handleCreateChart();
    } else if (mode === 'edit') {
      handleUpdateChart();
    }
  };

  // Handle dataset selection from modal
  const handleDatasetSelected = async (datasetId: string) => {
    // Set datasetID
    setDatasetId(datasetId);
    setShowDatasetModal(false);
    try {
      // Reset data-bound fields based on current chart type
      if (chartConfig) {
        setChartConfig(resetBindings(chartConfig as MainChartConfig));
      }
      showSuccess('Dataset selected successfully');
    } catch (error) {
      showError('Failed to load selected dataset');
    }
  };

  // Reset lại giá trị của chart config
  const handleReset = () => {
    if (hasChanges) {
      setCurrentModalAction('reset');
      modalConfirm.openConfirm(async () => {
        try {
          // Reset all values to original using context
          resetToOriginal();
          showSuccess(t('chart_reset', 'Chart reset to original values'));
        } catch (error) {
          console.error('Error resetting chart:', error);
          showError(t('chart_reset_error', 'Failed to reset chart'));
        }
      });
    }
  };

  // Handle back navigation with cleanup
  const handleBack = () => {
    // Check if there are unsaved changes in edit mode
    if (hasChanges && mode === 'edit') {
      // Show unsaved changes modal
      setPendingNavigation(() => () => {
        clearCurrentChart();
        // Edit mode: navigate back to workspace with charts tab
        navigate('/workspace', { state: { tab: 'charts' } });
      });
      setShowUnsavedModal(true);
    } else {
      // No changes, navigate directly based on mode and datasetId
      clearCurrentChart();

      if (mode === 'edit') {
        // Edit mode: navigate back to workspace with charts tab
        navigate('/workspace', { state: { tab: 'charts' } });
      } else if (mode === 'create' && datasetId) {
        // Create mode with datasetId: navigate back to chart gallery with that dataset
        navigate('/chart-gallery', { state: { datasetId } });
      } else {
        // Create mode without datasetId: navigate back to workspace (default datasets tab)
        navigate('/chart-gallery');
      }
    }
  };

  // Handle unsaved changes modal actions
  // TODO: Tối ưu sau
  const handleSaveAndLeave = async () => {
    if (mode === 'edit' && chartId && currentChart) {
      setIsSavingBeforeLeave(true);
      try {
        const updateData = {
          name: editableName.trim() || currentChart.name,
          description: editableDescription.trim() || currentChart.description,
          type: currentChartType ?? 'line',
          config: chartConfig || undefined,
        };

        const response = await updateChart(chartId, updateData);
        if (response.meta.requestStatus === 'fulfilled') {
          // Update original values after successful save using context
          updateOriginals();
          showSuccess(t('chart_update_success', 'Chart updated successfully'));
        } else {
          showError(t('chart_update_error', 'Failed to update chart'));
        }
        // Execute pending navigation
        if (pendingNavigation) {
          pendingNavigation();
        }
      } catch (error) {
        showError(t('chart_update_error', 'Failed to update chart'));
        throw error; // Re-throw to keep modal open
      } finally {
        setIsSavingBeforeLeave(false);
      }
    }
  };

  const handleLeaveAnyway = () => {
    // Execute pending navigation without saving
    if (pendingNavigation) {
      pendingNavigation();
    }
  };

  const handleStay = () => {
    // Clear pending navigation and close modal
    setPendingNavigation(null);
    setShowUnsavedModal(false);
  };

  // Handle modal close with action cleanup
  const handleModalClose = () => {
    setCurrentModalAction(null);
    modalConfirm.close();
  };

  // Clear Redux entities on unmount
  useEffect(() => {
    return () => {
      clearCurrentChart();
      clearCurrentDataset();
      clearCurrentChartNotes();
    };
  }, []);

  // Loading state
  // Show full-page loading only when chart is loading, or when dataset is loading
  // AND the dataset selection dialog is not open. This prevents the dialog's
  // internal fetch from blocking the entire page.
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
      {/* Header Section */}
      <ChartEditorHeader
        onReset={handleReset}
        onSave={handleSave}
        onBack={handleBack}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        chartId={chartId}
        onToggleHistorySidebar={handleToggleHistorySidebar}
      />

      {/* Main Content - Full Width Chart Area */}
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
      {/* Confirmation Modal */}
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

      {/* Dataset Selection Modal */}
      <DatasetSelectionDialog
        open={showDatasetModal}
        onOpenChange={setShowDatasetModal}
        onSelectDataset={handleDatasetSelected}
        currentDatasetId={currentDataset?.id || datasetId || ''}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onSaveAndLeave={handleSaveAndLeave}
        onLeaveAnyway={handleLeaveAnyway}
        onStay={handleStay}
        loading={isSavingBeforeLeave}
      />

      {/* Chart Notes Sidebar - Only show in edit mode when chartId exists */}
      {mode === 'edit' && chartId && (
        <ChartNoteSidebar
          chartId={chartId}
          isOpen={isNotesSidebarOpen}
          onToggle={handleToggleNotesSidebar}
        />
      )}

      {/* Chart History Sidebar */}
      {mode === 'edit' && chartId && isHistorySidebarOpen && (
        <ChartHistoryPanel
          chartId={chartId}
          isOpen={true}
          onToggle={handleToggleHistorySidebar}
          onRestoreSuccess={async () => {
            // Reload chart data after restore (name, description, type, config all updated)
            if (chartId) {
              try {
                await getChartById(chartId);
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
