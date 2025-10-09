import React from 'react';
import BarChartEditor from '@/components/charts/BarChartEditor';
import { salesData } from '../data/data';
import { useTranslation } from 'react-i18next';

const BarChartEditorDemo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <BarChartEditor
      initialArrayData={salesData}
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
        animationDuration: 1000,
        barType: 'grouped',
        margin: { top: 20, right: 40, bottom: 60, left: 80 },
      }}
      initialFormatters={{
        useYFormatter: true,
        useXFormatter: true,
        yFormatterType: 'number',
        xFormatterType: 'number',
        customYFormatter: '',
        customXFormatter: '',
      }}
      dataset={undefined} // No dataset for demo, uses sample data
    />
  );
};

export default BarChartEditorDemo;
