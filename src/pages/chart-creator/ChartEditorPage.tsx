import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import UnifiedChartEditor from '@/components/charts/UnifiedChartEditor';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useCharts } from '@/features/charts/useCharts';
import { useDataset } from '@/features/dataset/useDataset';
import { convertToChartData } from '@/utils/dataConverter';
// Chart data types are now handled in contexts
import ChartNoteSidebar from '@/components/charts/ChartNoteSidebar';
import UnsavedChangesModal from '@/components/ui/UnsavedChangesModal';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import ToastContainer from '@/components/ui/toast-container';
import { updateNoteLocally, useChartNotes } from '@/features/chartNotes';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useModalConfirm } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import DatasetSelectionDialog from '@/pages/workspace/components/DatasetSelectionDialog';
import { useAppDispatch } from '@/store/hooks';
import { getDefaultChartConfig } from '@/utils/chartDefaults';
// MainChartConfig now handled by contexts
import type { ChartRequest, ChartType } from '@/features/charts';
// ChartType is imported in ChartEditorWithProviders
import { useChartEditor, useFieldSave } from '@/contexts/ChartEditorContext';
import { clearCurrentDataset } from '@/features/dataset/datasetSlice';
import Routers from '@/router/routers';
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
    // handleConfigChange, // Available for UnifiedChartEditor when needed
  } = useChartEditor();

  // Field save helpers
  const saveNameField = useFieldSave('name');
  const saveDescriptionField = useFieldSave('description');

  // Helper to set originals from external data (for future use)
  // const setOriginalValues = useSetChartEditorOriginals();
  // const [dataset, setDataset] = useState<Dataset | undefined>(undefined);
  const [currentModalAction, setCurrentModalAction] = useState<'save' | 'reset' | null>(null);
  const {
    currentChart,
    loading: isChartLoading,
    creating,
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
    loading: isNoteLoading,
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

  // State to track if originals have been set for current chart
  const [originalsSet, setOriginalsSet] = useState(false);

  // Load chart and dataset data
  useEffect(() => {
    const loadData = async () => {
      // Edit mode: load chart first; dataset will be loaded in a separate effect after chart is available
      if (mode === 'edit' && chartId && !currentChart) {
        await getChartById(chartId);
      }

      // Create mode: load dataset directly
      if (mode === 'create' && datasetId && !currentDataset) {
        await getDatasetById(datasetId).unwrap();
      }
    };
    loadData();
  }, [datasetId, chartId, mode, getDatasetById, getChartById, currentChart, currentDataset]);

  // Edit mode: after chart is loaded, fetch its dataset once
  useEffect(() => {
    if (mode === 'edit' && currentChart && currentChart.datasetId && !currentDataset) {
      getDatasetById(currentChart.datasetId).unwrap();
    }
  }, [mode, currentChart, currentDataset, getDatasetById]);

  // Initialize for create mode
  useEffect(() => {
    if (mode === 'create') {
      const chartTypeName = currentChartType.charAt(0).toUpperCase() + currentChartType.slice(1);

      // Initialize with default values for create mode
      setEditableName(`${chartTypeName} Chart`);
      setEditableDescription(`Chart created from ${chartTypeName.toLowerCase()} template`);

      // Create default chart configuration using helper function
      // Only initialize config once - don't recreate when dataset changes
      const defaultConfig = getDefaultChartConfig(currentChartType);

      setChartConfig(defaultConfig);

      // For create mode, we don't need to set originals as there are no changes to track yet
      // The context will handle this automatically
    }
  }, [mode, currentChartType]);

  //Initialize for edit mode
  useEffect(() => {
    if (mode === 'edit' && currentChart) {
      // Populate fields from currentChart in edit mode
      setEditableName(currentChart.name || '');
      setEditableDescription(currentChart.description || '');

      setChartConfig(currentChart.config as MainChartConfig);
      setCurrentChartType(currentChart.type as ChartType);

      // Also set datasetId from currentChart if not already set
      if (currentChart.datasetId) {
        setDatasetId(currentChart.datasetId);
      }

      // Reset originals flag when new chart loads
      setOriginalsSet(false);
    }
  }, [mode, currentChart]);

  // Set originals after form fields are populated in edit mode (run only once per chart)
  useEffect(() => {
    if (
      mode === 'edit' &&
      currentChart &&
      editableName &&
      editableDescription &&
      chartConfig &&
      !originalsSet
    ) {
      updateOriginals();
      setOriginalsSet(true);
    }
  }, [
    mode,
    currentChart,
    editableName,
    editableDescription,
    chartConfig,
    updateOriginals,
    originalsSet,
  ]);

  // Effect to convert dataset to chart data when dataset is loaded
  useEffect(() => {
    if (currentDataset && currentDataset.headers && currentDataset.headers.length > 0) {
      try {
        const validHeaders = currentDataset.headers.map((h: any) => ({
          id: h.id || '',
          datasetId: h.datasetId || '',
          name: h.name,
          type: h.type,
          index: h.index,
          data: h.data as (string | number)[],
        }));

        const convertedData = convertToChartData(validHeaders);

        if (convertedData.length > 0) {
          setChartData(convertedData);
          return;
        }

        // Fallback: if dataset has row data, convert it
        if (Array.isArray((currentDataset as any).rows)) {
          const headerNames = currentDataset.headers.map((h: any) => h.name);
          const rows = (currentDataset as any).rows;
          const arrayFormat = [headerNames, ...rows];
          const convertedData = convertToChartData(arrayFormat);

          if (convertedData.length > 0) {
            setChartData(convertedData);
            return;
          }
        }

        setChartData([]);
      } catch (error) {
        console.error('⚠️ [Dataset] Error processing dataset:', error);
        setChartData([]);
      }
    }
  }, [currentDataset, datasetId]);

  // Thông báo rằng là chart chưa lưu -> người dùng lưu hoặc cancel
  useBeforeUnload({
    hasUnsavedChanges: hasChanges && mode === 'edit',
    message: t(
      'chart_unsaved_changes_warning',
      'You have unsaved changes to your chart. Are you sure you want to leave?'
    ),
  });

  // Initialize for create mode
  useEffect(() => {
    if (mode === 'create') {
      const chartTypeName = currentChartType.charAt(0).toUpperCase() + currentChartType.slice(1);

      // Initialize with default values for create mode
      setEditableName(`${chartTypeName} Chart`);
      setEditableDescription(`Chart created from ${chartTypeName.toLowerCase()} template`);

      // Create default chart configuration using helper function
      // Only initialize config once - don't recreate when dataset changes
      const defaultConfig = getDefaultChartConfig(currentChartType);

      setChartConfig(defaultConfig);

      // For create mode, we don't need to set originals as there are no changes to track yet
      // The context will handle this automatically
    }
  }, [mode, currentChartType]);

  useEffect(() => {
    if (mode === 'edit' && currentChart) {
      // Populate fields from currentChart in edit mode
      setEditableDescription(currentChart.description || '');
      // Set originals for change tracking
      updateOriginals();
      // Also set datasetId from currentChart if not already set
      if (currentChart.datasetId) {
        setDatasetId(currentChart.datasetId);
      }
    }
  }, [mode, currentChart]);

  // Use validation context helpers for field save logic
  const handleNameSave = () => {
    saveNameField(editableName, () => setIsEditingName(false));
  };

  const handleDescriptionSave = () => {
    saveDescriptionField(editableDescription, () => setIsEditingDescription(false));
  };

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

      // Navigate to edit mode with the new chartId
      // Keep only chartId and datasetId in URL (type is stored in database)
      const urlParams = new URLSearchParams();
      urlParams.set('chartId', result.id);
      if (datasetId) {
        urlParams.set('datasetId', datasetId);
      }

      navigate(`${location.pathname}?${urlParams.toString()}`, {
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
    const performBackNav = () => {
      clearCurrentChart();
      if (mode === 'edit' && chartId) {
        navigate('/workspace', { state: { tab: 'charts' } });
      } else if (datasetId) {
        navigate(Routers.CHART_GALLERY, { state: { datasetId } });
      } else {
        navigate('/workspace', { state: { tab: 'datasets' } });
      }
    };

    if (hasChanges && mode === 'edit') {
      // Show unsaved changes modal
      setPendingNavigation(() => performBackNav);
      setShowUnsavedModal(true);
    } else {
      // No changes, navigate directly
      performBackNav();
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

  // Clear current chart when component unmounts to prevent stale data
  useEffect(() => {
    return () => {
      clearCurrentChart();
    };
  }, [clearCurrentChart]);

  // moved into ChartEditorHeader

  // Clear current chart on unmount
  useEffect(() => {
    return () => {
      clearCurrentChart();
      clearCurrentDataset();
    };
  }, [clearCurrentChart, clearCurrentDataset]);

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
