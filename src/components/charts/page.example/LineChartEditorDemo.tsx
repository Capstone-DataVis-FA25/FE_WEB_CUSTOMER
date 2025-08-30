import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LineChartEditor, {
  type LineChartConfig,
  type ColorConfig,
  type FormatterConfig,
} from '@/components/charts/LineChartEditor';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { salesData } from '../data/data';
import { useTranslation } from 'react-i18next';

const LineChartEditorDemo: React.FC = () => {
  const { t } = useTranslation();
  
  // State để lưu config hiện tại
  const [currentConfig, setCurrentConfig] = useState<LineChartConfig | null>(null);
  const [currentColors, setCurrentColors] = useState<ColorConfig | null>(null);
  const [currentData, setCurrentData] = useState<ChartDataPoint[]>(salesData);
  const [currentFormatters, setCurrentFormatters] = useState<FormatterConfig | null>(null);

  // Export demo config
  const exportDemoConfig = () => {
    if (!currentConfig || !currentColors || !currentFormatters) {
      alert('Please configure the chart first!');
      return;
    }

    const demoData = {
      config: currentConfig,
      colors: currentColors,
      data: currentData,
      formatters: currentFormatters,
      exportDate: new Date().toISOString(),
      description: 'LineChart Editor Demo Configuration',
    };

    const blob = new Blob([JSON.stringify(demoData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-line-chart-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('lineChart_editor_demo_title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {t('lineChart_editor_demo_description')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={exportDemoConfig} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t('lineChart_editor_demo_exportConfig')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Demo Info Cards */}
      <div className="container mx-auto px-4 py-6">        

        {/* Editor Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <LineChartEditor
            initialData={salesData}
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
              showPoints: true,
              animationDuration: 1000,
              curve: 'curveMonotoneX',
              margin: { top: 20, right: 40, bottom: 60, left: 80 },
            }}
            initialColors={{
              ecommerce: { light: '#16a34a', dark: '#22c55e' },
              retail: { light: '#9333ea', dark: '#a855f7' },
              wholesale: { light: '#c2410c', dark: '#ea580c' },
            }}
            initialFormatters={{
              useYFormatter: true,
              useXFormatter: false,
              yFormatterType: 'currency',
              xFormatterType: 'default',
              customYFormatter: '',
              customXFormatter: '',
            }}
            onConfigChange={setCurrentConfig}
            onDataChange={setCurrentData}
            onColorsChange={setCurrentColors}
            onFormattersChange={setCurrentFormatters}
            title={t('lineChart_editor_demo_financialData')}
            description={t('lineChart_editor_demo_financialDataDesc')}
          />
        </motion.div>

        {/* Current Configuration Display */}
        {currentConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8"
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('lineChart_editor_demo_currentConfig')}
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('lineChart_editor_demo_chartConfig')}
                    </h4>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm">
                      <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(currentConfig, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('lineChart_editor_demo_colorsFormatters')}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('lineChart_editor_demo_colors')}
                        </h5>
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs">
                          <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(currentColors, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('lineChart_editor_demo_formatters')}
                        </h5>
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs">
                          <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(currentFormatters, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LineChartEditorDemo;
