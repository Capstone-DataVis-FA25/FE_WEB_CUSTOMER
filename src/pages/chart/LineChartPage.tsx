import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import D3LineChart from '@/components/charts/D3LineChart';
import { motion } from 'framer-motion';
import { BarChart3, Download, RefreshCw } from 'lucide-react';
import { salesData } from './data';

const LineChartPage: React.FC = () => {
  const currentDataConfig = {
    data: salesData,
    xKey: 'month',
    yKeys: ['ecommerce', 'retail', 'wholesale'],
    title: 'Monthly Sales by Channel',
    xLabel: 'Month',
    yLabel: 'Sales Revenue (VND)',
    colors: {
      ecommerce: { light: "#16a34a", dark: "#22c55e" },
      retail: { light: "#9333ea", dark: "#a855f7" },
      wholesale: { light: "#c2410c", dark: "#ea580c" },
    }
  };

  const getStatistics = () => {
    const data = currentDataConfig.data;
    const yKeys = currentDataConfig.yKeys;
    
    const stats = yKeys.map(key => {
      const values = data.map(d => d[key] as number);
      const total = values.reduce((sum, val) => sum + val, 0);
      const average = total / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const growth = ((values[values.length - 1] - values[0]) / values[0]) * 100;
      
      return {
        key,
        average: Math.round(average),
        max,
        min,
        growth: Math.round(growth * 100) / 100,
        total: Math.round(total),
      };
    });
    
    return stats;
  };

  const statistics = getStatistics();

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                D3.js Line Chart Visualization
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Interactive data visualization with D3.js
              </p>
            </motion.div>

          {/* Dataset Selection */}
          {/* Removed dataset selection - now only shows sales data */}

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {statistics.map((stat) => (
              <Card key={stat.key} className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {stat.key}
                    </h3>
                    <div className={`w-4 h-4 rounded-full bg-blue-500`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stat.average.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Growth:</span>
                      <span className={`font-medium ${
                        stat.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.growth >= 0 ? '+' : ''}{stat.growth}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentDataConfig.title}
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <D3LineChart
                  data={currentDataConfig.data}
                  xAxisKey={currentDataConfig.xKey}
                  yAxisKeys={currentDataConfig.yKeys}
                  colors={currentDataConfig.colors}
                  title=""
                  xAxisLabel={currentDataConfig.xLabel}
                  yAxisLabel={currentDataConfig.yLabel}
                  width={900}
                  height={500}
                  showLegend={true}
                  showGrid={true}
                  showPoints={true}
                  animationDuration={1500}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  D3.js Features
                </h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    'Smooth Animations',
                    'Interactive Tooltips',
                    'Responsive Design',
                    'Theme Support',
                    'Data Binding',
                    'SVG Rendering',
                    'Custom Scales',
                    'Event Handling'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
  );
};

export default LineChartPage;
