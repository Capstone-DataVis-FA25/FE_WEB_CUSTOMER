import React from 'react';
import AreaChartEditor from '../AreaChartEditor';

// Sample data for area chart demo (as array format)
// const sampleArrayData = [
//   ['month', 'sales', 'marketing', 'support'],
//   [1, 120, 80, 40],
//   [2, 150, 95, 55],
//   [3, 180, 110, 70],
//   [4, 200, 125, 85],
//   [5, 165, 100, 60],
//   [6, 220, 140, 95],
//   [7, 250, 160, 110],
//   [8, 280, 180, 130],
//   [9, 310, 200, 145],
//   [10, 290, 185, 125],
//   [11, 320, 210, 155],
//   [12, 350, 230, 170],
// ];

const AreaChartEditorDemo: React.FC = () => {
  return (
    <AreaChartEditor
    // initialArrayData={sampleArrayData}
    // initialConfig={{
    //   title: 'Monthly Department Performance',
    //   xAxisLabel: 'Month',
    //   yAxisLabel: 'Performance Value',
    //   xAxisKey: 'month',
    //   yAxisKeys: ['sales', 'marketing', 'support'],
    //   width: 800,
    //   height: 500,
    //   showLegend: true,
    //   showGrid: true,
    //   showPoints: false,
    //   showStroke: true,
    //   opacity: 0.7,
    //   stackedMode: false,
    //   animationDuration: 1200,
    // }}
    // initialColors={{
    //   sales: { light: '#3b82f6', dark: '#60a5fa' },
    //   marketing: { light: '#f97316', dark: '#fb923c' },
    //   support: { light: '#10b981', dark: '#34d399' },
    // }}
    />
  );
};

export default AreaChartEditorDemo;
