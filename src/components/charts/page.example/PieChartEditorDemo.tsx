import React from 'react';
import PieChartEditor from '@/components/charts/PieChartEditor';
import { categoryArrayData } from '../data/data';
import { useTranslation } from 'react-i18next';

const PieChartEditorDemo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PieChartEditor
      initialArrayData={categoryArrayData}
      initialConfig={{
        title: t('pieChart_editor_demo_marketShare'),
        labelKey: 'category',
        valueKey: 'value',
        width: 600,
        height: 600,
        showTitle: true,
        showLegend: true,
        showLabels: true,
        showPercentage: true,
        showSliceValues: false,
        animationDuration: 1000,
        enableAnimation: true,
        innerRadius: 0, // 0 for pie chart, 0.5 for donut chart
        cornerRadius: 4,
        padAngle: 0.02,
        startAngle: 0,
        endAngle: 360,
        sortSlices: 'descending',
        sliceOpacity: 1,
        theme: 'auto',
        backgroundColor: 'transparent',
        titleFontSize: 20,
        titleColor: '',
        labelFontSize: 12,
        labelColor: '',
        legendFontSize: 12,
        legendPosition: 'right',
        legendMaxItems: 10,
        showTooltip: true,
        strokeWidth: 2,
        strokeColor: '',
        hoverScale: 1.05,
        enableHoverEffect: true,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
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
      dataset={undefined} // No dataset for demo, uses sample data
    />
  );
};

export default PieChartEditorDemo;
