import React from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';

const BarAdvancedOptions: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();

  if (!chartConfig || currentChartType !== ChartType.Bar) return null;

  const cfg: any = chartConfig.config || {};

  // Get current display settings with defaults
  const showTooltip = cfg.showTooltip ?? true;
  const showPointValues = cfg.showPointValues ?? false;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {t('bar_advanced_options', 'Advanced Display Options')}
      </Label>

      {/* Show Detailed Tooltip */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showTooltip}
          onCheckedChange={v => handleConfigChange({ config: { showTooltip: Boolean(v) } as any })}
          id="bar-show-tooltip"
        />
        <div className="flex-1">
          <Label htmlFor="bar-show-tooltip" className="text-sm font-medium cursor-pointer">
            {t('show_detailed_tooltip', 'Show detailed information on hover')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_tooltip_hint',
              'Display comprehensive details when hovering over bars: value, percentage, average comparison, and ranking'
            )}
          </p>
        </div>
      </div>

      {/* Show Values on Bars */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showPointValues}
          onCheckedChange={v =>
            handleConfigChange({ config: { showPointValues: Boolean(v) } as any })
          }
          id="bar-show-point-values"
        />
        <div className="flex-1">
          <Label htmlFor="bar-show-point-values" className="text-sm font-medium cursor-pointer">
            {t('show_values_on_bars', 'Show values directly on bars')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_point_values_hint',
              'Display the exact number on each bar for quick reading without hovering'
            )}
          </p>
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1.5">
          {t('tips_for_better_understanding', 'Tips for Better Understanding')}
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>
            {t(
              'tip_hover_bars',
              'Hover over any bar to see detailed statistics including value, percentage, and comparison with average'
            )}
          </li>
          <li>
            {t(
              'tip_ranking',
              'The tooltip shows ranking to help you identify highest and lowest values quickly'
            )}
          </li>
          <li>
            {t(
              'tip_percentage',
              'Percentage values help you understand relative contribution and distribution'
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BarAdvancedOptions;
