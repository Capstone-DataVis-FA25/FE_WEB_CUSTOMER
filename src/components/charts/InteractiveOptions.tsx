import React, { /* useState, */ useEffect, useMemo } from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
// import { Info } from 'lucide-react';

const InteractiveOptions: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, chartData } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  if (!chartConfig) return null;

  const config = chartConfig.config;
  if (!config) return null;

  const axisConfigs = 'axisConfigs' in chartConfig ? chartConfig.axisConfigs : undefined;

  // const [localZoomExtent, setLocalZoomExtent] = useState(config.zoomExtent);

  // Calculate if chart will auto-expand based on data points
  const isChartAutoExpanded = useMemo(() => {
    // Only calculate if X-axis is selected
    if (!axisConfigs?.xAxisKey) return false;

    if (!chartData || !Array.isArray(chartData)) return false;

    const dataLength = chartData.length;
    const xAxisRotation = axisConfigs?.xAxisRotation || 0;
    const minWidthPerPoint = xAxisRotation === 0 ? 60 : 30;

    // Assume default chart width is around 800px (typical container width)
    const estimatedContainerWidth = config.width || 800;
    const calculatedWidth = dataLength * minWidthPerPoint;

    return calculatedWidth > estimatedContainerWidth;
  }, [chartData, axisConfigs?.xAxisRotation, config.width]);

  // Auto-enable pan when chart is expanded (update config if needed)
  useEffect(() => {
    if (isChartAutoExpanded && config.enablePan === false) {
      // Silently update to true when auto-expanded
      handleConfigChange({ config: { enablePan: true } });
    }
  }, [isChartAutoExpanded]);

  // Sync local state with chartConfig when it changes (for edit mode)
  // useEffect(() => {
  //   setLocalZoomExtent(config.zoomExtent);
  // }, [config?.zoomExtent]);

  // Debounced update handler using custom hook
  // const debouncedUpdateZoomExtent = useDebouncedUpdater<number>(value =>
  //   handleConfigChange({ config: { zoomExtent: value } })
  // );

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
        {t('chart_editor_interactive_options')}
      </h4>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showTooltip"
            checked={config.showTooltip}
            onCheckedChange={checked => handleConfigChange({ config: { showTooltip: !!checked } })}
          />
          <Label
            htmlFor="showTooltip"
            className="text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {t('chart_editor_show_tooltip')}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enableZoom"
            checked={config.enableZoom}
            onCheckedChange={checked => handleConfigChange({ config: { enableZoom: !!checked } })}
          />
          <Label
            htmlFor="enableZoom"
            className="text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {t('chart_editor_enable_zoom')}
          </Label>
        </div>

        {config.enablePan !== undefined && (
          <div className="space-y-2 mb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enablePan"
                checked={config.enablePan || isChartAutoExpanded}
                onCheckedChange={checked => {
                  // Prevent unchecking if auto-expanded
                  if (isChartAutoExpanded && !checked) return;
                  handleConfigChange({ config: { enablePan: !!checked } });
                }}
                disabled={isChartAutoExpanded}
              />
              <Label
                htmlFor="enablePan"
                className={`text-sm font-medium  ${isChartAutoExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}
              >
                {t('chart_editor_enable_pan')}
                {isChartAutoExpanded && (
                  <span className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    ({t('auto_enabled', 'Auto-enabled')})
                  </span>
                )}
              </Label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveOptions;
