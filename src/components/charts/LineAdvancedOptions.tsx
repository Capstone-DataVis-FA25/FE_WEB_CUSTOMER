import React from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { Info } from 'lucide-react';

const LineAdvancedOptions: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();

  if (!chartConfig || currentChartType !== ChartType.Line) return null;

  const cfg: any = chartConfig.config || {};

  // Get current display settings with defaults
  const showTooltip = cfg.showTooltip ?? true;
  const showPoints = cfg.showPoints ?? false;
  const showPointValues = cfg.showPointValues ?? false;
  const showGrid = cfg.showGrid ?? true;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('line_advanced_options', 'Advanced Display Options')}
        </Label>
        <Info className="h-4 w-4 text-gray-400" />
      </div>

      {/* Show Data Points */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showPoints}
          onCheckedChange={v => handleConfigChange({ config: { showPoints: Boolean(v) } as any })}
          id="line-show-points"
        />
        <div className="flex-1">
          <Label htmlFor="line-show-points" className="text-sm font-medium cursor-pointer">
            {t('show_data_points', 'Show data points on lines')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_points_hint',
              'Display circles at each data point to make individual values easier to identify and track trends'
            )}
          </p>
        </div>
      </div>

      {/* Show Values on Points */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showPointValues}
          onCheckedChange={v =>
            handleConfigChange({ config: { showPointValues: Boolean(v) } as any })
          }
          id="line-show-point-values"
          disabled={!showPoints}
        />
        <div className="flex-1">
          <Label
            htmlFor="line-show-point-values"
            className={`text-sm font-medium cursor-pointer ${!showPoints ? 'opacity-50' : ''}`}
          >
            {t('show_values_on_points', 'Show values directly on data points')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_point_values_line_hint',
              'Display the exact number next to each point for quick reading without hovering. Enable "Show data points" first.'
            )}
          </p>
        </div>
      </div>

      {/* Show Detailed Tooltip */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showTooltip}
          onCheckedChange={v => handleConfigChange({ config: { showTooltip: Boolean(v) } as any })}
          id="line-show-tooltip"
        />
        <div className="flex-1">
          <Label htmlFor="line-show-tooltip" className="text-sm font-medium cursor-pointer">
            {t('show_detailed_tooltip', 'Show detailed information on hover')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_tooltip_line_hint',
              'Display comprehensive details when hovering over points: exact values, trends, and comparisons across different series'
            )}
          </p>
        </div>
      </div>

      {/* Show Grid Lines */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showGrid}
          onCheckedChange={v => handleConfigChange({ config: { showGrid: Boolean(v) } as any })}
          id="line-show-grid"
        />
        <div className="flex-1">
          <Label htmlFor="line-show-grid" className="text-sm font-medium cursor-pointer">
            {t('show_grid_lines', 'Show grid lines for easier reading')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_grid_hint',
              'Display background grid lines to help align data points with axis values and estimate values visually'
            )}
          </p>
        </div>
      </div>

      {/* Helpful Tips */}
      {/* <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1.5 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          {t('tips_for_better_reading', '💡 Tips for Better Chart Reading')}
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1.5">
          <li className="flex items-start gap-1.5">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>
              {t(
                'tip_line_trends',
                'Lines going up show growth, lines going down show decline - the steeper the line, the faster the change'
              )}
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>
              {t(
                'tip_line_compare',
                'Compare multiple lines to see which series performs better or how they relate to each other over time'
              )}
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>
              {t(
                'tip_line_hover',
                'Hover over any point to see exact values and detailed information - no need to estimate from the axis'
              )}
            </span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>
              {t(
                'tip_line_legend',
                'Use the legend to show/hide specific lines and focus on the data you care about most'
              )}
            </span>
          </li>
        </ul>
      </div> */}

      {/* Best Practices for Large Datasets */}
      {/* <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <h4 className="text-xs font-semibold text-green-900 dark:text-green-200 mb-1.5">
          {t('best_practices_large_data', '✨ Best Practices for Many Data Points')}
        </h4>
        <ul className="text-xs text-green-800 dark:text-green-300 space-y-1">
          <li>
            {t(
              'practice_rotate_labels',
              'Rotate X-axis labels (in Axis Settings) to fit more dates/categories without overlap'
            )}
          </li>
          <li>
            {t(
              'practice_compact_format',
              'Use compact date formats (numeric or short) to save space when showing many time periods'
            )}
          </li>
          <li>
            {t(
              'practice_scroll',
              'For 100+ data points, the chart will auto-expand with horizontal scroll - this ensures all your data is visible'
            )}
          </li>
        </ul>
      </div> */}
    </div>
  );
};

export default LineAdvancedOptions;
