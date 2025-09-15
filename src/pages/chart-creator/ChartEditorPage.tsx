import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import LineChartEditor from '@/components/charts/LineChartEditor';
import BarChartEditor from '@/components/charts/BarChartEditor';
import AreaChartEditor from '@/components/charts/AreaChartEditor';
import { salesData } from '@/components/charts/data/data';
// import { convertArrayToChartData } from '@/utils/dataConverter';
import { Database, BarChart3, Palette, Settings } from 'lucide-react';

const ChartEditorPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Get parameters from URL
  const typeChart = searchParams.get('typeChart') || 'line';
  const datasetId = searchParams.get('datasetId') || '';

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

    return baseConfig;
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
    const formatters = getChartFormatters();

    switch (typeChart.toLowerCase()) {
      case 'line':
        return (
          <LineChartEditor
            initialArrayData={salesData}
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
            initialArrayData={salesData}
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
        // const convertedData = convertArrayToChartData(salesData);
        return (
          <AreaChartEditor
            initialArrayData={salesData}
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
        return (
          <LineChartEditor
            initialArrayData={salesData}
            initialConfig={config}
            initialFormatters={formatters}
            title={config.title}
            description={t(
              'chart_editor_default_desc',
              'Interactive chart editor with customizable settings'
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
                      {t('dataset_id', 'Dataset')}: {datasetId}
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
