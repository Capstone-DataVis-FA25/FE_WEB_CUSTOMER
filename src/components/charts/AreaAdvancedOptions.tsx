import React from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';

/**
 * AreaAdvancedOptions Component
 *
 * Provides user-friendly advanced options specifically designed for non-tech users
 * to better understand area chart data through:
 * - Detailed tooltips with contextual information
 * - Visual trend indicators
 * - Clear value labels
 * - Comparative insights
 */
const AreaAdvancedOptions: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();

  if (!chartConfig || currentChartType !== ChartType.Area) return null;

  const cfg: any = chartConfig.config || {};

  // Get current display settings with defaults optimized for understanding
  const showTooltip = cfg.showTooltip ?? true;
  const showPoints = cfg.showPoints ?? false;
  const showPointValues = cfg.showPointValues ?? false;
  const showStroke = cfg.showStroke ?? true;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {t('area_advanced_options', 'Advanced Display Options')}
      </Label>

      {/* Show Detailed Tooltip - CRITICAL for non-tech users */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showTooltip}
          onCheckedChange={v => handleConfigChange({ config: { showTooltip: Boolean(v) } as any })}
          id="area-show-tooltip"
        />
        <div className="flex-1">
          <Label htmlFor="area-show-tooltip" className="text-sm font-medium cursor-pointer">
            {t('show_detailed_info', 'Show detailed information on hover')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'area_tooltip_hint',
              'Display comprehensive analysis when hovering: exact values, percentage of total, trend direction, and comparison with average'
            )}
          </p>
        </div>
      </div>

      {/* Show Data Points - Visual anchors for understanding trends */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showPoints}
          onCheckedChange={v => handleConfigChange({ config: { showPoints: Boolean(v) } as any })}
          id="area-show-points"
        />
        <div className="flex-1">
          <Label htmlFor="area-show-points" className="text-sm font-medium cursor-pointer">
            {t('show_data_points', 'Highlight individual data points')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_points_hint',
              'Show dots on each data point to make it easier to see exact positions and track trends visually'
            )}
          </p>
        </div>
      </div>

      {/* Show Values on Points - Instant readability */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showPointValues}
          onCheckedChange={v =>
            handleConfigChange({ config: { showPointValues: Boolean(v) } as any })
          }
          id="area-show-point-values"
        />
        <div className="flex-1">
          <Label htmlFor="area-show-point-values" className="text-sm font-medium cursor-pointer">
            {t('show_values_on_chart', 'Display values directly on chart')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'area_point_values_hint',
              'Show exact numbers next to each point for instant reading without needing to hover'
            )}
          </p>
        </div>
      </div>

      {/* Show Stroke Lines - Clarity for trend lines */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showStroke}
          onCheckedChange={v => handleConfigChange({ config: { showStroke: Boolean(v) } as any })}
          id="area-show-stroke"
        />
        <div className="flex-1">
          <Label htmlFor="area-show-stroke" className="text-sm font-medium cursor-pointer">
            {t('show_border_lines', 'Show clear border lines')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_stroke_hint',
              'Draw distinct lines around areas to make trends easier to follow and compare'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AreaAdvancedOptions;
