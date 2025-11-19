import React from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { Info } from 'lucide-react';

const ScatterAdvancedOptions: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();

  if (!chartConfig || currentChartType !== ChartType.Scatter) return null;

  const cfg: any = chartConfig.config || {};

  // Get current display settings with defaults
  const showTooltip = cfg.showTooltip ?? true;
  const showGrid = cfg.showGrid ?? true;
  const showRegressionLine = cfg.showRegressionLine ?? false;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('scatter_advanced_options', 'Advanced Display Options')}
        </Label>
        <Info className="h-4 w-4 text-gray-400" />
      </div>

      {/* Show Regression Line */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showRegressionLine}
          onCheckedChange={v =>
            handleConfigChange({ config: { showRegressionLine: Boolean(v) } as any })
          }
          id="scatter-show-regression"
        />
        <div className="flex-1">
          <Label htmlFor="scatter-show-regression" className="text-sm font-medium cursor-pointer">
            {t('show_regression_line', 'Show trend/regression line')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_regression_hint',
              'Display a linear regression line to show the overall trend and relationship between variables'
            )}
          </p>
        </div>
      </div>

      {/* Show Detailed Tooltip */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showTooltip}
          onCheckedChange={v => handleConfigChange({ config: { showTooltip: Boolean(v) } as any })}
          id="scatter-show-tooltip"
        />
        <div className="flex-1">
          <Label htmlFor="scatter-show-tooltip" className="text-sm font-medium cursor-pointer">
            {t('show_detailed_tooltip', 'Show detailed information on hover')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_tooltip_scatter_hint',
              'Display comprehensive details when hovering over points: X and Y values, category information, and point relationships'
            )}
          </p>
        </div>
      </div>

      {/* Show Grid Lines */}
      <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <Checkbox
          checked={showGrid}
          onCheckedChange={v => handleConfigChange({ config: { showGrid: Boolean(v) } as any })}
          id="scatter-show-grid"
        />
        <div className="flex-1">
          <Label htmlFor="scatter-show-grid" className="text-sm font-medium cursor-pointer">
            {t('show_grid_lines', 'Show grid lines for easier reading')}
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'show_grid_scatter_hint',
              'Display background grid lines to help align data points with axis values and estimate coordinates visually'
            )}
          </p>
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1.5">
          {t('tips_for_scatter_charts', 'Tips for Scatter Charts')}
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>
            {t(
              'tip_regression',
              'Enable regression line to see if there is a correlation between X and Y values'
            )}
          </li>
          <li>
            {t(
              'tip_clustering',
              'Look for clusters or patterns in the distribution of points to identify relationships'
            )}
          </li>
          <li>
            {t(
              'tip_outliers',
              'Hover over points to identify outliers or unusual data that may need investigation'
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ScatterAdvancedOptions;
