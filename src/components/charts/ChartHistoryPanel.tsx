import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, RotateCcw, GitCompare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useChartHistory } from '@/features/chartHistory';
import RestoreConfirmDialog from '@/components/charts/RestoreConfirmDialog';
import { AlertCircle } from 'lucide-react';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import VersionComparisonModal from '@/components/charts/VersionComparisonModal';
import Utils from '@/utils/Utils';
import { useChartEditor } from '@/features/chartEditor';
import { useDataset } from '@/features/dataset/useDataset';

interface ChartHistoryPanelProps {
  chartId: string | null;
  isOpen: boolean;
  setDatasetId?: (datasetId: string) => void;
  onToggle: () => void;
  onRestoreSuccess?: () => void;
}

const ChartHistoryPanel: React.FC<ChartHistoryPanelProps> = ({
  chartId,
  isOpen,
  setDatasetId,
  onToggle,
  onRestoreSuccess,
}) => {
  const { t } = useTranslation();
  const { hasChanges } = useChartEditor();
  const {
    currentChartHistories,
    loading,
    restoring,
    deleting,
    comparing,
    error,
    comparisonResult,
    getChartHistory,
    restoreFromHistory,
    deleteHistory,
    compareVersions,
    clearComparisonResult,
    // clearHistories,
  } = useChartHistory();

  const {
    setChartConfig,
    setCurrentChartType,
    setEditableName,
    setEditableDescription,
    updateOriginals,
    chartConfig,
    currentChartType,
    editableName,
    editableDescription,
  } = useChartEditor();

  const { getDatasetById, currentDataset } = useDataset();

  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [unsavedAlert, setUnsavedAlert] = useState(false);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [noDiffAlert, setNoDiffAlert] = useState(false);
  const selectedHistory = currentChartHistories.find(h => h.id === selectedHistoryId);

  useEffect(() => {
    if (selectedHistoryId && !currentChartHistories.some((h: any) => h.id === selectedHistoryId)) {
      setSelectedHistoryId(null);
    }
  }, [selectedHistoryId, currentChartHistories]);

  // Helper to flatten nested differences object to dot notation keys
  type DiffLeaf = { current: any; historical: any };
  type DiffObject = { [key: string]: DiffLeaf | DiffObject };
  type FlatDiffs = { [key: string]: DiffLeaf };

  // History is already fetched in ChartEditorPage, so we don't fetch here
  // This prevents re-fetching every time the panel opens/closes

  // Helper to flatten differences (same as VersionComparisonModal)
  const flattenDifferences = (obj: DiffObject, prefix = '') => {
    let result: FlatDiffs = {};
    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === 'object' && 'current' in value && 'historical' in value) {
        result[prefix ? `${prefix}.${key}` : key] = value as DiffLeaf;
      } else if (value && typeof value === 'object') {
        const nested = flattenDifferences(value, prefix ? `${prefix}.${key}` : key);
        result = { ...result, ...nested };
      }
    }
    return result;
  };

  // Handle Restore Click
  const handleRestoreClick = async (historyId: string) => {
    setSelectedHistoryId(historyId);
    if (!chartId) return;
    if (hasChanges) {
      setPendingRestoreId(historyId);
      setUnsavedAlert(true);
      return;
    }
    try {
      // Get current chart data
      const currentChart = {
        name: editableName,
        description: editableDescription,
        type: (currentChartType || '') as string,
        datasetId: currentDataset?.id || '',
        config: chartConfig,
        updatedAt: new Date().toISOString(),
      };
      const result = await compareVersions(historyId, currentChart).unwrap();
      const flatDiffs = flattenDifferences(result?.differences || {});
      const hasDiff = Object.keys(flatDiffs).length > 0;
      if (!hasDiff) {
        setNoDiffAlert(true);
        return;
      }
      setRestoreDialogOpen(true);
    } catch (error) {
      setNoDiffAlert(true);
    }
  };

  // Handle Restore Confirm
  const handleRestoreConfirm = async (changeNote?: string) => {
    if (!chartId || !selectedHistoryId) return;

    try {
      const result = await restoreFromHistory(chartId, {
        historyId: selectedHistoryId,
        changeNote,
      }).unwrap();

      // STEP 1: Update datasetId first (if setDatasetId is provided)
      if (setDatasetId && result.chart.datasetId) {
        setDatasetId(result.chart.datasetId);
      }

      // STEP 2: Fetch the dataset FIRST to ensure headers are loaded
      // This is critical for pivot/filter/sort to work correctly
      if (result.chart.datasetId) {
        await getDatasetById(result.chart.datasetId);
        console.log('[ChartHistoryPanel] Dataset reloaded, now updating chart config...');
      }

      // STEP 3: Update chart state AFTER dataset is loaded
      // Config includes datasetConfig with pivot, filters, sort, aggregation
      setChartConfig(result.chart.config);
      setCurrentChartType(result.chart.type);
      setEditableName(result.chart.name);
      setEditableDescription(result.chart.description);

      // Mark state as saved (no unsaved changes)
      updateOriginals();

      setRestoreDialogOpen(false);
      setSelectedHistoryId(null);

      // Refresh history list
      await getChartHistory(chartId);

      // Notify parent to reload chart data and trigger re-render
      onRestoreSuccess?.();
    } catch (error) {
      console.error('[ChartHistoryPanel] Failed to restore:', error);
    }
  };

  // Handle Compare Click
  const handleCompareClick = async (historyId: string) => {
    setSelectedHistoryId(historyId); // <-- Thêm dòng này

    if (!chartId) return;

    try {
      // Get current chart data
      const currentChart = {
        name: editableName,
        description: editableDescription,
        type: currentChartType || '',
        datasetId: currentDataset?.id || '',
        config: chartConfig,
        updatedAt: new Date().toISOString(),
      };

      await compareVersions(historyId, currentChart).unwrap();
      setCompareModalOpen(true);
    } catch (error) {
      console.error('[ChartHistoryPanel] Failed to compare:', error);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!chartId || !pendingDeleteId) return;
    try {
      await deleteHistory(chartId, pendingDeleteId).unwrap();
      setDeleteConfirmOpen(false);
      setPendingDeleteId(null);
    } catch (error) {
      console.error('[ChartHistoryPanel] Failed to delete:', error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-96 bg-white dark:bg-gray-800 shadow-2xl z-[65] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {t('chartHistory.title', 'Version History')}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Error display */}
            {error && (
              <div className="m-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('chartHistory.loading', 'Loading history...')}
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && currentChartHistories.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-4">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('chartHistory.empty', 'No version history available')}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    {t('chartHistory.emptyHint', 'Changes will be saved automatically')}
                  </p>
                </div>
              </div>
            )}

            {/* History list */}
            {!loading && currentChartHistories.length > 0 && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentChartHistories.map((history, index) => (
                  <motion.div
                    key={history.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {Utils.getDate(history.createdAt, 4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {history.changeNote && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 italic">
                        "{history.changeNote}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompareClick(history.id)}
                        disabled={comparing}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        {t('chartHistory.compare', 'Compare')}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreClick(history.id)}
                        disabled={restoring}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t('chartHistory.restore', 'Restore')}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer info */}
            {currentChartHistories.length > 0 && (
              <div className="p-4 border-t dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {t(
                    'chartHistory.totalVersions',
                    `${currentChartHistories.length} version(s) available latest`
                  )}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
      {/* No Difference Alert */}
      {noDiffAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 flex flex-col items-center max-w-md">
            <AlertCircle className="w-12 h-12 text-blue-500 mb-3" />
            <div className="text-lg font-semibold mb-2 text-center">
              {t('chartHistory.noDiffTitle', 'No Changes Detected')}
            </div>
            <div className="text-gray-600 dark:text-gray-300 mb-4 text-center">
              {t(
                'chartHistory.noDiffMessage',
                'There are no differences between the current chart and this version. Restore is not possible.'
              )}
            </div>
            <Button onClick={() => setNoDiffAlert(false)}>{t('ok', 'OK')}</Button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      <VersionComparisonModal
        open={compareModalOpen}
        onOpenChange={(open: boolean) => {
          setCompareModalOpen(open);
          if (!open) clearComparisonResult();
        }}
        comparisonResult={comparisonResult}
        isLoading={comparing}
        selectedHistory={selectedHistory}
        chartId={chartId || undefined}
      />
      {/* Delete Confirmation Modal */}
      <ModalConfirm
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t('chartHistory.confirmDeleteTitle', 'Delete Version')}
        message={t('chartHistory.confirmDelete', 'Are you sure you want to delete this version?')}
        confirmText={t('delete', 'Delete')}
        cancelText={t('cancel', 'Cancel')}
        type="danger"
        loading={deleting}
      />

      <ModalConfirm
        isOpen={unsavedAlert}
        onClose={() => {
          setUnsavedAlert(false);
          setPendingRestoreId(null);
        }}
        onConfirm={async () => {
          setUnsavedAlert(false);
          if (pendingRestoreId && chartId) {
            try {
              // Get current chart data
              const currentChart = {
                name: editableName,
                description: editableDescription,
                type: currentChartType || '',
                datasetId: currentDataset?.id || '',
                config: chartConfig,
                updatedAt: new Date().toISOString(),
              };

              const result = await compareVersions(pendingRestoreId, currentChart).unwrap();
              const flatDiffs = flattenDifferences(result?.differences || {});
              const hasDiff = Object.keys(flatDiffs).length > 0;
              if (!hasDiff) {
                setNoDiffAlert(true);
                setPendingRestoreId(null);
                return;
              }
              setRestoreDialogOpen(true);
              setSelectedHistoryId(pendingRestoreId);
            } catch (error) {
              setNoDiffAlert(true);
            }
          }
          setPendingRestoreId(null);
        }}
        title={t('chartHistory.unsavedChangesTitle', 'You have unsaved changes')}
        message={t(
          'chartHistory.unsavedChangesMessage',
          'You are currently editing this chart. If you restore a previous version, all unsaved changes will be lost. Please save your work before restoring, or continue to restore and discard changes.'
        )}
        confirmText={t('chartHistory.restoreAnyway', 'Restore Anyway')}
        cancelText={t('cancel', 'Cancel')}
        type="warning"
      />
    </>
  );
};

export default ChartHistoryPanel;
