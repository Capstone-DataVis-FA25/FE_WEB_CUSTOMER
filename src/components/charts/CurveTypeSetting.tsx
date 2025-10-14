import React from 'react';
import { Label } from '../ui/label';
import { useTranslation } from 'react-i18next';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { ChartType } from '@/features/charts';
import { curveOptions } from '@/types/chart';

const CurveTypeSetting: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, handleConfigChange, currentChartType } = useChartEditor();

  if (!chartConfig) return null;
  // Only render for line charts (other chart types will move later)
  if (currentChartType !== ChartType.Line && currentChartType !== ChartType.Area) return null;

  const currentCurve = (chartConfig.config as any).curve ?? 'curveLinear';

  return (
    <div>
      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {t('chart_editor_curve_type', 'Curve Type')}
      </Label>
      <select
        value={currentCurve}
        onChange={e => {
          const nextCurve = e.target.value;
          handleConfigChange({ config: { curve: nextCurve } as any });
        }}
        className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        {Object.keys(curveOptions).map(curve => (
          <option key={curve} value={curve}>
            {curve.replace('curve', '')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurveTypeSetting;
