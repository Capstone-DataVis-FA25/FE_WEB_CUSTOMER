import React from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';

const DisplayCheckboxes: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  if (!chartConfig) return null;

  const config = chartConfig.config;

  return (
    <>
      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {t('chart_editor_display_options')}
      </Label>
      <div className="flex items-center space-x-2 mt-1 mb-1">
        <Checkbox
          id="showLegend"
          checked={config.showLegend}
          onCheckedChange={checked => handleConfigChange({ config: { showLegend: !!checked } })}
        />
        <Label
          htmlFor="showLegend"
          className="text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {t('chart_editor_show_legend')}
        </Label>
      </div>

      <div className="flex items-center space-x-2 mb-1">
        <Checkbox
          id="showGrid"
          checked={config.showGrid}
          onCheckedChange={checked => handleConfigChange({ config: { showGrid: !!checked } })}
        />
        <Label htmlFor="showGrid" className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('chart_editor_show_grid')}
        </Label>
      </div>
    </>
  );
};

export default DisplayCheckboxes;
