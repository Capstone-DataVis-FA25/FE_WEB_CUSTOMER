import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import UnifiedChartEditor from '@/components/charts/UnifiedChartEditor';
import { useDataset } from '@/features/dataset/useDataset';
import type { Dataset } from '@/features/dataset/datasetAPI';
import { convertArrayToChartData, convertChartDataToArray } from '@/utils/dataConverter';
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
import type { Chart, ChartType } from '@/features/charts/chartTypes';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import type { StructuredChartConfig } from '@/types/chart';
import { useToast } from '@/hooks/useToast';
import type { CreateChartRequest } from '@/features/charts/chartTypes';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import Utils from '@/utils/Utils';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import UnsavedChangesModal from '@/components/ui/UnsavedChangesModal';
import ToastContainer from '@/components/ui/toast-container';
import ChartNoteSidebar from '@/components/charts/ChartNoteSidebar';
import { useChartNotes, updateNoteLocally } from '@/features/chartNotes';
import { useAppDispatch } from '@/store/hooks';
import DatasetUploadModal from '@/components/dataset/DatasetUploadModal';
import DatasetSelectionDialog from '@/pages/workspace/components/DatasetSelectionDialog';
import { getDefaultChartConfig } from '@/utils/chartDefaults';

const ChartEditorPage: React.FC = () => {
  // ==================== HOOKS ====================
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getDatasetById, createDataset } = useDataset();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const modalConfirm = useModalConfirm();
  const { currentChart, loading, creating, getChartById, updateChart, clearCurrent, createChart } =
    useCharts();
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

  // ==================== URL PARAMS & MODE ====================
  const chartId = searchParams.get('chartId');
  const datasetId = searchParams.get('datasetId') || '';
  const locationState = location.state as { type?: ChartType } | null;
  const typeFromState = locationState?.type;
  const mode = chartId ? 'edit' : 'create';

  // ==================== STATE: DATASET ====================
  const [dataset, setDataset] = useState<Dataset | undefined>(undefined);
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);

  // ==================== STATE: CHART DATA & CONFIG ====================
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartConfig, setChartConfig] = useState<StructuredChartConfig | null>(null);
  const [currentChartType, setCurrentChartType] = useState<ChartType>(() => {
    return typeFromState || 'line';
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  // ==================== STATE: EDIT MODE ====================
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editableDescription, setEditableDescription] = useState('');

  // ==================== STATE: ORIGINAL VALUES (for change tracking) ====================
  const [originalName, setOriginalName] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [originalConfig, setOriginalConfig] = useState<StructuredChartConfig | null>(null);
  const [originalChartType, setOriginalChartType] = useState<ChartType>('line');

  // ==================== STATE: VALIDATION ====================
  const [validationErrors, setValidationErrors] = useState({
    name: false,
    description: false,
    title: false,
    xAxisLabel: false,
    yAxisLabel: false,
    seriesNames: {} as Record<string, boolean>,
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // ==================== STATE: MODALS ====================
  const [currentModalAction, setCurrentModalAction] = useState<'save' | 'reset' | null>(null);
  const [showDatasetUploadModal, setShowDatasetUploadModal] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false);

  // ==================== STATE: CHART NOTES ====================
  const [isNotesSidebarOpen, setIsNotesSidebarOpen] = useState(false);

  // ==================== MEMOIZED VALUES ====================
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

  // ==================== UTILITY FUNCTIONS ====================
  // Convert dataset headers to chart data format
  const convertDatasetToChartFormat = (
    headers: Array<{ name: string; type: string; index: number; data: (string | number)[] }>
  ) => {
    try {
      if (!headers || headers.length === 0) {
        return [];
      }

      // Validate that headers have the required structure
      const validHeaders = headers.filter(
        h => h && typeof h === 'object' && h.name && Array.isArray(h.data) && h.data.length > 0
      );

      if (validHeaders.length === 0) {
        return [];
      }

      // Create array format and use convertArrayToChartData instead
      const headerNames = validHeaders.map(h => h.name);
      const rowCount = Math.max(...validHeaders.map(h => h.data.length));

      const rows: (string | number)[][] = [];

      for (let i = 0; i < rowCount; i++) {
        const row = validHeaders.map(h => h.data[i] ?? 0);
        rows.push(row);
      }

      const arrayFormat = [headerNames, ...rows];

      const result = convertArrayToChartData(arrayFormat as (string | number)[][], {
        headerTransform: (header: string) => header, // Keep original header names
        skipEmptyRows: true,
        defaultValue: 0,
        validateTypes: true,
      });

      return result;
    } catch (error) {
      console.error('[ChartEditor] convertDatasetToChartFormat error:', error);
      return [];
    }
  };

  // Create stable callback for no-op
  const noOpCallback = useCallback(() => {}, []);

  // ==================== VALIDATION FUNCTIONS ====================
  // Validation function - only used for explicit validation, not in render
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

    const isValid =
      !errors.name &&
      !errors.description &&
      !errors.title &&
      !errors.xAxisLabel &&
      !errors.yAxisLabel;

    setIsFormValid(isValid);
    return isValid;
  }, [
    editableName,
    editableDescription,
    chartConfig?.config?.title,
    chartConfig?.config?.xAxisLabel,
    chartConfig?.config?.yAxisLabel,
  ]);

  // ==================== EFFECTS: VALIDATION ====================
  // Real-time validation - runs whenever relevant fields change
  useEffect(() => {
    if (isInitialized) {
      // Call validation function directly without including it in dependencies
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
        seriesNames: {} as Record<string, boolean>,
      };

      setValidationErrors(errors);

      // Update form validity state
      const isValid =
        !errors.name &&
        !errors.description &&
        !errors.title &&
        !errors.xAxisLabel &&
        !errors.yAxisLabel;

      setIsFormValid(isValid);
    }
  }, [
    isInitialized,
    editableName,
    editableDescription,
    chartConfig?.config?.title,
    chartConfig?.config?.xAxisLabel,
    chartConfig?.config?.yAxisLabel,
  ]);

  // ==================== EFFECTS: INITIALIZATION ====================
  // Reset initialization when chartId or mode changes
  useEffect(() => {
    setIsInitialized(false);
  }, [chartId, mode]);

  // Thông báo rằng là chart chưa lưu -> người dùng lưu hoặc cancel
  useBeforeUnload({
    hasUnsavedChanges: hasChanges && mode === 'edit',
    message: t(
      'chart_unsaved_changes_warning',
      'You have unsaved changes to your chart. Are you sure you want to leave?'
    ),
  });

  // ==================== EFFECTS: LOAD DATASET ====================
  // Load dataset if we have a datasetId
  useEffect(() => {
    const loadDataset = async () => {
      if (datasetId) {
        setIsLoadingDataset(true);
        try {
          const result = await getDatasetById(datasetId).unwrap();
          setDataset(result);
        } catch (error) {
        } finally {
          setIsLoadingDataset(false);
        }
      }
    };

    loadDataset();
  }, [datasetId, getDatasetById]);

  // Effect to convert dataset to chart data when dataset is loaded
  useEffect(() => {
    if (dataset && dataset.headers && dataset.headers.length > 0) {
      try {
        // Check if headers contain data
        const headersWithData = dataset.headers.filter(
          (h: any) => Array.isArray(h.data) && h.data.length > 0
        );

        if (headersWithData.length > 0) {
          const validHeaders = headersWithData.map((h: any) => ({
            name: h.name,
            type: h.type,
            index: h.index,
            data: h.data as (string | number)[],
          }));

          const convertedData = convertDatasetToChartFormat(validHeaders);

          if (convertedData.length > 0) {
            setChartData(convertedData);
            return;
          }

          console.warn(
            '❌ [Dataset] Conversion resulted in empty data - convertedData:',
            convertedData
          );
        }

        // Fallback: if dataset has row data, convert it
        if (Array.isArray((dataset as any).rows)) {
          const headerNames = dataset.headers.map((h: any) => h.name);
          const rows = (dataset as any).rows;
          const arrayFormat = [headerNames, ...rows];
          const convertedData = convertArrayToChartData(arrayFormat);

          if (convertedData.length > 0) {
            setChartData(convertedData);
            return;
          }
        }

        // No valid data
        setChartData([]);
      } catch (error) {
        console.error('⚠️ [Dataset] Error processing dataset:', error);
        setChartData([]);
      }
    }
  }, [dataset, datasetId]);

  // ==================== EFFECTS: LOAD CHART ====================
  // Lấy data của chart khi mà có chart_id (mode edit)
  useEffect(() => {
    if (chartId && mode === 'edit' && !isInitialized) {
      if (!currentChart || currentChart.id !== chartId) {
        getChartById(chartId);
      } else {
        setIsInitialized(true);
      }
    } else if (mode === 'create' && !isInitialized) {
      // Initialize original values for create mode (empty values)
      setOriginalName('');
      setOriginalDescription('');
      setOriginalConfig(null);
      setOriginalChartType('line'); // Use default instead of currentChartType to avoid loop
      setIsInitialized(true);
    }
  }, [chartId, mode, getChartById, isInitialized, currentChart]);

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
        let structuredConfig: StructuredChartConfig;

        // Check if it's already in the correct format (has nested config property)
        if (
          (currentChart.config as Record<string, unknown>).config &&
          (currentChart.config as Record<string, unknown>).chartType
        ) {
          structuredConfig = currentChart.config as unknown as StructuredChartConfig;
        } else {
          // Convert to the correct format
          const originalSeriesConfigs = currentChart.config.seriesConfigs;

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
              // Include any additional config properties
              ...(currentChart.config.config && typeof currentChart.config.config === 'object'
                ? currentChart.config.config
                : {}),
              // Also include top-level config properties that might exist
              ...(currentChart.config.yAxisKeys
                ? { yAxisKeys: currentChart.config.yAxisKeys as any }
                : {}),
              ...(currentChart.config.xAxisLabel
                ? { xAxisLabel: currentChart.config.xAxisLabel as string }
                : {}),
              ...(currentChart.config.yAxisLabel
                ? { yAxisLabel: currentChart.config.yAxisLabel as string }
                : {}),
            },
            formatters: {
              ...((currentChart.config.formatters as Record<string, unknown>) || {}),
            },
            seriesConfigs: Array.isArray(originalSeriesConfigs) ? originalSeriesConfigs : [],
            chartType: currentChart.type || 'line',
          };
        }

        setChartConfig(structuredConfig);
        setOriginalConfig(structuredConfig);
      } else {
        console.log('⚠️ [Chart Config] No config found in currentChart');
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

  // Initialize for create mode
  useEffect(() => {
    if (mode === 'create' && !isInitialized) {
      // Get chart type name for display
      const chartTypeName = currentChartType.charAt(0).toUpperCase() + currentChartType.slice(1);

      // Initialize with default values for create mode
      setEditableName(`${chartTypeName} Chart`);
      setEditableDescription(`Chart created from ${chartTypeName.toLowerCase()} template`);

      // Create default chart configuration using helper function
      // Only initialize config once - don't recreate when dataset changes
      const defaultConfig = getDefaultChartConfig(currentChartType);

      setChartConfig(defaultConfig);
      setOriginalName('');
      setOriginalDescription('');
      setOriginalConfig(null);
      setOriginalChartType('line');
      setIsInitialized(true);
    }
  }, [mode, isInitialized, currentChartType]);

  // ==================== HANDLERS: NAME & DESCRIPTION ====================
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
      setValidationErrors(prev => ({ ...prev, description: true }));
      return;
    }

    // Clear validation error and exit editing mode
    setValidationErrors(prev => ({ ...prev, description: false }));
    setIsEditingDescription(false);
  };

  // ==================== HANDLERS: SAVE & RESET ====================
  // Handle save/create chart
  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      showError('Please fill in all required fields');
      return;
    }

    if (mode === 'create') {
      // Create new chart (Redux will handle loading state)
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

        const createData: CreateChartRequest = {
          name: editableName.trim(),
          description: editableDescription.trim(),
          datasetId: datasetId || '', // Use empty string instead of null for optional field
          type: currentChartType,
          config: chartConfig as unknown as CreateChartRequest['config'],
        };

        const result = await createChart(createData).unwrap();

        showSuccess('Chart created successfully');

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
        showError('Failed to create chart ' + errorMessage);
      }
    } else if (mode === 'edit' && chartId && currentChart) {
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
            setOriginalName(editableName.trim() || currentChart.name || '');
            setOriginalDescription(editableDescription.trim() || currentChart.description || '');
            setOriginalConfig(chartConfig);
            setOriginalChartType(currentChartType);
            showSuccess('Chart updated successfully');
          } else {
            showError('Failed to update chart');
          }
        } catch (error) {
          showError('Failed to update chart');
          throw error; // Re-throw to let modal handle loading state
        }
      });
    }
  };

  // Reset lại giá trị của chart config
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

          showSuccess('Chart reset to original values');
        } catch (error) {
          console.error('Error resetting chart:', error);
          showError('Failed to reset chart');
        }
      });
    }
  };

  // ==================== HANDLERS: DATASET ====================
  // Handle dataset upload from modal
  const handleDatasetCreated = (dataset: any) => {
    // Set the new dataset
    setDataset(dataset);

    // Update the chart data from the new dataset if it has headers
    if (dataset.headers && dataset.headers.length > 0) {
      const validHeaders = dataset.headers
        .filter((h: any) => h.data && h.data.length > 0)
        .map((h: any) => ({
          name: h.name,
          type: h.type,
          index: h.index,
          data: h.data as (string | number)[],
        }));

      if (validHeaders.length > 0) {
        const convertedData = convertDatasetToChartFormat(validHeaders);
        if (convertedData.length > 0) {
          setChartData(convertedData);
        }
      }
    } else {
      console.log('No headers found in uploaded dataset, keeping sample data');
    }

    // Close modal
    setShowDatasetUploadModal(false);
    showSuccess(t('dataset_upload_success', 'Dataset uploaded successfully'));
  };

  // Wrapper function for createDataset to match expected interface
  const handleCreateDataset = async (data: any) => {
    const result = await createDataset(data).unwrap();
    return result;
  };

  // Handle dataset selection from modal
  const handleDatasetSelected = async (datasetId: string) => {
    if (!datasetId) {
      // User chose to skip dataset selection, keep chartData empty
      setDataset(undefined);
      setChartData([]);
      setShowDatasetModal(false);
      showError('Please select a dataset to create chart');
      return;
    }

    try {
      const selectedDataset = await getDatasetById(datasetId).unwrap();

      // Update the current dataset - this will update dataset table in UnifiedChartEditor
      setDataset(selectedDataset);

      // Update chart data from the new dataset if it has headers
      if (selectedDataset.headers && selectedDataset.headers.length > 0) {
        const validHeaders = selectedDataset.headers
          .filter((h: any) => h.data && h.data.length > 0)
          .map((h: any) => ({
            name: h.name,
            type: h.type,
            index: h.index,
            data: h.data as (string | number)[],
          }));

        if (validHeaders.length > 0) {
          const convertedData = convertDatasetToChartFormat(validHeaders);
          if (convertedData.length > 0) {
            setChartData(convertedData);
          } else {
            setChartData([]);
          }
        } else {
          setChartData([]);
        }
      } else {
        setChartData([]);
      }

      setShowDatasetModal(false);
      showSuccess(t('dataset_select_success', 'Dataset selected successfully'));
    } catch (error) {
      console.error('[ChartEditor] getDatasetById error:', error);
      showError(t('dataset_select_error', 'Failed to load selected dataset'));
    }
  };

  // ==================== HANDLERS: CHART CONFIG ====================
  // Handle config changes from chart editors
  const handleConfigChange = useCallback(
    (newConfig: unknown) => {
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

  // ==================== HANDLERS: NAVIGATION ====================
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

  // ==================== HANDLERS: CHART NOTES ====================
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

  // ==================== EFFECTS: CHART NOTES ====================
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

  // ==================== EFFECTS: CLEANUP ====================
  // Clear current chart when component unmounts to prevent stale data
  useEffect(() => {
    return () => {
      clearCurrent();
    };
  }, [clearCurrent]);

  // ==================== HANDLERS: CHART TYPE ====================
  // Handle chart type change
  const handleChartTypeChange = (type: string) => {
    const newType = type as ChartType;
    setCurrentChartType(newType);
  };
  // ==================== RENDER HELPERS ====================

  // Show loading state for edit mode when waiting for chart data
  // OR when waiting for dataset to load in create mode
  const shouldShowLoading =
    (mode === 'edit' &&
      chartId &&
      (loading ||
        creating || // Also check creating state
        !currentChart ||
        currentChart.id !== chartId ||
        !isInitialized)) ||
    (mode === 'create' && datasetId && isLoadingDataset); // Wait for dataset in create mode

  // Debug logging
  console.log('🔍 Loading check:', {
    mode,
    chartId,
    datasetId,
    loading,
    creating,
    isLoadingDataset,
    hasCurrentChart: !!currentChart,
    currentChartId: currentChart?.id,
    isInitialized,
    shouldShowLoading,
  });

  if (shouldShowLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {mode === 'create' && isLoadingDataset
              ? t('loading_dataset', 'Loading dataset...')
              : t('loading_chart', 'Loading chart...')}
          </p>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDatasetUploadModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Dataset
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
          <UnifiedChartEditor
            key={`chart-editor-${resetTrigger}-${dataset?.id || 'no-dataset'}`}
            initialArrayData={(() => {
              // Use converted chartData only - no fallback to sample

              if (chartData.length > 0) {
                const convertedArray = convertChartDataToArray(chartData);

                if (convertedArray.length > 0) {
                  return convertedArray;
                } else {
                  return undefined;
                }
              } else {
                return undefined;
              }
            })()}
            initialChartType={currentChartType}
            initialStructuredConfig={(() => {
              return chartConfig || undefined;
            })()}
            onConfigChange={handleConfigChange}
            onChartTypeChange={handleChartTypeChange}
            dataset={dataset}
            allowChartTypeChange={mode === 'edit'}
            validationErrors={validationErrors}
            onValidationChange={noOpCallback}
          />
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
        currentDatasetId={dataset?.id || datasetId || ''}
      />

      {/* Dataset Upload Modal */}
      <DatasetUploadModal
        open={showDatasetUploadModal}
        onOpenChange={setShowDatasetUploadModal}
        onDatasetCreated={handleDatasetCreated}
        createDataset={handleCreateDataset}
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
