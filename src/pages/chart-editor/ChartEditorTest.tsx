import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import LineChartEditorPage from './LineChartEditorPage';
import BarChartEditorPage from './BarChartEditorPage';
import AreaChartEditorPage from './AreaChartEditorPage';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Test component to verify chart editors work with sample data
 * This helps demonstrate that the fallback data pattern is working correctly
 */
const ChartEditorTest: React.FC = () => {
  const [activeChart, setActiveChart] = React.useState<'line' | 'bar' | 'area'>('line');

  const renderActiveChart = () => {
    switch (activeChart) {
      case 'line':
        return <LineChartEditorPage />;
      case 'bar':
        return <BarChartEditorPage />;
      case 'area':
        return <AreaChartEditorPage />;
      default:
        return null;
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-7xl mx-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Chart Editor Test</h1>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Testing chart editors with sample data fallback
            </p>

            {/* Chart Type Selector */}
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                variant={activeChart === 'line' ? 'default' : 'outline'}
                onClick={() => setActiveChart('line')}
              >
                Line Chart
              </Button>
              <Button
                variant={activeChart === 'bar' ? 'default' : 'outline'}
                onClick={() => setActiveChart('bar')}
              >
                Bar Chart
              </Button>
              <Button
                variant={activeChart === 'area' ? 'default' : 'outline'}
                onClick={() => setActiveChart('area')}
              >
                Area Chart
              </Button>
            </div>
          </CardHeader>

          <CardContent>{renderActiveChart()}</CardContent>
        </Card>
      </div>
    </BrowserRouter>
  );
};

export default ChartEditorTest;
