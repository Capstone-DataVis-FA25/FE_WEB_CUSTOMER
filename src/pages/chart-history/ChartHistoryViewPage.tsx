import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCcw, Eye, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import ChartTab from '../chart-creator/ChartTab';
import type { DataHeader } from '@/utils/dataProcessors';
import { useDataset } from '@/features/dataset/useDataset';
import { convertToChartData } from '@/utils/dataConverter';
import { useCharts } from '@/features/charts/useCharts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/toast-container';
import { useAppDispatch } from '@/store/hooks';
import { setChartData as setChartDataAction } from '@/features/chartEditor/chartEditorSlice';
import { useChartEditor } from '@/features/chartEditor';
import { useChartHistory } from '@/features/chartHistory/useChartHistory';
import Utils from '@/utils/Utils';
import Routers from '@/router/routers';
import RestoreConfirmDialog from '@/components/charts/RestoreConfirmDialog';

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

  // ============================================================
  // HOOKS
  // ============================================================
  const {
    setChartData,
    setChartConfig,
    setCurrentChartType,
    setEditableName,
    setEditableDescription,
  } = useChartEditor();

  const { getDatasetById, currentDataset, loading: isDatasetLoading } = useDataset();
  const { getChartById } = useCharts();

  const { selectedHistory, restoring, getHistoryById, restoreFromHistory, getChartHistory } =
    useChartHistory();

  // ============================================================
  // LOAD HISTORY DATA
  // ============================================================
  useEffect(() => {
    if (!historyId) {
      showError(t('chartHistory.noHistoryId', 'No history ID provided'));
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
          showError(t('chartHistory.loadFailed', 'Failed to load history version'));
        }
      } catch (e: any) {
        const msg = e?.message || 'Error loading history version';
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

  const processedHeaders = useMemo(() => {
    const { initialColumns } = excelInitial;
    if (!initialColumns) return undefined;
    return initialColumns.map(col => ({ ...col }));
  }, [excelInitial]);

  // ============================================================
  // CONVERT TO CHART DATA
  // ============================================================
  useEffect(() => {
    const { initialColumns, initialData } = excelInitial;
    if (!initialColumns || !initialData) {
      dispatch(setChartDataAction([]));
      return;
    }

    try {
      const headerNames = initialColumns.map(h => h.name);
      const arrayData: (string | number)[][] = [headerNames, ...initialData];
      const converted = convertToChartData(arrayData);
      setChartData(converted);
    } catch (err) {
      console.error('[ChartHistoryViewPage] Error converting data:', err);
      dispatch(setChartDataAction([]));
    }
  }, [excelInitial, dispatch, setChartData]);

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
      showSuccess(t('chartHistory.restoreSuccess', 'Chart restored successfully'));

      // Refresh and navigate back to editor
      await getChartById(chartId);
      await getChartHistory(chartId);
      navigate(`${Routers.CHART_EDITOR}?chartId=${chartId}`);
    } catch (error) {
      console.error('[ChartHistoryViewPage] Failed to restore:', error);
      showError(t('chartHistory.restoreFailed', 'Failed to restore chart'));
    }
  };

  const handleBack = () => {
    if (chartId) {
      navigate(`${Routers.CHART_EDITOR}?chartId=${chartId}`);
    } else {
      navigate(Routers.WORKSPACE_CHARTS);
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (!selectedHistory || isDatasetLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <LoadingSpinner
          title="Loading chart history..."
          subtitle="Please wait while we load the historical version"
        />
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0"
      >
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('back', 'Back')}
              </Button>

              <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedHistory.name || t('chartHistory.viewTitle', 'Chart History View')}
                  </h1>
                  <Badge variant="secondary" className="text-xs">
                    {t('viewOnly', 'View Only')}
                  </Badge>
                </div>
                {selectedHistory.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedHistory.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right Section - Restore Button */}
            <div className="flex items-center gap-4">
              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                {selectedHistory.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">{t('created', 'Created')}:</span>
                    <span>{Utils.getDate(selectedHistory.createdAt, 18)}</span>
                  </div>
                )}
                {selectedHistory.updatedBy && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">{t('updatedBy', 'By')}:</span>
                    <span>{selectedHistory.updatedBy}</span>
                  </div>
                )}
              </div>

              <Button
                size="sm"
                onClick={handleRestoreClick}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                {restoring ? t('restoring', 'Restoring...') : t('restore', 'Restore')}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart Preview */}
      <div className="flex-1 min-h-0 bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          <ChartTab
            processedHeaders={processedHeaders}
            setDataId={() => {}} // No-op in view mode
            datasetId={selectedHistory.datasetId}
          />
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
