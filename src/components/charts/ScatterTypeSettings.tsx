import React from 'react';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import ScatterAdvancedOptions from './ScatterAdvancedOptions';

const ScatterTypeSettings: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();

  if (!chartConfig) return null;
  if (currentChartType !== ChartType.Scatter) return null;

  return (
    <div className="space-y-4">
      {/* Scatter Advanced Options */}
      <ScatterAdvancedOptions />
    </div>
  );
};

export default ScatterTypeSettings;
