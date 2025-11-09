import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import ChartRenderer from './ChartRenderer';
import { useChartEditorRead } from '@/features/chartEditor';
import { useDataset } from '@/features/dataset/useDataset';

const ChartDisplaySection: React.FC = () => {
  const { chartData, chartConfig, currentChartType: chartType } = useChartEditorRead();
  const { currentDataset } = useDataset();
  // Helper: Map DataHeader ID to name
  const dataHeaders = currentDataset?.headers || [];
  const getHeaderName = (id: string) => {
    const header = dataHeaders.find((h: { id: string; name: string }) => h.id === id);
    return header ? header.name : id;
  };

  return (
    <div className="lg:col-span-6 space-y-6">
      {/* Chart Display Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="sticky top-4 z-10"
      >
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border-0 shadow-2xl">
          <CardContent className="p-6">
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <ChartRenderer
                chartType={chartType ?? ''}
                chartConfig={chartConfig}
                chartData={chartData}
                getHeaderName={getHeaderName}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default React.memo(ChartDisplaySection);
