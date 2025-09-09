import React from 'react';
import AreaChartEditor from '../AreaChartEditor';

// Sample data for area chart demo
const sampleData = [
  { month: 1, sales: 120, marketing: 80, support: 40 },
  { month: 2, sales: 150, marketing: 95, support: 55 },
  { month: 3, sales: 180, marketing: 110, support: 70 },
  { month: 4, sales: 200, marketing: 125, support: 85 },
  { month: 5, sales: 165, marketing: 100, support: 60 },
  { month: 6, sales: 220, marketing: 140, support: 95 },
  { month: 7, sales: 250, marketing: 160, support: 110 },
  { month: 8, sales: 280, marketing: 180, support: 130 },
  { month: 9, sales: 310, marketing: 200, support: 145 },
  { month: 10, sales: 290, marketing: 185, support: 125 },
  { month: 11, sales: 320, marketing: 210, support: 155 },
  { month: 12, sales: 350, marketing: 230, support: 170 },
];

const AreaChartEditorDemo: React.FC = () => {
  return (
    <AreaChartEditor
      initialData={sampleData}
      initialConfig={{
        title: 'Monthly Department Performance',
        xAxisLabel: 'Month',
        yAxisLabel: 'Performance Value',
        xAxisKey: 'month',
        yAxisKeys: ['sales', 'marketing', 'support'],
        width: 800,
        height: 500,
        showLegend: true,
        showGrid: true,
        showPoints: false,
        showStroke: true,
        opacity: 0.7,
        stackedMode: false,
        animationDuration: 1200,
      }}
      initialColors={{
        sales: { light: '#3b82f6', dark: '#60a5fa' },
        marketing: { light: '#f97316', dark: '#fb923c' },
        support: { light: '#10b981', dark: '#34d399' },
      }}
      title="Area Chart Configuration Studio"
      description="Design and customize beautiful area charts with real-time preview and advanced styling options"
    />
  );
};

export default AreaChartEditorDemo;
