import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import D3BarChart from '@/components/charts/D3BarChart';
import { motion } from 'framer-motion';
import { salesData } from '../data/data';

const BarChartPage: React.FC = () => {
  const currentDataConfig = {
    data: salesData,
    xKey: 'month',
    yKeys: ['ecommerce', 'retail', 'wholesale'],
    title: 'Monthly Sales by Channel',
    xLabel: 'Month',
    yLabel: 'Sales Revenue (VND)',
    colors: {
      ecommerce: { light: '#16a34a', dark: '#22c55e' },
      retail: { light: '#9333ea', dark: '#a855f7' },
      wholesale: { light: '#c2410c', dark: '#ea580c' },
    },
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="container mx-auto px-4">
        {/* HIỆN CHART COMPONENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <D3BarChart
                arrayData={currentDataConfig.data}
                xAxisKey={currentDataConfig.xKey}
                yAxisKeys={currentDataConfig.yKeys}
                colors={currentDataConfig.colors}
                title=""
                xAxisLabel={currentDataConfig.xLabel}
                yAxisLabel={currentDataConfig.yLabel}
                showLegend={false}
                showGrid={true}
                animationDuration={1500}
                barType="grouped"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BarChartPage;
