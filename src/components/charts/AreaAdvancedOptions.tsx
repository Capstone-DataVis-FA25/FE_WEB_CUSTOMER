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

      {/* Helpful Tips Section - Educational guidance */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {t('area_reading_guide', 'How to Read This Chart')}
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1.5 list-none">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">📊</span>
            <span>
              {t(
                'tip_area_height',
                'The height of the shaded area shows the quantity - higher means more, lower means less'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">📈</span>
            <span>
              {t(
                'tip_trend_direction',
                'If the area goes up, values are increasing; if it goes down, values are decreasing'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">🎯</span>
            <span>
              {t(
                'tip_hover_details',
                'Hover over any part to see exact numbers, percentages, and how it compares to the average'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">📍</span>
            <span>
              {t(
                'tip_peak_valley',
                'Look for peaks (highest points) and valleys (lowest points) to identify important changes'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-bold">🔍</span>
            <span>
              {t(
                'tip_multiple_areas',
                'When multiple areas overlap, you can compare different categories at the same time point'
              )}
            </span>
          </li>
        </ul>
      </div>

      {/* Understanding Insights Section - Context for decision making */}
      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <h4 className="text-xs font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          {t('understanding_insights', 'What This Tells You')}
        </h4>
        <ul className="text-xs text-green-800 dark:text-green-300 space-y-1.5 list-none">
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span>
              {t(
                'insight_percentage',
                'Percentages show the relative importance - bigger percentage means more significant'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span>
              {t(
                'insight_above_below',
                '"Above average" or "Below average" helps you spot exceptional values quickly'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span>
              {t(
                'insight_ranking',
                'Rankings (1st, 2nd, 3rd...) let you identify top performers or lowest values instantly'
              )}
            </span>
          </li>
        </ul>
      </div>

      {/* Best Practices Section - Actionable recommendations */}
      <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          {t('recommended_settings', 'Recommended for Beginners')}
        </h4>
        <ul className="text-xs text-purple-800 dark:text-purple-300 space-y-1.5 list-none">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 font-bold">→</span>
            <span>
              {t(
                'recommend_tooltip',
                'Keep "Detailed information on hover" ON to access comprehensive insights'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 font-bold">→</span>
            <span>
              {t(
                'recommend_points',
                'Enable "Data points" if you need to see exact positions clearly'
              )}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 dark:text-purple-400 font-bold">→</span>
            <span>
              {t(
                'recommend_values',
                'Turn ON "Values on chart" for quick reading without hovering (useful for presentations)'
              )}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AreaAdvancedOptions;
