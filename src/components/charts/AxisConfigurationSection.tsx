import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { useDataset } from '@/features/dataset/useDataset';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { useDebouncedUpdater } from '@/hooks/useDebounce';

const AxisConfigurationSection: React.FC = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { chartConfig, handleConfigChange } = useChartEditor();
  const { currentDataset } = useDataset();

  // Local state for rotation inputs with immediate UI feedback
  const [xAxisRotation, setXAxisRotation] = useState(chartConfig?.config.xAxisRotation || 0);
  const [yAxisRotation, setYAxisRotation] = useState(chartConfig?.config.yAxisRotation || 0);

  // Debounced update handlers using custom hook
  const debouncedUpdateXRotation = useDebouncedUpdater<number>(value =>
    handleConfigChange({ config: { xAxisRotation: value } })
  );

  const debouncedUpdateYRotation = useDebouncedUpdater<number>(value =>
    handleConfigChange({ config: { yAxisRotation: value } })
  );

  // Sync local state with config changes from external sources
  useEffect(() => {
    if (chartConfig?.config.xAxisRotation !== undefined) {
      setXAxisRotation(chartConfig.config.xAxisRotation);
    }
    if (chartConfig?.config.yAxisRotation !== undefined) {
      setYAxisRotation(chartConfig.config.yAxisRotation);
    }
  }, [chartConfig?.config.xAxisRotation, chartConfig?.config.yAxisRotation]);

  // Update handlers
  const handleXRotationChange = (value: number) => {
    setXAxisRotation(value);
    debouncedUpdateXRotation(value);
  };

  const handleYRotationChange = (value: number) => {
    setYAxisRotation(value);
    debouncedUpdateYRotation(value);
  };

  if (!chartConfig) return null;

  // Get headers with id and name for dropdown
  const dataHeaders = currentDataset?.headers || [];
  const hasDataset = currentDataset && currentDataset.id;

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl select-none">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            {t('chart_editor_axis_configuration', 'Axis Configuration')}
          </h3>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Show warning if no dataset */}
          {!hasDataset && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-yellow-600 dark:text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    {t('no_dataset_selected', 'No Dataset Selected')}
                  </h4>
                  <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                    {t(
                      'please_select_dataset_first',
                      'Please select a dataset first to configure axis columns.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* X-Axis Column Selection - Only show if dataset exists */}
          {hasDataset && (
            <div>
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                X-Axis Column
              </Label>
              <select
                value={chartConfig.config.xAxisKey}
                onChange={e => handleConfigChange({ config: { xAxisKey: e.target.value } })}
                className="mt-1 w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {dataHeaders.map((header: any) => (
                  <option key={header.id} value={header.id}>
                    {header.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* X-Axis Start Configuration */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('x_axis_start', 'X-Axis Start')}
            </Label>
            <div className="space-y-2 mt-2">
              <select
                value={
                  typeof chartConfig.config.xAxisStart === 'number'
                    ? 'auto'
                    : chartConfig.config.xAxisStart
                }
                onChange={e => {
                  handleConfigChange({
                    config: { xAxisStart: e.target.value as 'auto' | 'zero' },
                  });
                }}
                className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="auto">
                  {t('lineChart_editor_axisAutoFromMin', 'Auto (from minimum)')}
                </option>
                <option value="zero">{t('lineChart_editor_axisZeroStart', 'From zero')}</option>
              </select>
            </div>
          </div>

          {/* Y-Axis Start Configuration */}
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('y_axis_start', 'Y-Axis Start')}
            </Label>
            <div className="space-y-2 mt-2">
              <select
                value={
                  typeof chartConfig.config.yAxisStart === 'number'
                    ? 'auto'
                    : chartConfig.config.yAxisStart
                }
                onChange={e => {
                  handleConfigChange({
                    config: { yAxisStart: e.target.value as 'auto' | 'zero' },
                  });
                }}
                className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="auto">
                  {t('lineChart_editor_axisAutoFromMin', 'Auto (from minimum)')}
                </option>
                <option value="zero">{t('lineChart_editor_axisZeroStart', 'From zero')}</option>
              </select>
            </div>
          </div>

          {/* Preview of current axis settings */}
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">{t('x_axis_start', 'X-Axis Start')}:</span>
                <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">
                  {chartConfig.config.xAxisStart === 'auto'
                    ? 'Auto (min data)'
                    : chartConfig.config.xAxisStart === 'zero'
                      ? 'From 0'
                      : `From ${chartConfig.config.xAxisStart}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('y_axis_start', 'Y-Axis Start')}:</span>
                <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">
                  {chartConfig.config.yAxisStart === 'auto'
                    ? 'Auto (min data)'
                    : chartConfig.config.yAxisStart === 'zero'
                      ? 'From 0'
                      : `From ${chartConfig.config.yAxisStart}`}
                </span>
              </div>
              <div className="text-center mt-2 pt-2 border-t border-blue-300 dark:border-blue-600">
                <span className="text-blue-600 dark:text-blue-300 font-medium">
                  {t('lineChart_editor_chartWillUpdate', 'Chart will update automatically')}
                </span>
              </div>
            </div>
          </div>

          {/* Axis Labels & Appearance */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
              {t('lineChart_editor_axisLabelsAppearance', 'Axis Labels & Appearance')}
            </h4>

            <div className="space-y-4">
              {/* Show Axis Labels */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showAxisLabels"
                  checked={chartConfig.config.showAxisLabels}
                  onCheckedChange={checked =>
                    handleConfigChange({ config: { showAxisLabels: !!checked } })
                  }
                />
                <Label
                  htmlFor="showAxisLabels"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {t('lineChart_editor_showAxisLabels', 'Show Axis Labels')}
                </Label>
              </div>

              {/* Show Axis Ticks */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showAxisTicks"
                  checked={chartConfig.config.showAxisTicks}
                  onCheckedChange={checked =>
                    handleConfigChange({ config: { showAxisTicks: !!checked } })
                  }
                />
                <Label
                  htmlFor="showAxisTicks"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {t('lineChart_editor_showAxisTicks', 'Show Axis Ticks')}
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* X-Axis Rotation */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('lineChart_editor_xAxisLabelRotation', 'X-Axis Label Rotation')}
                  </Label>
                  <Input
                    type="number"
                    min="-90"
                    max="90"
                    value={xAxisRotation}
                    onChange={e => handleXRotationChange(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                {/* Y-Axis Rotation */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('lineChart_editor_yAxisLabelRotation', 'Y-Axis Label Rotation')}
                  </Label>
                  <Input
                    type="number"
                    min="-90"
                    max="90"
                    value={yAxisRotation}
                    onChange={e => handleYRotationChange(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AxisConfigurationSection;
