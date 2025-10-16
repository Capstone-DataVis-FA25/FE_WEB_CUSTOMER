import React from 'react';
import PieChartEditor from '@/components/charts/PieChartEditor';
import { categoryArrayData } from '../data/data';

const PieChartEditorDemo: React.FC = () => {
  return (
    <PieChartEditor
      initialArrayData={categoryArrayData}
      initialConfig={{
        title: 'Market Share by Category',
        labelKey: 'category',
        valueKey: 'value',
        width: 1200,
        height: 400,
        showTitle: true,
        showLegend: true,
        showLabels: true,
        showPercentage: true,
        showSliceValues: true,
        animationDuration: 1000,
        enableAnimation: false,
        innerRadius: 0,
        cornerRadius: 0,
        padAngle: 0,
        startAngle: 0,
        endAngle: 360,
        sortSlices: 'descending',
        sliceOpacity: 1,
        theme: 'auto',
        backgroundColor: 'transparent',
        titleFontSize: 22,
        titleColor: '',
        labelFontSize: 12,
        labelColor: '',
        legendFontSize: 12,
        legendPosition: 'bottom',
        legendMaxItems: 5,
        showTooltip: true,
        strokeWidth: 2,
        strokeColor: '',
        hoverScale: 1.05,
        enableHoverEffect: true,
        margin: { top: 60, right: 60, bottom: 60, left: 60 },
      }}
      initialFormatters={{
        useValueFormatter: true,
        valueFormatterType: 'number',
        customValueFormatter: '',
      }}
      initialColors={{
        Technology: { light: '#3b82f6', dark: '#60a5fa' },
        Healthcare: { light: '#ef4444', dark: '#f87171' },
        Finance: { light: '#10b981', dark: '#34d399' },
        Education: { light: '#f59e0b', dark: '#fbbf24' },
      }}
      dataset={undefined}
    />
  );
};

export default PieChartEditorDemo;
