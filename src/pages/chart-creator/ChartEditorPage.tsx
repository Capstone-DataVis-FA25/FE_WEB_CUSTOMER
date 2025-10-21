import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import UnifiedChartEditor from '@/components/charts/UnifiedChartEditor';
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
import { useChartNotes, updateNoteLocally } from '@/features/chartNotes';
import { useAppDispatch } from '@/store/hooks';
import DatasetSelectionDialog from '@/pages/workspace/components/DatasetSelectionDialog';
import { getDefaultChartConfig } from '@/utils/chartDefaults';
// MainChartConfig now handled by contexts
import type { ChartRequest, ChartType } from '@/features/charts';
// ChartType is imported in ChartEditorWithProviders
import { clearCurrentDataset } from '@/features/dataset/datasetSlice';
import { clearCurrentChartNotes } from '@/features/chartNotes/chartNoteSlice';
import { useChartEditor } from '@/features/chartEditor';
import type { MainChartConfig } from '@/types/chart';
import ChartEditorHeader from './ChartEditorHeader';

const ChartEditorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { getDatasetById, currentDataset, loading: isDatasetLoading } = useDataset();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const modalConfirm = useModalConfirm();

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
  const [currentModalAction, setCurrentModalAction] = useState<'save' | 'reset' | null>(null);
  const {
    currentChart,
    loading: isChartLoading,
    getChartById,
    updateChart,
    clearCurrent: clearCurrentChart,
    createChart,
  } = useCharts();

  // Chart notes management with Redux
  const {
    currentChartNotes,
    creating: creatingNote,
    updating: updatingNote,
    deleting: deletingNote,
    createNote,
    updateNote,
    deleteNote,
    getChartNotes,
  } = useChartNotes();

  // Chart notes sidebar state
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);

  // Unsaved changes modal state
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false);

  // Use datasetId from context, with local state for selection changes
  const [datasetId, setDatasetId] = useState<string>(contextDatasetId || '');

  // State for dataset selection modal
  const [showDatasetModal, setShowDatasetModal] = useState(false);

  //Run once on mount
  // useEffect #1: Clear current chart, dataset, notes on mount
  useEffect(() => {
    console.log(
      'useEffect #1: mount - clearCurrentChart, clearCurrentDataset, clearCurrentChartNotes'
    );
    clearCurrentChart();
    clearCurrentDataset();
    clearCurrentChartNotes();
  }, []);

  // ============================================================
  // EFFECT 1: Sync datasetId with context (simple sync)
  // ============================================================
  // useEffect #2: Sync datasetId with context
  useEffect(() => {
    console.log('useEffect #2: contextDatasetId changed', contextDatasetId);
    setDatasetId(contextDatasetId || '');
  }, [contextDatasetId]);

  // ============================================================
  // EFFECT 2: Load chart in edit mode (independent)
  // ============================================================
  // useEffect #3: Load chart in edit mode
  useEffect(() => {
    console.log('useEffect #3: mode or chartId changed', {
      mode,
      chartId,
      isChartLoading,
      currentChart,
    });
    if (mode === 'edit' && chartId && !isChartLoading && !currentChart) {
      console.log('useEffect #3: getChartById', chartId);
      getChartById(chartId);
    }
  }, [mode, chartId]);

  // ============================================================
  // EFFECT 3: Initialize form fields when chart loads (edit mode)
  // ============================================================
  // useEffect #4: Initialize form fields when chart loads (edit mode)
  useEffect(() => {
    console.log('useEffect #4: mode or currentChart?.id changed', { mode, currentChart });
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
    console.log('useEffect #5: mode or currentChartType changed', { mode, currentChartType });
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
    console.log('useEffect #6: datasetId changed', datasetId);
    if (!datasetId) {
      setChartData([]);
      return;
    }

    getDatasetById(datasetId);
  }, [datasetId, getDatasetById]); // Depend on getDatasetById too

  // ============================================================
  // EFFECT 6: Convert dataset to chart data (independent)
  // ============================================================
  useEffect(() => {
    if (!currentDataset?.headers?.length) {
      setChartData([]);
      return;
    }

    try {
      const validHeaders = currentDataset.headers.map((h: any) => ({
        id: h.id || '',
        datasetId: h.datasetId || '',
        name: h.name,
        type: h.type,
        index: h.index,
        data: h.data as (string | number)[],
      }));

      let convertedData = convertToChartData(validHeaders);

      if (!convertedData.length && Array.isArray((currentDataset as any).rows)) {
        const headerNames = currentDataset.headers.map((h: any) => h.name);
        const arrayFormat = [headerNames, ...(currentDataset as any).rows];
        convertedData = convertToChartData(arrayFormat);
      }

      setChartData(convertedData);
    } catch (error) {
      console.error('⚠️ [Dataset] Error processing dataset:', error);
      setChartData([]);
    }
  }, [currentDataset]); // Only depend on currentDataset

  // Thông báo rằng là chart chưa lưu -> người dùng lưu hoặc cancel
  useBeforeUnload({
    hasUnsavedChanges: hasChanges && mode === 'edit',
    message: t(
      'chart_unsaved_changes_warning',
      'You have unsaved changes to your chart. Are you sure you want to leave?'
    ),
  });

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

  // Handle notes sidebar
  const handleToggleNotesSidebar = () => {
    const newState = !isNotesSidebarOpen;
    setIsNotesSidebarOpen(newState);

    // Load notes when opening sidebar
    if (newState && chartId) {
      console.log('[ChartEditor] Sidebar opened, loading notes for chart:', chartId);
      getChartNotes(chartId).then(result => {
        if (result.meta.requestStatus === 'fulfilled') {
          console.log('[ChartEditor] Notes loaded successfully:', result.payload);
        } else {
          console.error('[ChartEditor] Failed to load notes:', result);
        }
      });
    }
  };

  const handleAddNote = async (content: string) => {
    if (!chartId) {
      console.warn('[ChartEditor] Cannot create note: chartId is missing');
      showError(t('chartEditor.notes.noChartId', 'Please save the chart first'));
      return;
    }

    console.log('[ChartEditor] Creating note:', { chartId, content });

    try {
      const result = await createNote({ chartId, content });
      console.log('result createNote: ', result);

      if (result.meta.requestStatus === 'fulfilled') {
        // Refresh notes list after creating
        await getChartNotes(chartId);
      } else {
        console.error('[ChartEditor] Failed to create note:', result);
        showError(t('chartEditor.notes.createError', 'Failed to add note'));
      }
    } catch (error) {
      console.error('[ChartEditor] Error creating note:', error);
      showError(t('chartEditor.notes.createError', 'Failed to add note'));
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!chartId) return;

    console.log('[ChartEditor] Deleting note:', { chartId, noteId });

    try {
      const result = await deleteNote(chartId, noteId);

      if (result.meta.requestStatus === 'fulfilled') {
        // Refresh notes list after deleting
        await getChartNotes(chartId);
      } else {
        console.error('[ChartEditor] Failed to delete note:', result);
        showError(t('chartEditor.notes.deleteError', 'Failed to delete note'));
      }
    } catch (error) {
      console.error('[ChartEditor] Error deleting note:', error);
      showError(t('chartEditor.notes.deleteError', 'Failed to delete note'));
    }
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    if (!chartId) return;

    console.log('[ChartEditor] Updating note:', { chartId, noteId, content });

    try {
      // Optimistically update the note in Redux store
      // This will immediately update the UI without waiting for server response
      dispatch(updateNoteLocally({ chartId, noteId, content }));

      const result = await updateNote(noteId, { content });

      if (result.meta.requestStatus === 'fulfilled') {
        console.log('[ChartEditor] Note updated successfully');
        // The UI already shows the updated content due to optimistic update
        // No need to refresh notes list
      } else {
        console.error('[ChartEditor] Failed to update note:', result);
        showError(t('chartEditor.notes.updateError', 'Failed to update note'));
        // If update failed, refresh to get the original note back
        await getChartNotes(chartId);
      }
    } catch (error) {
      console.error('[ChartEditor] Error updating note:', error);
      showError(t('chartEditor.notes.updateError', 'Failed to update note'));
      // If update failed, refresh to get the original note back
      await getChartNotes(chartId);
    }
  };

  // Handle chart type change (now handled by context)
  // const handleChartTypeChange = (type: string) => {
  //   const newType = type as ChartType;
  //   setCurrentChartType(newType);
  // };

  // Clear Redux entities on unmount
  useEffect(() => {
    return () => {
      clearCurrentChart();
      clearCurrentDataset();
      clearCurrentChartNotes();
    };
  }, []);

  // Loading state
  if (isDatasetLoading || isChartLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col">
      {/* Header Section */}
      <ChartEditorHeader
        onReset={handleReset}
        onSave={handleSave}
        onBack={handleBack}
        onOpenDatasetModal={() => setShowDatasetModal(true)}
      />

      {/* Main Content - Full Width Chart Area */}
      <div className="flex-1 bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          <UnifiedChartEditor />
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
          isOpen={isNotesSidebarOpen}
          onToggle={handleToggleNotesSidebar}
          notes={currentChartNotes}
          onAddNote={handleAddNote}
          isLoading={creatingNote || updatingNote || deletingNote}
          onDeleteNote={handleDeleteNote}
          onUpdateNote={handleUpdateNote}
        />
      )}
    </div>
  );
};

export default ChartEditorPage;
