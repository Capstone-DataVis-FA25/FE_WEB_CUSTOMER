import React from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';

const HistogramAdvancedOptions: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();

  if (!chartConfig || currentChartType !== ChartType.Histogram) return null;

  const cfg: any = chartConfig.config || {};

  // Get current display settings with defaults
  const showTooltip = cfg.showTooltip ?? true;
  const showPointValues = cfg.showPointValues ?? false;
  const showDensity = cfg.showDensity ?? false;
  const showMean = cfg.showMean ?? false;
  const showMedian = cfg.showMedian ?? false;
  const normalize = cfg.normalize ?? false;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {t('histogram_advanced_options', 'Advanced Display Options')}
      </Label>

      {/* Show Detailed Tooltip */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showTooltip}
          onCheckedChange={v => handleConfigChange({ config: { showTooltip: Boolean(v) } as any })}
          id="histogram-show-tooltip"
        />
        <div className="flex-1">
          <Label htmlFor="histogram-show-tooltip" className="text-sm font-medium cursor-pointer">
            {t('show_detailed_tooltip', 'Show detailed information on hover')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'histogram_tooltip_hint',
              'Display bin range, frequency, and percentage when hovering over bars'
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
          id="histogram-show-point-values"
        />
        <div className="flex-1">
          <Label
            htmlFor="histogram-show-point-values"
            className="text-sm font-medium cursor-pointer"
          >
            {t('show_values_on_bars', 'Show frequency values on bars')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'histogram_point_values_hint',
              'Display the frequency count on each bar for quick reading'
            )}
          </p>
        </div>
      </div>

      {/* Show Mean Line */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showMean}
          onCheckedChange={v => handleConfigChange({ config: { showMean: Boolean(v) } as any })}
          id="histogram-show-mean"
        />
        <div className="flex-1">
          <Label htmlFor="histogram-show-mean" className="text-sm font-medium cursor-pointer">
            {t('show_mean_line', 'Show mean line')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('histogram_mean_hint', 'Display a vertical line indicating the mean value')}
          </p>
        </div>
      </div>

      {/* Show Median Line */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showMedian}
          onCheckedChange={v => handleConfigChange({ config: { showMedian: Boolean(v) } as any })}
          id="histogram-show-median"
        />
        <div className="flex-1">
          <Label htmlFor="histogram-show-median" className="text-sm font-medium cursor-pointer">
            {t('show_median_line', 'Show median line')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('histogram_median_hint', 'Display a vertical line indicating the median value')}
          </p>
        </div>
      </div>

      {/* Show Density Curve */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showDensity}
          onCheckedChange={v => handleConfigChange({ config: { showDensity: Boolean(v) } as any })}
          id="histogram-show-density"
        />
        <div className="flex-1">
          <Label htmlFor="histogram-show-density" className="text-sm font-medium cursor-pointer">
            {t('show_density_curve', 'Show density curve overlay')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'histogram_density_hint',
              'Display a smooth curve showing the probability density distribution'
            )}
          </p>
        </div>
      </div>

      {/* Normalize to Probability */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={normalize}
          onCheckedChange={v => handleConfigChange({ config: { normalize: Boolean(v) } as any })}
          id="histogram-normalize"
        />
        <div className="flex-1">
          <Label htmlFor="histogram-normalize" className="text-sm font-medium cursor-pointer">
            {t('normalize_histogram', 'Normalize to probability density')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('histogram_normalize_hint', 'Show probability density instead of frequency counts')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistogramAdvancedOptions;
