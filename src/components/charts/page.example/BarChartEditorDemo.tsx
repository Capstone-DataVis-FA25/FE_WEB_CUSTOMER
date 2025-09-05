import React from 'react';
import BarChartEditor from '@/components/charts/BarChartEditor';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const BarChartDemo: React.FC = () => {
  const { t } = useTranslation();

  // Sample data for testing the bar chart
  const sampleData = [
    { month: 'Jan', sales: 1200, revenue: 3400, profit: 800 },
    { month: 'Feb', sales: 1900, revenue: 4200, profit: 1200 },
    { month: 'Mar', sales: 1500, revenue: 3800, profit: 1000 },
    { month: 'Apr', sales: 2200, revenue: 5100, profit: 1600 },
    { month: 'May', sales: 1800, revenue: 4300, profit: 1300 },
    { month: 'Jun', sales: 2600, revenue: 5800, profit: 2000 },
  ];

  const initialConfig = {
    title: t('barChart_editor_demo_financialData'),
    xAxisLabel: t('barChart_editor_xAxisLabel'),
    yAxisLabel: t('barChart_editor_yAxisLabel'),
    xAxisKey: 'month',
    yAxisKeys: ['sales', 'revenue', 'profit'],
    width: 800,
    height: 400,
    showLegend: true,
    showGrid: true,
    animationDuration: 1000,
    barType: 'grouped' as const,
    margin: { top: 20, right: 40, bottom: 60, left: 80 },
    fontSize: { axis: 12, label: 14, title: 16 },
  };

  const initialColors = {
    sales: { light: '#3b82f6', dark: '#60a5fa' },
    revenue: { light: '#f97316', dark: '#fb923c' },
    profit: { light: '#10b981', dark: '#34d399' },
  };

  const initialFormatters = {
    useYFormatter: true,
    useXFormatter: false,
    yFormatterType: 'number' as const,
    xFormatterType: 'number' as const,
    customYFormatter: '',
    customXFormatter: '',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-6">
        {/* Editor Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <BarChartEditor
            initialData={sampleData}
            initialConfig={initialConfig}
            initialColors={initialColors}
            initialFormatters={initialFormatters}
            title={t('barChart_editor_demo_financialData')}
            description={t('barChart_editor_demo_financialDataDesc')}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default BarChartDemo;
