import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';

const AxisLabelsSettings: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  if (!chartConfig) return null;

  const { xAxisLabel, yAxisLabel } = chartConfig.config;
  const [localXAxisLabel, setLocalXAxisLabel] = useState(xAxisLabel);
  const [localYAxisLabel, setLocalYAxisLabel] = useState(yAxisLabel);

  // Sync local state with chartConfig when it changes (for edit mode)
  useEffect(() => {
    setLocalXAxisLabel(xAxisLabel);
    setLocalYAxisLabel(yAxisLabel);
  }, [xAxisLabel, yAxisLabel]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedApply = useCallback((apply: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(apply, 500);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('chart_editor_x_axis_label', 'X-axis label')}
        </Label>
        <Input
          value={localXAxisLabel}
          onChange={e => {
            const v = e.target.value;
            setLocalXAxisLabel(v);
            debouncedApply(() => handleConfigChange({ config: { xAxisLabel: v } }));
          }}
          placeholder={t('x_axis_label_placeholder', 'X-axis label (optional)')}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('chart_editor_y_axis_label', 'Y-axis label')}
        </Label>
        <Input
          value={localYAxisLabel}
          onChange={e => {
            const v = e.target.value;
            setLocalYAxisLabel(v);
            debouncedApply(() => handleConfigChange({ config: { yAxisLabel: v } }));
          }}
          placeholder={t('y_axis_label_placeholder', 'Y-axis label (optional)')}
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default AxisLabelsSettings;
