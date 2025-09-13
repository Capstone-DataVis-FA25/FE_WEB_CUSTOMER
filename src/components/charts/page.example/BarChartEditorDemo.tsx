import React from 'react';
import BarChartEditor from '@/components/charts/BarChartEditor';
import { motion } from 'framer-motion';
import { salesData } from '../data/data';
import { useTranslation } from 'react-i18next';

const BarChartEditorDemo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="w-full">
        {/* Editor Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <BarChartEditor
            initialArrayData={salesData}
            initialConfig={{
              title: t('lineChart_editor_demo_financialData'),
              xAxisLabel: t('lineChart_editor_xAxisLabel'),
              yAxisLabel: t('lineChart_editor_yAxisLabel'),
              xAxisKey: 'month',
              yAxisKeys: ['ecommerce', 'retail', 'wholesale'],
              width: 800,
              height: 400,
              showLegend: true,
              showGrid: true,
              animationDuration: 1000,
              barType: 'grouped',
              margin: { top: 20, right: 40, bottom: 60, left: 80 },
            }}
            initialFormatters={{
              useYFormatter: true,
              useXFormatter: true,
              yFormatterType: 'number',
              xFormatterType: 'number',
              customYFormatter: '',
              customXFormatter: '',
            }}
            title={t('lineChart_editor_demo_financialData')}
            description={t('lineChart_editor_demo_financialDataDesc')}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default BarChartEditorDemo;
