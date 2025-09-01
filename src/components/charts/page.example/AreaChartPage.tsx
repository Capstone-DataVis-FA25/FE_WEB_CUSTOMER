import React from 'react';
import * as d3 from 'd3';
import D3AreaChart from '../D3AreaChart';

// Sample data for area chart
const sampleData = [
  { month: 1, revenue: 120, expenses: 80, profit: 40 },
  { month: 2, revenue: 150, expenses: 95, profit: 55 },
  { month: 3, revenue: 180, expenses: 110, profit: 70 },
  { month: 4, revenue: 200, expenses: 125, profit: 75 },
  { month: 5, revenue: 165, expenses: 100, profit: 65 },
  { month: 6, revenue: 220, expenses: 140, profit: 80 },
  { month: 7, revenue: 250, expenses: 160, profit: 90 },
  { month: 8, revenue: 280, expenses: 180, profit: 100 },
  { month: 9, revenue: 310, expenses: 200, profit: 110 },
  { month: 10, revenue: 290, expenses: 185, profit: 105 },
  { month: 11, revenue: 320, expenses: 210, profit: 110 },
  { month: 12, revenue: 350, expenses: 230, profit: 120 },
];

const AreaChartPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-8">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Area Chart Examples
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Explore different area chart configurations and see how they visualize data trends over
            time.
          </p>
        </div>

        {/* Overlapped Areas */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Overlapped Area Chart
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Multiple data series overlapping to show individual trends
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <D3AreaChart
              data={sampleData}
              width={900}
              height={400}
              xAxisKey="month"
              yAxisKeys={['revenue', 'expenses', 'profit']}
              title="Monthly Financial Overview"
              xAxisLabel="Month"
              yAxisLabel="Amount ($K)"
              showLegend={true}
              showGrid={true}
              showPoints={false}
              showStroke={true}
              opacity={0.6}
              stackedMode={false}
              animationDuration={1500}
              colors={{
                revenue: { light: '#3b82f6', dark: '#60a5fa' },
                expenses: { light: '#ef4444', dark: '#f87171' },
                profit: { light: '#10b981', dark: '#34d399' },
              }}
              yAxisFormatter={value => `$${value}K`}
            />
          </div>
        </div>

        {/* Stacked Areas */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Stacked Area Chart
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Data series stacked to show cumulative effect and individual contributions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <D3AreaChart
              data={sampleData}
              width={900}
              height={400}
              xAxisKey="month"
              yAxisKeys={['profit', 'expenses']}
              title="Cumulative Business Metrics"
              xAxisLabel="Month"
              yAxisLabel="Cumulative Amount ($K)"
              showLegend={true}
              showGrid={true}
              showPoints={false}
              showStroke={true}
              opacity={0.8}
              stackedMode={true}
              animationDuration={1200}
              colors={{
                profit: { light: '#10b981', dark: '#34d399' },
                expenses: { light: '#f59e0b', dark: '#fbbf24' },
              }}
              yAxisFormatter={value => `$${value}K`}
            />
          </div>
        </div>

        {/* Single Area with Points */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Single Area with Data Points
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Focus on a single metric with interactive data points
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <D3AreaChart
              data={sampleData}
              width={900}
              height={350}
              xAxisKey="month"
              yAxisKeys={['revenue']}
              title="Monthly Revenue Trend"
              xAxisLabel="Month"
              yAxisLabel="Revenue ($K)"
              showLegend={false}
              showGrid={true}
              showPoints={true}
              showStroke={true}
              opacity={0.4}
              stackedMode={false}
              animationDuration={1000}
              curve={d3.curveCatmullRom}
              colors={{
                revenue: { light: '#8b5cf6', dark: '#a78bfa' },
              }}
              yAxisFormatter={value => `$${value}K`}
            />
          </div>
        </div>

        {/* Smooth Curves */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Smooth Curve Area Chart
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Using smooth curves for a more elegant visualization
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <D3AreaChart
              data={sampleData}
              width={900}
              height={400}
              xAxisKey="month"
              yAxisKeys={['revenue', 'profit']}
              title="Revenue vs Profit Analysis"
              xAxisLabel="Month"
              yAxisLabel="Financial Metrics ($K)"
              showLegend={true}
              showGrid={false}
              showPoints={false}
              showStroke={false}
              opacity={0.7}
              stackedMode={false}
              animationDuration={2000}
              curve={d3.curveBasis}
              colors={{
                revenue: { light: '#06b6d4', dark: '#67e8f9' },
                profit: { light: '#84cc16', dark: '#bef264' },
              }}
              yAxisFormatter={value => `$${value}K`}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Area Chart Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Responsive Design
              </h4>
              <p>Automatically adapts to different screen sizes and containers</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Multiple Modes</h4>
              <p>Support for both stacked and overlapped area visualizations</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Theme Support</h4>
              <p>Seamless light and dark theme integration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaChartPage;
