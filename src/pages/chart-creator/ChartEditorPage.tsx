import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import UnifiedChartEditor from '@/components/charts/UnifiedChartEditor';
import { useDataset } from '@/features/dataset/useDataset';
import { convertToChartData } from '@/utils/dataConverter';
import { useCharts } from '@/features/charts/useCharts';
import {
  Database,
  BarChart3,
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  RotateCcw,
  Upload,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
// Chart data types are now handled in contexts
import { useToast } from '@/hooks/useToast';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import Utils from '@/utils/Utils';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import UnsavedChangesModal from '@/components/ui/UnsavedChangesModal';
import ToastContainer from '@/components/ui/toast-container';
import ChartNoteSidebar from '@/components/charts/ChartNoteSidebar';
import { useChartNotes, updateNoteLocally } from '@/features/chartNotes';
import { useAppDispatch } from '@/store/hooks';
import DatasetSelectionDialog from '@/pages/workspace/components/DatasetSelectionDialog';
import { getDefaultChartConfig } from '@/utils/chartDefaults';
// MainChartConfig now handled by contexts
import type { ChartRequest } from '@/features/charts';
// ChartType is imported in ChartEditorWithProviders
import { clearCurrentDataset } from '@/features/dataset/datasetSlice';
import { useChartEditor, useFieldSave } from '@/contexts/ChartEditorContext';

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
    // setCurrentChartType, // Available for future use by UnifiedChartEditor
    editableName,
    setEditableName,
    editableDescription,
    setEditableDescription,
    isEditingName,
    setIsEditingName,
    isEditingDescription,
    setIsEditingDescription,
    originalName,
    originalDescription,
    hasChanges,
    resetToOriginal,
    updateOriginals,
    validationErrors,
    isFormValid,
    validateField,
    clearValidationError,
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
    clearCurrentNotes,
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

  // Chart type, mode, chartId, and datasetId are now handled by the wrapper component and context

  // State for dataset selection modal
  const [showDatasetModal, setShowDatasetModal] = useState(false);

  // Load dataset if we have a datasetId - DONE
  useEffect(() => {
    const loadData = async () => {
      if (mode === 'create' && datasetId) {
        await getDatasetById(datasetId).unwrap();
      }
      if (mode === 'edit' && chartId) {
        await getChartById(chartId);
        getChartNotes(chartId);
      }
    };
    loadData();
  }, [datasetId, chartId, mode, getDatasetById, getChartById, getChartNotes]);

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

        console.warn(
          '❌ [Dataset] Conversion resulted in empty data - convertedData:',
          convertedData
        );

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

  // hasChanges is now handled by ChartEditorContext

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
        // Cast MainChartConfig to the API expected shape. We ensure default includes required fields (e.g., margin)
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
    // Check if there are unsaved changes in edit mode
    if (hasChanges && mode === 'edit') {
      // Show unsaved changes modal
      setPendingNavigation(() => () => {
        clearCurrentChart();
        navigate('/workspace/charts');
      });
      setShowUnsavedModal(true);
    } else {
      // No changes, navigate directly
      clearCurrentChart();
      navigate('/workspace/charts');
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

  // Handle chart type change (now handled by context)
  // const handleChartTypeChange = (type: string) => {
  //   const newType = type as ChartType;
  //   setCurrentChartType(newType);
  // };

  const chartInfo = useMemo(() => {
    switch (currentChartType) {
      case 'line':
        return {
          name: t('chart_type_line', 'Line Chart'),
          icon: '📈',
          color: 'bg-blue-500',
          description: t('chart_type_line_desc', 'Perfect for showing trends over time'),
        };
      case 'bar':
        return {
          name: t('chart_type_bar', 'Bar Chart'),
          icon: '📊',
          color: 'bg-green-500',
          description: t('chart_type_bar_desc', 'Great for comparing values across categories'),
        };
      case 'area':
        return {
          name: t('chart_type_area', 'Area Chart'),
          icon: '📉',
          color: 'bg-purple-500',
          description: t('chart_type_area_desc', 'Ideal for showing data volume over time'),
        };
      default:
        return {
          name: t('chart_type_default', 'Chart'),
          icon: '📊',
          color: 'bg-gray-500',
          description: t('chart_type_default_desc', 'Interactive chart visualization'),
        };
    }
  }, [currentChartType, t]);

  // Clear current chart on unmount
  useEffect(() => {
    return () => {
      clearCurrentChart();
      clearCurrentDataset();
    };
  }, [clearCurrentChart, clearCurrentDataset]);

  // Loading state
  if (isDatasetLoading || isChartLoading || isNoteLoading) {
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0"
      >
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${chartInfo.color} rounded-lg flex items-center justify-center text-white text-lg shadow-lg`}
              >
                {chartInfo.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center gap-2">
                    {currentChart ? (
                      <>
                        {isEditingName && mode === 'edit' ? (
                          <div className="flex flex-col gap-1">
                            <Input
                              value={editableName}
                              onChange={e => {
                                setEditableName(e.target.value);
                                // Clear validation error when user types
                                if (e.target.value.trim()) {
                                  clearValidationError('name');
                                } else {
                                  // Show validation error immediately when field becomes empty
                                  validateField('name', e.target.value);
                                }
                              }}
                              className={`w-100 text-xl font-bold bg-transparent border-dashed px-2 py-1 ${
                                validationErrors.name
                                  ? '!border-red-500 focus:border-red-500 ring-1 ring-red-500'
                                  : 'border-gray-300'
                              }`}
                              onBlur={handleNameSave}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleNameSave();
                                } else if (e.key === 'Escape') {
                                  // Only allow escape if name is not empty
                                  if (editableName.trim()) {
                                    setEditableName(originalName); // Restore original value
                                    clearValidationError('name');
                                    setIsEditingName(false);
                                  }
                                  // If name is empty, do nothing (prevent escape)
                                }
                              }}
                              autoFocus
                              placeholder={t('chart_name_required', 'Chart name is required')}
                            />
                            {validationErrors.name && (
                              <span className="text-red-500 text-xs ml-2">
                                {t('field_required', 'This field is required')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <h1
                            className={`text-xl font-bold text-gray-900 dark:text-white ${
                              mode === 'edit'
                                ? 'cursor-pointer hover:text-blue-600 transition-colors'
                                : 'cursor-default'
                            }`}
                            onClick={() => {
                              if (mode === 'edit') {
                                setIsEditingName(true);
                                // Trigger validation if field is empty
                                if (!editableName.trim()) {
                                  validateField('name', editableName);
                                }
                              }
                            }}
                          >
                            {editableName || currentChart.name}
                          </h1>
                        )}
                      </>
                    ) : (
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('chart_editor_title_main', 'Chart Editor')}
                      </h1>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <BarChart3 className="w-3 h-3" />
                      {chartInfo.name}
                    </Badge>
                    {hasChanges && mode === 'edit' && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs border-orange-300 text-orange-600 bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:bg-orange-900/20"
                      >
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        {t('dataset_unsavedChangesIndicator', 'Unsaved changes')}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {currentChart && (
                    <div className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t('description', 'Description')}:
                      </span>
                      {isEditingDescription && mode === 'edit' ? (
                        <div className="flex flex-col gap-1">
                          <Input
                            value={editableDescription}
                            onChange={e => {
                              setEditableDescription(e.target.value);
                              // Clear validation error when user types
                              if (e.target.value.trim()) {
                                clearValidationError('description');
                              } else {
                                // Show validation error immediately when field becomes empty
                                validateField('description', e.target.value);
                              }
                            }}
                            className={`w-200 text-xl font-bold bg-transparent border-dashed px-2 py-1 ${
                              validationErrors.description
                                ? '!border-red-500 focus:border-red-500 ring-1 ring-red-500'
                                : 'border-gray-300'
                            }`}
                            onBlur={handleDescriptionSave}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                handleDescriptionSave();
                              } else if (e.key === 'Escape') {
                                // Only allow escape if description is not empty
                                if (editableDescription.trim()) {
                                  setEditableDescription(originalDescription); // Restore original value
                                  clearValidationError('description');
                                  setIsEditingDescription(false);
                                }
                                // If description is empty, do nothing (prevent escape)
                              }
                            }}
                            placeholder={t('description_required', 'Description is required')}
                            autoFocus
                          />
                          {validationErrors.description && (
                            <span className="text-red-500 text-xs">
                              {t('field_required', 'This field is required')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span
                          className={`text-xs text-gray-700 dark:text-gray-300 ${
                            mode === 'edit'
                              ? 'cursor-pointer hover:text-blue-600 transition-colors'
                              : 'cursor-default'
                          }`}
                          onClick={() => {
                            if (mode === 'edit') {
                              setIsEditingDescription(true);
                              // Trigger validation if field is empty
                              if (!editableDescription.trim()) {
                                validateField('description', editableDescription);
                              }
                            }
                          }}
                          style={{ fontWeight: '500', fontSize: '14px' }}
                        >
                          {editableDescription ||
                            currentChart.description ||
                            'Click to add description...'}
                        </span>
                      )}
                    </div>
                  )}

                  {currentChart && (
                    <div className="flex items-center gap-4">
                      {currentChart.createdAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                          <span className="font-medium">{t('chart_created', 'Created')}:</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {Utils.getDate(currentChart.createdAt, 18)}
                          </span>
                        </div>
                      )}

                      {currentChart.updatedAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                          <span className="font-medium">{t('chart_updated', 'Updated')}:</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {Utils.getDate(currentChart.updatedAt, 18)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {mode === 'create' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDatasetModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Select Dataset
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common_back', 'Back')}
              </Button>
              <div className="flex items-center gap-2">
                {mode === 'edit' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('common_reset', 'Reset')}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => handleSave()}
                  disabled={mode === 'create' ? creating || !isFormValid : !hasChanges}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t('chart_create_creating', 'Creating...')}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {mode === 'create'
                        ? t('chart_create_save', 'Create Chart')
                        : t('common_save', 'Save')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
