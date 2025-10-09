import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UnifiedChartEditor from '@/components/charts/UnifiedChartEditor';
import { salesData } from '@/components/charts/data/data';
import { useDataset } from '@/features/dataset/useDataset';
import type { Dataset } from '@/features/dataset/datasetAPI';
import { convertArrayToChartData, convertChartDataToArray } from '@/utils/dataConverter';
import { useCharts } from '@/features/charts/useCharts';
import { Database, BarChart3, ArrowLeft, Save, Calendar, Clock, RotateCcw } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Chart, ChartType } from '@/features/charts/chartTypes';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import type { StructuredChartConfig } from '@/types/chart';
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

const ChartEditorPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getDatasetById } = useDataset();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const modalConfirm = useModalConfirm();
  const [dataset, setDataset] = useState<Dataset | undefined>(undefined);
  const [currentModalAction, setCurrentModalAction] = useState<'save' | 'reset' | null>(null);
  const { currentChart, loading, getChartById, updateChart, clearCurrent } = useCharts();

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
  } = useChartNotes();

  // Chart notes sidebar state
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);

  // Unsaved changes modal state
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false);
  // Get parameters from URL
  const chartId = searchParams.get('chartId');
  const mode = searchParams.get('mode') || 'create'; // 'create' or 'edit'
  // Get parameters from location state (priority) or URL parameters (fallback)
  const locationState = location.state as {
    datasetId?: string;
    datasetName?: string;
    dataset?: Dataset;
    type?: ChartType;
  } | null;

  // Priority: location state > URL parameters > defaults
  const datasetId = locationState?.datasetId || searchParams.get('datasetId') || '';
  const passedDataset = locationState?.dataset;
  // Get chart type from current chart or default to 'bar'
  const type = locationState?.type as ChartType;
  const [currentChartType, setCurrentChartType] = useState<ChartType>(type);

  // Load dataset if not passed directly and we have a datasetId
  useEffect(() => {
    const loadDataset = async () => {
      // If dataset is passed directly, use it
      if (passedDataset) {
        setDataset(passedDataset);
        return;
      }

      // If we have a datasetId, fetch it
      if (datasetId) {
        try {
          const result = await getDatasetById(datasetId).unwrap();
          setDataset(result);
        } catch (error) {
          console.error('Failed to load dataset:', error);
        }
      }
    };

    loadDataset();
  }, [datasetId, passedDataset, getDatasetById]);

  // Local state for managing chart data and config
  const [chartData, setChartData] = useState<ChartDataPoint[]>(
    () => convertArrayToChartData(salesData) // Convert salesData to ChartDataPoint[]
  );
  const [chartConfig, setChartConfig] = useState<StructuredChartConfig | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Edit mode states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editableDescription, setEditableDescription] = useState('');

  // Original values for change tracking
  const [originalName, setOriginalName] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [originalConfig, setOriginalConfig] = useState<StructuredChartConfig | null>(null);
  const [originalChartType, setOriginalChartType] = useState<ChartType>(currentChartType);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    name: false,
    description: false,
    title: false,
    xAxisLabel: false,
    yAxisLabel: false,
    seriesNames: {} as Record<string, boolean>,
  });
  // Check if there are any changes
  const hasChanges = useMemo(() => {
    // Only check for changes if we're in edit mode and have initialized the original values
    if (mode !== 'edit' || !isInitialized) {
      return false;
    }

    const nameChanged = editableName !== originalName;
    const descriptionChanged = editableDescription !== originalDescription;
    const chartTypeChanged = currentChartType !== originalChartType;

    // Handle config comparison more carefully
    const configChanged = (() => {
      // If both are null or undefined, no change
      if (!chartConfig && !originalConfig) return false;
      // If one is null and other isn't, there's a change
      if (!chartConfig || !originalConfig) return true;
      // Compare JSON strings
      return JSON.stringify(chartConfig) !== JSON.stringify(originalConfig);
    })();

    return nameChanged || descriptionChanged || chartTypeChanged || configChanged;
  }, [
    editableName,
    originalName,
    editableDescription,
    originalDescription,
    currentChartType,
    originalChartType,
    chartConfig,
    originalConfig,
    mode,
    isInitialized,
  ]);

  // Validation function
  const validateForm = useCallback(() => {
    const errors = {
      name: !editableName.trim(),
      description: !editableDescription.trim(),
      title:
        !chartConfig?.config?.title ||
        typeof chartConfig.config.title !== 'string' ||
        !chartConfig.config.title.trim(),
      xAxisLabel:
        !chartConfig?.config?.xAxisLabel ||
        typeof chartConfig.config.xAxisLabel !== 'string' ||
        !chartConfig.config.xAxisLabel.trim(),
      yAxisLabel:
        !chartConfig?.config?.yAxisLabel ||
        typeof chartConfig.config.yAxisLabel !== 'string' ||
        !chartConfig.config.yAxisLabel.trim(),
      seriesNames: {} as Record<string, boolean>, // Keep for compatibility but not used
    };

    // Note: Series names validation removed since names are auto-synced with data columns
    // No need to validate series names anymore as they are automatically generated

    setValidationErrors(errors);

    // Return true if no errors (excluding seriesNames since they're auto-managed)
    return (
      !errors.name &&
      !errors.description &&
      !errors.title &&
      !errors.xAxisLabel &&
      !errors.yAxisLabel
    );
  }, [
    editableName,
    editableDescription,
    chartConfig?.config?.title,
    chartConfig?.config?.xAxisLabel,
    chartConfig?.config?.yAxisLabel,
  ]);

  // Real-time validation - runs whenever relevant fields change
  useEffect(() => {
    if (isInitialized) {
      validateForm();
    }
  }, [validateForm, isInitialized]);

  // Enable beforeunload warning when there are unsaved changes
  useBeforeUnload({
    hasUnsavedChanges: hasChanges && mode === 'edit',
    message: t(
      'chart_unsaved_changes_warning',
      'You have unsaved changes to your chart. Are you sure you want to leave?'
    ),
  });

  // Fetch chart data when chartId is available (for edit mode)
  useEffect(() => {
    if (chartId && mode === 'edit' && !isInitialized) {
      getChartById(chartId);
    } else if (mode === 'create' && !isInitialized) {
      // Initialize original values for create mode (empty values)
      setOriginalName('');
      setOriginalDescription('');
      setOriginalConfig(null);
      setOriginalChartType(currentChartType);
      setIsInitialized(true);
    }
  }, [chartId, mode, getChartById, isInitialized, currentChartType]);

  // Update local state when chart data is loaded in edit mode
  useEffect(() => {
    if (currentChart && mode === 'edit' && !isInitialized) {
      // Initialize editable fields first
      setEditableName(currentChart.name || '');
      setEditableDescription(currentChart.description || '');

      // Update chart type from loaded chart
      setCurrentChartType(currentChart.type || 'bar');

      // Set original values for change tracking
      setOriginalName(currentChart.name || '');
      setOriginalDescription(currentChart.description || '');
      setOriginalChartType(currentChart.type || 'bar');

      // Load chart configuration after setting originals
      if (currentChart.config) {
        // Ensure config follows the exact structure: {config: {...}, formatters: {...}, seriesConfigs: [...], chartType: "..."}
        let structuredConfig: StructuredChartConfig;

        // Check if it's already in the correct format (has nested config property)
        if (
          (currentChart.config as Record<string, unknown>).config &&
          (currentChart.config as Record<string, unknown>).chartType
        ) {
          structuredConfig = currentChart.config as unknown as StructuredChartConfig;
        } else {
          // Convert to the correct format
          structuredConfig = {
            config: {
              title: (currentChart.config.title as string) || '',
              xLabel: (currentChart.config.xLabel as string) || '',
              yLabel: (currentChart.config.yLabel as string) || '',
              xColumn: (currentChart.config.xColumn as number) || 0,
              width: (currentChart.config.width as number) || 800,
              height: (currentChart.config.height as number) || 600,
              showLegend: (currentChart.config.showLegend as boolean) !== false,
              showGrid: (currentChart.config.showGrid as boolean) !== false,
              showDataLabels: (currentChart.config.showDataLabels as boolean) || false,
              ...(currentChart.config.config && typeof currentChart.config.config === 'object'
                ? currentChart.config.config
                : {}),
            },
            formatters: {
              ...((currentChart.config.formatters as Record<string, unknown>) || {}),
            },
            seriesConfigs:
              (currentChart.config
                .seriesConfigs as unknown as StructuredChartConfig['seriesConfigs']) || [],
            chartType: currentChart.type || 'line',
          };
        }

        setChartConfig(structuredConfig);
        setOriginalConfig(structuredConfig);
      }

      // Load dataset data if available (type assertion for extended dataset)
      const chartWithDataset = currentChart as unknown as Chart & {
        dataset?: {
          id: string;
          name: string;
          description?: string;
          headers?: Array<{
            name: string;
            type: string;
            index: number;
            data: (string | number)[];
          }>;
        };
      };

      if (chartWithDataset.dataset?.headers) {
        // Convert dataset headers to chart data format
        const convertedData = convertDatasetToChartFormat(chartWithDataset.dataset.headers);
        if (convertedData.length > 0) {
          setChartData(convertedData);
        }
      }

      setIsInitialized(true);
    }
  }, [currentChart, mode, isInitialized]);

  // Convert dataset headers to chart data format using the utility function
  const convertDatasetToChartFormat = (
    headers: Array<{ name: string; type: string; index: number; data: (string | number)[] }>
  ) => {
    try {
      if (!headers || headers.length === 0) return [];

      // Validate that headers have the required structure
      const validHeaders = headers.filter(
        h => h && typeof h === 'object' && h.name && Array.isArray(h.data) && h.data.length > 0
      );

      if (validHeaders.length === 0) return [];

      // Create array format and use convertArrayToChartData instead
      const headerNames = validHeaders.map(h => h.name);
      const rowCount = Math.max(...validHeaders.map(h => h.data.length));
      const rows: (string | number)[][] = [];

      for (let i = 0; i < rowCount; i++) {
        const row = validHeaders.map(h => h.data[i] ?? 0);
        rows.push(row);
      }

      const arrayFormat = [headerNames, ...rows];
      return convertArrayToChartData(arrayFormat as (string | number)[][]);
    } catch (error) {
      console.error('Error converting dataset to chart format:', error);
      return [];
    }
  };

  // Handle name edit - validate before exiting edit mode
  const handleNameSave = () => {
    // Validate name is not empty
    if (!editableName.trim()) {
      // Don't exit editing mode if name is empty
      setValidationErrors(prev => ({ ...prev, name: true }));
      return;
    }

    // Clear validation error and exit editing mode
    setValidationErrors(prev => ({ ...prev, name: false }));
    setIsEditingName(false);
  };

  // Handle description edit - validate before exiting edit mode
  const handleDescriptionSave = () => {
    // Validate description is not empty
    if (!editableDescription.trim()) {
      // Don't exit editing mode if description is empty
      setValidationErrors(prev => ({ ...prev, description: true }));
      return;
    }

    // Clear validation error and exit editing mode
    setValidationErrors(prev => ({ ...prev, description: false }));
    setIsEditingDescription(false);
  };

  // Handle save/update with confirmation - saves all changes at once
  const handleSave = async () => {
    console.log('handleSave 123 ', !validateForm());
    // Validate form before saving
    if (!validateForm()) {
      console.log('handleSave 456 ');
      showError('Please fill in all required fields');
      return;
    }

    if (mode === 'edit' && chartId && currentChart) {
      setCurrentModalAction('save');
      modalConfirm.openConfirm(async () => {
        try {
          const updateData = {
            name: editableName.trim() || currentChart.name,
            description: editableDescription.trim() || currentChart.description,
            type: currentChartType ?? 'line',
            config: chartConfig,
          };

          const response = await updateChart(chartId, updateData);
          if (response.meta.requestStatus === 'fulfilled') {
            // Update original values after successful save
            setOriginalName(editableName.trim() || currentChart.name || '');
            setOriginalDescription(editableDescription.trim() || currentChart.description || '');
            setOriginalConfig(chartConfig);
            setOriginalChartType(currentChartType);
            showSuccess(t('chart_update_success', 'Chart updated successfully'));
          } else {
            showError(t('chart_update_error', 'Failed to update chart'));
          }
        } catch (error) {
          console.error('Error updating chart:', error);
          showError(t('chart_update_error', 'Failed to update chart'));
          throw error; // Re-throw to let modal handle loading state
        }
      });
    }
  };

  // Handle config changes from chart editors
  const handleConfigChange = useCallback(
    (newConfig: unknown) => {
      // Ensure the config maintains the exact structure: {config: {...}, formatters: {...}, seriesConfigs: [...], chartType: "..."}
      if (typeof newConfig === 'object' && newConfig !== null) {
        const configUpdate = newConfig as Record<string, unknown>;

        // Use functional state update to avoid dependency issues
        setChartConfig(currentConfig => {
          // Check if this is a complete structured config from UnifiedChartEditor
          const isStructuredConfig = configUpdate.config && typeof configUpdate.config === 'object';

          if (isStructuredConfig) {
            // It's a complete structured config from UnifiedChartEditor - use it directly
            const updatedConfig = configUpdate as unknown as StructuredChartConfig;
            return updatedConfig;
          } else {
            // It's a partial config update - merge into existing structure
            const updatedConfig: StructuredChartConfig = {
              config: {
                title: '',
                xLabel: '',
                yLabel: '',
                xColumn: 0,
                width: 800,
                height: 600,
                showLegend: true,
                showGrid: true,
                showDataLabels: false,
                // Preserve existing config values first
                ...(currentConfig?.config || {}),
                // Apply new partial changes
                ...configUpdate,
              },
              formatters: {
                ...(currentConfig?.formatters || {}),
              },
              seriesConfigs: currentConfig?.seriesConfigs || [],
              chartType: currentConfig?.chartType || currentChartType || 'line',
            };
            return updatedConfig;
          }
        });
      }
    },
    [currentChartType] // Only depend on chart type
  );

  // Handle reset to original values
  const handleReset = () => {
    if (hasChanges) {
      setCurrentModalAction('reset');
      modalConfirm.openConfirm(async () => {
        try {
          // Reset all values to original (name, description, config, chart type)
          setEditableName(originalName);
          setEditableDescription(originalDescription);
          setCurrentChartType(originalChartType);
          if (originalConfig) {
            setChartConfig(originalConfig);
          }

          // Trigger re-render of UnifiedChartEditor to force config reload
          setResetTrigger(prev => prev + 1);

          // Also exit edit modes if currently editing
          setIsEditingName(false);
          setIsEditingDescription(false);

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
        clearCurrent();
        navigate('/workspace/charts');
      });
      setShowUnsavedModal(true);
    } else {
      // No changes, navigate directly
      clearCurrent();
      navigate('/workspace/charts');
    }
  };

  // Handle unsaved changes modal actions
  const handleSaveAndLeave = async () => {
    if (mode === 'edit' && chartId && currentChart) {
      setIsSavingBeforeLeave(true);
      try {
        const updateData = {
          name: editableName.trim() || currentChart.name,
          description: editableDescription.trim() || currentChart.description,
          type: currentChartType ?? 'line',
          config: chartConfig,
        };

        const response = await updateChart(chartId, updateData);
        if (response.meta.requestStatus === 'fulfilled') {
          // Update original values after successful save
          setOriginalName(editableName.trim() || currentChart.name || '');
          setOriginalDescription(editableDescription.trim() || currentChart.description || '');
          setOriginalConfig(chartConfig);
          setOriginalChartType(currentChartType);
          showSuccess(t('chart_update_success', 'Chart updated successfully'));
        } else {
          showError(t('chart_update_error', 'Failed to update chart'));
        }
        // Execute pending navigation
        if (pendingNavigation) {
          pendingNavigation();
        }
      } catch (error) {
        console.error('Error saving chart before leave:', error);
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

  // Load chart notes when chart is loaded
  useEffect(() => {
    if (chartId && mode === 'edit') {
      console.log('[ChartEditor] Loading notes for chart:', chartId);
      getChartNotes(chartId).then(result => {
        if (result.meta.requestStatus === 'fulfilled') {
          console.log('[ChartEditor] Notes loaded successfully:', result.payload);
        } else {
          console.error('[ChartEditor] Failed to load notes:', result);
        }
      });
    }
    return () => {
      clearCurrentNotes();
    };
  }, [chartId, mode, getChartNotes, clearCurrentNotes]);

  // Clear current chart when component unmounts to prevent stale data
  useEffect(() => {
    return () => {
      clearCurrent();
    };
  }, [clearCurrent]);

  // Show loading state for edit mode when waiting for chart data
  if (mode === 'edit' && chartId && (loading || !currentChart || !isInitialized)) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-muted-foreground">
            {loading
              ? t('chart_editor_loading', 'Loading chart...')
              : !currentChart
                ? t('chart_editor_loading_data', 'Loading chart data...')
                : t('chart_editor_loading_config', 'Loading chart configuration...')}
          </p>
        </div>
      </div>
    );
  }

  // Handle chart type change
  const handleChartTypeChange = (type: string) => {
    const newType = type as ChartType;
    setCurrentChartType(newType);
  };

  const getChartTypeInfo = (type: ChartType) => {
    switch (type) {
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
  };

  const chartInfo = getChartTypeInfo(currentChartType);

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
                                  setValidationErrors(prev => ({ ...prev, name: false }));
                                } else {
                                  // Show validation error immediately when field becomes empty
                                  setValidationErrors(prev => ({ ...prev, name: true }));
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
                                    setValidationErrors(prev => ({ ...prev, name: false }));
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
                                  setValidationErrors(prev => ({ ...prev, name: true }));
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
                                setValidationErrors(prev => ({ ...prev, description: false }));
                              } else {
                                // Show validation error immediately when field becomes empty
                                setValidationErrors(prev => ({ ...prev, description: true }));
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
                                  setValidationErrors(prev => ({ ...prev, description: false }));
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
                                setValidationErrors(prev => ({ ...prev, description: true }));
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common_back', 'Back')}
              </Button>
              {mode === 'edit' && (
                <div className="flex items-center gap-2">
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
                  <Button
                    size="sm"
                    onClick={() => handleSave()}
                    disabled={!hasChanges}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {t('common_save', 'Save')}
                  </Button>
                </div>
              )}
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
          <UnifiedChartEditor
            key={`chart-editor-${resetTrigger}`}
            initialArrayData={chartData.length > 0 ? convertChartDataToArray(chartData) : []}
            initialChartType={currentChartType}
            initialStructuredConfig={chartConfig || undefined}
            onConfigChange={mode === 'edit' ? handleConfigChange : () => {}}
            onChartTypeChange={(type: string) => handleChartTypeChange(type)}
            dataset={dataset}
            allowChartTypeChange={mode === 'edit'}
            validationErrors={validationErrors}
            onValidationChange={validateForm}
          />
        </motion.div>
      </div>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      {/* Confirmation Modal */}
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
