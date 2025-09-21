import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import LineChartEditor from '@/components/charts/LineChartEditor';
import BarChartEditor from '@/components/charts/BarChartEditor';
import AreaChartEditor from '@/components/charts/AreaChartEditor';
import { salesData } from '@/components/charts/data/data';
import { useDataset } from '@/features/dataset/useDataset';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Database, BarChart3, Palette, Settings } from 'lucide-react';
import type { Dataset } from '@/features/dataset/datasetAPI';

const ChartEditorPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { getDatasetById } = useDataset();
  const [loading, setLoading] = useState(false);
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

  // Chart configuration based on type
  const getChartConfig = () => {
    const baseConfig = {
      title: t('chart_editor_title', 'Financial Data Analysis'),
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

    console.log('Rendering chart editor for type:', typeChart);

    switch (typeChart) {
      case 'line':
        return (
          <LineChartEditor
            initialArrayData={chartData}
            initialConfig={config}
            initialFormatters={formatters}
            title={config.title}
            description={t(
              'chart_editor_line_desc',
              'Interactive line chart editor with customizable settings'
            )}
          />
        );
      case 'bar':
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
      case 'area':
        return (
          <AreaChartEditor
            initialArrayData={chartData}
            initialConfig={config}
            initialFormatters={formatters}
            title={config.title}
            description={t(
              'chart_editor_area_desc',
              'Interactive area chart editor with customizable settings'
            )}
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
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col">
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('chart_editor_title_main', 'Chart Editor')}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <BarChart3 className="w-3 h-3" />
                    {chartInfo.name}
                  </Badge>
                  {datasetId && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <Database className="w-3 h-3" />
                      {t('dataset_id', 'Dataset')}: {datasetName || datasetId}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <Settings className="w-4 h-4" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <Palette className="w-4 h-4" />
              </motion.div>
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
