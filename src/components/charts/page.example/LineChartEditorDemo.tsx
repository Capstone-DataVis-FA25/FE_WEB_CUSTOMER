import React from 'react';
import LineChartEditor from '@/components/charts/LineChartEditor';
import { salesData } from '../data/data';
import { useTranslation } from 'react-i18next';

const LineChartEditorDemo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <LineChartEditor
      initialArrayData={salesData}
      initialConfig={{
        title: t('lineChart_editor_demo_financialData'),
        xAxisLabel: t('lineChart_editor_xAxisLabel'),
        yAxisLabel: t('lineChart_editor_yAxisLabel'),
        xAxisKey: 'Month',
        width: 800,
        height: 400,
        showLegend: true,
        showGrid: true,
        showPoints: true,
        animationDuration: 1000,
        curve: 'curveMonotoneX',
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
    />
  );
};

export default LineChartEditorDemo;
