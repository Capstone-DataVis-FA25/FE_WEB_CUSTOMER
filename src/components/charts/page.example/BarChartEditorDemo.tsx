import React from 'react';
import BarChartEditor from '@/components/charts/BarChartEditor';
import { datasets } from '../data/data';

const BarChartEditorDemo: React.FC = () => {
  const initialConfig = {
    title: 'Monthly Sales Performance',
    xAxisLabel: 'Month',
    yAxisLabel: 'Sales Revenue (VND)',
    barType: 'grouped' as const,
  };

  const initialColors = {
    ecommerce: { light: '#16a34a', dark: '#22c55e' },
    retail: { light: '#9333ea', dark: '#a855f7' },
    wholesale: { light: '#c2410c', dark: '#ea580c' },
  };

  return (
    <BarChartEditor
      initialData={datasets.sales.data}
      initialConfig={initialConfig}
      initialColors={initialColors}
      title="BarChart Editor Demo"
      description="Interactive demonstration of the BarChart editor component"
    />
  );
};

export default BarChartEditorDemo;
