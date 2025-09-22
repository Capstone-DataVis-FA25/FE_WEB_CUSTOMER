import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LineChartEditor from '@/components/charts/LineChartEditor';
import BarChartEditor from '@/components/charts/BarChartEditor';
import AreaChartEditor from '@/components/charts/AreaChartEditor';
import { salesData } from '@/components/charts/data/data';
import { useDataset } from '@/features/dataset/useDataset';
import type { Dataset } from '@/features/dataset/datasetAPI';
import { convertArrayToChartData } from '@/utils/dataConverter';
import { useCharts } from '@/features/charts/useCharts';
import { Database, BarChart3, ArrowLeft, Save, AlertCircle, Calendar, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Chart } from '@/features/charts/chartTypes';
import { convertBackendDataToChartData } from '@/utils/dataConverter';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import Utils from '@/utils/Utils';

const ChartEditorPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getDatasetById } = useDataset();
  const [_, setLoading] = useState(false);
  const [dataset, setDataset] = useState<Dataset | null>(null);

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
  console.log('ChartEditorPage - Full location object:', location);
  console.log('ChartEditorPage - locationState:', locationState);
  console.log('ChartEditorPage - URL searchParams:', Object.fromEntries(searchParams));

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
  const [chartConfig, setChartConfig] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Edit mode states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editableDescription, setEditableDescription] = useState('');

  // Fetch chart data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && chartId && !isInitialized) {
      getChartById(chartId);
    } else if (mode === 'create') {
      setIsInitialized(true);
    }
  }, [chartId, mode, getChartById, isInitialized]);

  // Update local state when chart data is loaded
  useEffect(() => {
    if (currentChart && mode === 'edit' && !isInitialized) {
      // Load chart configuration
      if (currentChart.config) {
        setChartConfig(currentChart.config);
      }

      // Initialize editable fields
      setEditableName(currentChart.name || '');
      setEditableDescription(currentChart.description || '');

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
            data: any[];
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
  const convertDatasetToChartFormat = (headers: any[]) => {
    try {
      if (!headers || headers.length === 0) return [];

      // Validate that headers have the required structure
      const validHeaders = headers.filter(
        h => h && typeof h === 'object' && h.name && Array.isArray(h.data) && h.data.length > 0
      );

      if (validHeaders.length === 0) return [];

      // Use the convertBackendDataToChartData utility function
      return convertBackendDataToChartData(validHeaders, {
        headerTransform: (header: string) => header,
        skipEmptyRows: true,
        defaultValue: 0,
        validateTypes: true,
      });
    } catch (error) {
      console.error('Error converting dataset to chart format:', error);
      return [];
    }
  };

  // Handle name edit
  const handleNameSave = async () => {
    if (mode === 'edit' && chartId && currentChart && editableName.trim()) {
      try {
        const updateData = {
          name: editableName.trim(),
          description: currentChart.description,
          config: currentChart.config,
        };

        await updateChart(chartId, updateData);
        setIsEditingName(false);
      } catch (error) {
        console.error('Error updating chart name:', error);
      }
    }
  };

  // Handle description edit
  const handleDescriptionSave = async () => {
    if (mode === 'edit' && chartId && currentChart) {
      try {
        const updateData = {
          name: currentChart.name,
          description: editableDescription.trim(),
          config: currentChart.config,
        };

        await updateChart(chartId, updateData);
        setIsEditingDescription(false);
      } catch (error) {
        console.error('Error updating chart description:', error);
      }
    }
  };

  // Handle save/update
  const handleSave = async (updatedConfig: any) => {
    if (mode === 'edit' && chartId && currentChart) {
      try {
        const updateData = {
          name: editableName || currentChart.name,
          description: editableDescription || currentChart.description,
          config: updatedConfig,
        };

        await updateChart(chartId, updateData);
        // Show success message or handle success
      } catch (error) {
        console.error('Error updating chart:', error);
        // Handle error
      }
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/workspace/charts');
  };

  // Show loading state
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

  // Show error state
  if (error && mode === 'edit') {
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
    // Use loaded config if available, otherwise use defaults
    if (chartConfig && mode === 'edit') {
      return {
        ...chartConfig,
        // Ensure required fields are present
        width: chartConfig.width || 800,
        height: chartConfig.height || 400,
        showLegend: chartConfig.showLegend !== undefined ? chartConfig.showLegend : true,
        showGrid: chartConfig.showGrid !== undefined ? chartConfig.showGrid : true,
        showPoints: chartConfig.showPoints !== undefined ? chartConfig.showPoints : true,
        animationDuration: chartConfig.animationDuration || 1000,
        curve: chartConfig.curve || 'curveMonotoneX',
        margin: chartConfig.margin || { top: 20, right: 40, bottom: 60, left: 80 },
      };
    }

    // Default configuration for create mode or fallback
    const baseConfig = {
      title: currentChart?.name || t('chart_editor_title', 'Financial Data Analysis'),
      xAxisLabel: t('chart_editor_xAxisLabel', 'Month'),
      yAxisLabel: t('chart_editor_yAxisLabel', 'Revenue ($)'),
      xAxisKey: 'month',
      yAxisKeys: ['ecommerce', 'retail', 'wholesale'],
      width: 800,
      height: 400,
      showLegend: true,
      showGrid: true,
      showPoints: true,
      animationDuration: 1000,
      curve: 'curveMonotoneX' as const,
      margin: { top: 20, right: 40, bottom: 60, left: 80 },
    };

    // Add chart-type specific configurations based on typeChart
    switch (typeChart) {
      case 'line':
        return {
          ...baseConfig,
          lineType: 'basic',
          curveType: 'curveMonotoneX',
          strokeWidth: 2,
          showPoints: true,
        };
      case 'bar':
      case 'column':
        return {
          ...baseConfig,
          barType: 'grouped',
          barWidth: 0.8,
          barGap: 0.2,
          showValues: true,
          showPoints: false, // bars don't show points
        };
      case 'area':
        return {
          ...baseConfig,
          areaType: 'basic',
          fillOpacity: 0.6,
          curveType: 'curveMonotoneX',
          strokeWidth: 2,
          showPoints: false,
        };
      case 'pie':
        return {
          ...baseConfig,
          pieType: 'basic',
          innerRadius: 0,
          showLabels: true,
          showPercentages: true,
          showPoints: false, // pie charts don't show points
          showGrid: false, // pie charts don't have grid
        };
      case 'donut':
        return {
          ...baseConfig,
          donutType: 'basic',
          innerRadius: 50,
          showLabels: true,
          showPercentages: true,
          showPoints: false,
          showGrid: false,
        };
      case 'scatter':
        return {
          ...baseConfig,
          scatterType: 'basic',
          showPoints: true,
          strokeWidth: 0,
          enableZoom: true,
          enablePan: true,
        };
      case 'bubble':
        return {
          ...baseConfig,
          bubbleType: 'basic',
          showPoints: true,
          strokeWidth: 0,
          enableZoom: true,
          enablePan: true,
        };
      case 'heatmap':
        return {
          ...baseConfig,
          heatmapType: 'grid',
          colorScheme: 'blues',
          showGrid: false,
          showPoints: false,
        };
      case 'radar':
        return {
          ...baseConfig,
          radarType: 'polygon',
          fillOpacity: 0.2,
          strokeWidth: 2,
          showPoints: true,
          showGrid: false,
        };
      default:
        return baseConfig;
    }
  };

  const getChartFormatters = () => ({
    useYFormatter: true,
    useXFormatter: true,
    yFormatterType: 'number' as const,
    xFormatterType: 'number' as const,
    customYFormatter: '',
    customXFormatter: '',
  });

  // Convert dataset to chart data format (string | number)[][]
  const convertDatasetToChartData = (dataset: Dataset): (string | number)[][] => {
    if (!dataset.headers || dataset.headers.length === 0) {
      return salesData; // Fallback to sample data
    }

    // Create header row
    const headerRow = dataset.headers.map(h => h.name);

    // Create data rows
    const dataRows: (string | number)[][] = [];

    // Create data rows
    for (let i = 0; i < dataset.rowCount; i++) {
      const row: (string | number)[] = [];
      dataset.headers.forEach(header => {
        const cellValue = header.data?.[i] ?? '';
        row.push(cellValue);
      });
      dataRows.push(row);
    }

    // Combine header and data rows
    const chartData = [headerRow, ...dataRows];

    console.log('Converted chart data:', chartData);
    return chartData;
  };

  // Render the appropriate chart editor based on type
  const renderChartEditor = () => {
    // Use passed dataset or loaded dataset
    const currentDataset = dataset || passedDataset;
    const chartData = currentDataset ? convertDatasetToChartData(currentDataset) : salesData;

    const config = getChartConfig();
    const formatters = getChartFormatters();

    // Common props for all chart editors - convert ChartDataPoint[] to array format
    const arrayData = chartData.length > 0 ? chartData : [];
    console.log('arrayData', arrayData);
    const commonProps = {
      initialArrayData: arrayData,
      initialConfig: config,
      initialFormatters: formatters,
      title: config.title,
      description:
        mode === 'edit' && currentChart
          ? `${t('chart_editor_editing', 'Editing')}: ${currentChart.name}`
          : undefined,
    };

    switch (typeChart.toLowerCase()) {
      case 'line':
        return (
          <LineChartEditor
            {...commonProps}
            description={
              commonProps.description ||
              t(
                'chart_editor_line_desc',
                'Interactive line chart editor with customizable settings'
              )
            }
          />
        );
      case 'bar':
        return (
          <BarChartEditor
            {...commonProps}
            initialConfig={{
              ...config,
              barType: 'grouped' as const,
            }}
            description={
              commonProps.description ||
              t('chart_editor_bar_desc', 'Interactive bar chart editor with customizable settings')
            }
          />
        );
      case 'area':
        return (
          <AreaChartEditor
            {...commonProps}
            description={
              commonProps.description ||
              t(
                'chart_editor_area_desc',
                'Interactive area chart editor with customizable settings'
              )
            }
          />
        );
      default:
        // Default to bar chart if type is not recognized
        return (
          <BarChartEditor
            initialArrayData={chartData}
            initialConfig={{
              ...config,
              barType: 'grouped' as const,
            }}
            initialFormatters={formatters}
            title={config.title}
            description={t(
              'chart_editor_bar_desc',
              'Interactive bar chart editor with customizable settings'
            )}
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
                  {mode === 'edit' && currentChart ? (
                    <div className="flex items-center gap-2">
                      {isEditingName ? (
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
                                setEditableName(currentChart.name || '');
                                setIsEditingName(false);
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <h1
                          className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => {
                            setEditableName(currentChart.name || '');
                            setIsEditingName(true);
                          }}
                        >
                          {currentChart.name}
                        </h1>
                      )}
                    </div>
                  ) : (
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t('chart_editor_title_main', 'Chart Editor')}
                    </h1>
                  )}
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <BarChart3 className="w-3 h-3" />
                    {chartInfo.name}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {mode === 'edit' && currentChart && (
                    <div className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t('description', 'Description')}:
                      </span>
                      {isEditingDescription ? (
                        <Input
                          value={editableDescription}
                          onChange={e => setEditableDescription(e.target.value)}
                          className="w-200 text-xl font-bold bg-transparent border-dashed border-gray-300 px-2 py-1"
                          onBlur={handleDescriptionSave}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              handleDescriptionSave();
                            } else if (e.key === 'Escape') {
                              setEditableDescription(currentChart.description || '');
                              setIsEditingDescription(false);
                            }
                          }}
                          placeholder="Click to add description..."
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => {
                            setEditableDescription(currentChart.description || '');
                            setIsEditingDescription(true);
                          }}
                          style={{ fontWeight: '500', fontSize: '14px' }}
                        >
                          {currentChart.description || 'Click to add description...'}
                        </span>
                      )}
                    </div>
                  )}

                  {(datasetId || currentChart?.datasetId) && !(mode === 'edit' && currentChart) && (
                    <div
                      className="flex items-center gap-1 text-xs"
                      style={{ fontWeight: '500', fontSize: '14px' }}
                    >
                      <Database className="w-3 h-3" />
                      {t('description', 'Description')}: {datasetId || currentChart?.description}
                    </div>
                  )}

                  {mode === 'edit' && currentChart && (
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
                <Button
                  size="sm"
                  onClick={() => handleSave(getChartConfig())}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4" />
                  {t('common_save', 'Save')}
                </Button>
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
    </div>
  );
};

export default ChartEditorPage;
