import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LineChartEditor from '@/components/charts/LineChartEditor';
import BarChartEditor from '@/components/charts/BarChartEditor';
import AreaChartEditor from '@/components/charts/AreaChartEditor';
import { salesData } from '@/components/charts/data/data';
import { useDataset } from '@/features/dataset/useDataset';
import type { Dataset } from '@/features/dataset/datasetAPI';
import { convertArrayToChartData, convertChartDataToArray } from '@/utils/dataConverter';
import { useCharts } from '@/features/charts/useCharts';
import {
  Database,
  BarChart3,
  ArrowLeft,
  Save,
  AlertCircle,
  Calendar,
  Clock,
  RotateCcw,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Chart } from '@/features/charts/chartTypes';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import { useToast } from '@/hooks/useToast';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { useModalConfirm } from '@/hooks/useModal';
import Utils from '@/utils/Utils';

const ChartEditorPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getDatasetById } = useDataset();
  const { showSuccess, showError } = useToast();
  const modalConfirm = useModalConfirm();
  const [, setLoading] = useState(false);
  const [dataset, setDataset] = useState<Dataset | undefined>(undefined);

  // Get parameters from location state (priority) or URL parameters (fallback)
  const locationState = location.state as {
    datasetId?: string;
    datasetName?: string;
    chartType?: string; // preferred key
    typeChart?: string; // legacy support from some callers
    dataset?: Dataset;
  } | null;

  // Priority: location state > URL parameters > defaults
  const datasetId = locationState?.datasetId || searchParams.get('datasetId') || '';
  const datasetName = locationState?.datasetName || '';
  const typeChart = (
    locationState?.chartType ||
    locationState?.typeChart ||
    searchParams.get('typeChart') ||
    'bar'
  ).toLowerCase();
  const passedDataset = locationState?.dataset;

  console.log('ChartEditorPage received parameters:', {
    datasetId,
    datasetName,
    typeChart,
    passedDataset,
  });

  // Load dataset if not passed directly and we have a datasetId
  useEffect(() => {
    const loadDataset = async () => {
      // If dataset is passed directly, use it
      if (passedDataset) {
        console.log('Using passed dataset:', passedDataset);
        setDataset(passedDataset);
        return;
      }

      // If we have a datasetId, fetch it
      if (datasetId) {
        console.log('Loading dataset by ID:', datasetId);
        setLoading(true);
        try {
          const result = await getDatasetById(datasetId).unwrap();
          console.log('Dataset loaded:', result);
          setDataset(result);
        } catch (error) {
          console.error('Failed to load dataset:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDataset();
  }, [datasetId, passedDataset, getDatasetById]);
  const { currentChart, loading, error, getChartById, updateChart, clearChartError } = useCharts();

  // Get parameters from URL
  const chartId = searchParams.get('chartId');
  // const typeChart = searchParams.get('typeChart') || 'line';
  const mode = searchParams.get('mode') || 'create'; // 'create' or 'edit'
  // const datasetId = searchParams.get('datasetId') || '';

  // Local state for managing chart data and config
  const [chartData, setChartData] = useState<ChartDataPoint[]>(
    () => convertArrayToChartData(salesData) // Convert salesData to ChartDataPoint[]
  );
  console.log(chartData);
  const [chartConfig, setChartConfig] = useState<Record<string, unknown> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Edit mode states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editableDescription, setEditableDescription] = useState('');

  // Original values for change tracking
  const [originalName, setOriginalName] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [originalConfig, setOriginalConfig] = useState<Record<string, unknown> | null>(null);

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    // Only check for changes if we're in edit mode and have initialized the original values
    if (mode !== 'edit' || !isInitialized) {
      return false;
    }

    const nameChanged = editableName !== originalName;
    const descriptionChanged = editableDescription !== originalDescription;

    // Handle config comparison more carefully
    const configChanged = (() => {
      // If both are null or undefined, no change
      if (!chartConfig && !originalConfig) return false;
      // If one is null and other isn't, there's a change
      if (!chartConfig || !originalConfig) return true;
      // Compare JSON strings
      return JSON.stringify(chartConfig) !== JSON.stringify(originalConfig);
    })();

    return nameChanged || descriptionChanged || configChanged;
  }, [
    editableName,
    originalName,
    editableDescription,
    originalDescription,
    chartConfig,
    originalConfig,
    mode,
    isInitialized,
  ]);

  // Fetch chart data when chartId is available (for both edit and view modes)
  useEffect(() => {
    if (chartId && !isInitialized) {
      getChartById(chartId);
    } else if (mode === 'create') {
      // Initialize original values for create mode (empty values)
      setOriginalName('');
      setOriginalDescription('');
      setOriginalConfig(null);
      setIsInitialized(true);
    }
  }, [chartId, mode, getChartById, isInitialized]);

  // Update local state when chart data is loaded
  useEffect(() => {
    if (currentChart && !isInitialized) {
      // Initialize editable fields first
      setEditableName(currentChart.name || '');
      setEditableDescription(currentChart.description || '');

      // Set original values for change tracking (before setting current values)
      setOriginalName(currentChart.name || '');
      setOriginalDescription(currentChart.description || '');
      setOriginalConfig(currentChart.config || null);

      // Load chart configuration after setting originals
      console.log('Current chart config:', currentChart.config);
      if (currentChart.config) {
        setChartConfig(currentChart.config);
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
  }, [currentChart, isInitialized]);

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

  // Handle name edit - just update state, don't save immediately
  const handleNameSave = () => {
    // Just exit editing mode, changes will be saved when user clicks Save button
    setIsEditingName(false);
  };

  // Handle description edit - just update state, don't save immediately
  const handleDescriptionSave = () => {
    // Just exit editing mode, changes will be saved when user clicks Save button
    setIsEditingDescription(false);
  };

  // Handle save/update with confirmation - saves all changes at once
  const handleSave = async (updatedConfig: Record<string, unknown>) => {
    if (mode === 'edit' && chartId && currentChart) {
      modalConfirm.openConfirm(async () => {
        try {
          const updateData = {
            name: editableName.trim() || currentChart.name,
            description: editableDescription.trim() || currentChart.description,
            configuration: updatedConfig,
          };

          await updateChart(chartId, updateData);

          // Update original values after successful save
          setOriginalName(editableName.trim() || currentChart.name || '');
          setOriginalDescription(editableDescription.trim() || currentChart.description || '');
          setOriginalConfig(updatedConfig);

          showSuccess(t('chart_updated', 'Chart updated successfully'));
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
      console.log('Config change received:', newConfig);
      console.log('Current mode:', mode);
      console.log('Previous config:', chartConfig);
      setChartConfig(newConfig as Record<string, unknown>);
    },
    [mode, chartConfig]
  );

  // Handle reset to original values
  const handleReset = () => {
    if (hasChanges) {
      modalConfirm.openConfirm(async () => {
        try {
          // Reset all values to original
          setEditableName(originalName);
          setEditableDescription(originalDescription);
          if (originalConfig) {
            setChartConfig(originalConfig);
          }

          showSuccess(t('chart_reset', 'Chart reset to original values'));
        } catch (error) {
          console.error('Error resetting chart:', error);
          showError(t('chart_reset_error', 'Failed to reset chart'));
        }
      });
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/workspace/charts');
  };

  // Show loading state - wait for chart data to load and config to be initialized
  if (loading && !isInitialized) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-muted-foreground">
            {t('chart_editor_loading', 'Loading chart...')}
          </p>
        </div>
      </div>
    );
  }

  // Show loading state when we have chartId but config is not ready yet
  if (chartId && !chartConfig && !loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-muted-foreground">
            {t('chart_editor_loading_config', 'Loading chart configuration...')}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && chartId) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('chart_editor_error_title', 'Error Loading Chart')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error ||
              t('chart_editor_error_message', 'Failed to load chart data. Please try again.')}
          </p>
          <div className="flex space-x-3 justify-center">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common_back', 'Back')}
            </Button>
            <Button
              onClick={() => {
                clearChartError();
                if (chartId) getChartById(chartId);
              }}
            >
              {t('common_retry', 'Retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Chart configuration based on type and loaded data
  const getChartConfig = () => {
    // Use loaded config if available, regardless of mode
    console.log('getChartConfig - current chartConfig state:', chartConfig);
    if (chartConfig) {
      const validCurves = [
        'curveMonotoneX',
        'curveLinear',
        'curveMonotoneY',
        'curveBasis',
        'curveCardinal',
        'curveCatmullRom',
        'curveStep',
        'curveStepBefore',
        'curveStepAfter',
      ] as const;
      const curve =
        typeof chartConfig.curve === 'string' &&
        validCurves.includes(chartConfig.curve as (typeof validCurves)[number])
          ? (chartConfig.curve as (typeof validCurves)[number])
          : ('curveMonotoneX' as const);

      const margin =
        chartConfig.margin &&
        typeof chartConfig.margin === 'object' &&
        'top' in chartConfig.margin &&
        'right' in chartConfig.margin &&
        'bottom' in chartConfig.margin &&
        'left' in chartConfig.margin
          ? (chartConfig.margin as { top: number; right: number; bottom: number; left: number })
          : { top: 20, right: 40, bottom: 60, left: 80 };

      return {
        ...chartConfig,
        // Ensure required fields are present with correct types
        width: typeof chartConfig.width === 'number' ? chartConfig.width : 800,
        height: typeof chartConfig.height === 'number' ? chartConfig.height : 400,
        showLegend: typeof chartConfig.showLegend === 'boolean' ? chartConfig.showLegend : true,
        showGrid: typeof chartConfig.showGrid === 'boolean' ? chartConfig.showGrid : true,
        showPoints: typeof chartConfig.showPoints === 'boolean' ? chartConfig.showPoints : true,
        animationDuration:
          typeof chartConfig.animationDuration === 'number' ? chartConfig.animationDuration : 1000,
        curve,
        margin,
      };
    }
    return {
      width: 800,
      height: 400,
      showLegend: true,
      showGrid: true,
      showPoints: true,
      animationDuration: 1000,
      curve: 'curveMonotoneX' as const,
      margin: { top: 20, right: 40, bottom: 60, left: 80 },
    };
  };

  const getChartFormatters = () => ({
    useYFormatter: true,
    useXFormatter: true,
    yFormatterType: 'number' as const,
    xFormatterType: 'number' as const,
    customYFormatter: '',
    customXFormatter: '',
  });

  // Render the appropriate chart editor based on type
  const renderChartEditor = () => {
    const config = getChartConfig();
    console.log('renderChartEditor - using config:', config);
    const formatters = getChartFormatters();

    // Common props for all chart editors - convert ChartDataPoint[] to array format
    const arrayData = chartData.length > 0 ? convertChartDataToArray(chartData) : [];
    console.log('Array data for chart editor:', arrayData);
    console.log('Chart config for editor:', config);
    const commonProps = {
      initialArrayData: arrayData,
      initialConfig: config,
      initialFormatters: formatters,
      onConfigChange: mode === 'edit' ? handleConfigChange : () => {}, // Disable config changes when not in edit mode
    };

    switch (typeChart.toLowerCase()) {
      case 'line':
        return <LineChartEditor {...commonProps} dataset={dataset} />;
      case 'bar':
        return (
          <BarChartEditor
            {...commonProps}
            initialConfig={{
              ...config,
              barType: 'grouped' as const,
            }}
          />
        );
      case 'area':
        return <AreaChartEditor {...commonProps} />;
      default:
        // Default to bar chart if type is not recognized
        return (
          <BarChartEditor
            initialArrayData={convertChartDataToArray(chartData)}
            initialConfig={{
              ...config,
              barType: 'grouped' as const,
            }}
            initialFormatters={formatters}
          />
        );
    }
  };

  const getChartTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
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

  const chartInfo = getChartTypeInfo(typeChart);

  if (loading) {
    return <LoadingSpinner />;
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
                          <div className="flex items-center gap-2">
                            <Input
                              value={editableName}
                              onChange={e => setEditableName(e.target.value)}
                              className="w-100 text-xl font-bold bg-transparent border-dashed border-gray-300 px-2 py-1"
                              onBlur={handleNameSave}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleNameSave();
                                } else if (e.key === 'Escape') {
                                  setEditableName(editableName); // Keep current value
                                  setIsEditingName(false);
                                }
                              }}
                              autoFocus
                            />
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
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <BarChart3 className="w-3 h-3" />
                    {chartInfo.name}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {currentChart && (
                    <div className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t('description', 'Description')}:
                      </span>
                      {isEditingDescription && mode === 'edit' ? (
                        <Input
                          value={editableDescription}
                          onChange={e => setEditableDescription(e.target.value)}
                          className="w-200 text-xl font-bold bg-transparent border-dashed border-gray-300 px-2 py-1"
                          onBlur={handleDescriptionSave}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              handleDescriptionSave();
                            } else if (e.key === 'Escape') {
                              setEditableDescription(editableDescription); // Keep current value
                              setIsEditingDescription(false);
                            }
                          }}
                          placeholder="Click to add description..."
                          autoFocus
                        />
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
                    onClick={() => handleSave(getChartConfig())}
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
        <div className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            {renderChartEditor()}
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ModalConfirm
        isOpen={modalConfirm.isOpen}
        onClose={modalConfirm.close}
        onConfirm={modalConfirm.confirm}
        loading={modalConfirm.isLoading}
        type="warning"
        title={t('chart_save_confirm_title', 'Save Changes')}
        message={t(
          'chart_save_confirm_message',
          'Are you sure you want to save these changes? This will update your chart configuration.'
        )}
        confirmText={t('common_save', 'Save')}
        cancelText={t('common_cancel', 'Cancel')}
      />
    </div>
  );
};

export default ChartEditorPage;
