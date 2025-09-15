import React from 'react';
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
        {/* Overlapped Areas */}
        <div className="space-y-6">
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
      </div>
    </div>
  );
};

export default AreaChartPage;
