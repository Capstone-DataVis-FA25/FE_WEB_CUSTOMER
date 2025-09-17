import React from 'react';
import D3AreaChart from '../D3AreaChart';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { sampleData } from '../data/data';

const AreaChartPage: React.FC = () => {
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
              <D3AreaChart
                data={sampleData}
                width={800}
                height={600}
                xAxisKey="month"
                yAxisKeys={['revenue', 'expenses', 'profit']}
                xAxisLabel="Month"
                yAxisLabel="Amount ($K)"
                showLegend={false}
                showGrid={true}
                showPoints={false}
                showStroke={true}
                opacity={0.6}
                stackedMode={false}
                animationDuration={1500}
                colors={{
                  revenue: { light: '#16a34a', dark: '#22c55e' },
                  expenses: { light: '#9333ea', dark: '#a855f7' },
                  profit: { light: '#c2410c', dark: '#ea580c' },
                }}
                yAxisFormatter={value => `$${value}K`}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AreaChartPage;
