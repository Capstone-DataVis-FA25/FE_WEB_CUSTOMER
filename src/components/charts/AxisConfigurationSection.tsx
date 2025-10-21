import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ChevronDown, Sliders } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { useDataset } from '@/features/dataset/useDataset';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { useDebouncedUpdater } from '@/hooks/useDebounce';
import { filterHeadersByAxisType, getAxisRequirementDescription } from '@/utils/chartValidation';
import { ChartType } from '@/features/charts/chartTypes';
import WarningPanel from './WarningPanel';
import AxisLabelsSettings from './AxisLabelsSettings';

const AxisConfigurationSection: React.FC = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { chartConfig } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  const { currentDataset } = useDataset();

  // Local state for rotation inputs with immediate UI feedback
  const [xAxisRotation, setXAxisRotation] = useState<number>(0);
  const [yAxisRotation, setYAxisRotation] = useState<number>(0);

  // Debounced update handlers using custom hook
  const debouncedUpdateXRotation = useDebouncedUpdater<number>(value =>
    handleConfigChange({ axisConfigs: { ...chartConfig?.axisConfigs, xAxisRotation: value } })
  );

  const debouncedUpdateYRotation = useDebouncedUpdater<number>(value =>
    handleConfigChange({ axisConfigs: { ...chartConfig?.axisConfigs, yAxisRotation: value } })
  );

  // Sync local state with config changes from external sources
  useEffect(() => {
    if (chartConfig?.axisConfigs?.xAxisRotation !== undefined) {
      setXAxisRotation(chartConfig.axisConfigs.xAxisRotation);
    }
    if (chartConfig?.axisConfigs?.yAxisRotation !== undefined) {
      setYAxisRotation(chartConfig.axisConfigs.yAxisRotation);
    }
  }, [chartConfig?.axisConfigs?.xAxisRotation, chartConfig?.axisConfigs?.yAxisRotation]);

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

  // Get chart type from config (chartType is at root level of MainChartConfig)
  const chartType = chartConfig.chartType || ChartType.Line;

  // Get headers with id and name for dropdown
  const dataHeaders = currentDataset?.headers || [];
  const hasDataset = currentDataset && currentDataset.id;

  // Filter headers valid for X-axis based on chart type
  const validXAxisHeaders = filterHeadersByAxisType(dataHeaders, chartType, 'x');

  // Get requirement description for X-axis
  const xAxisRequirement = getAxisRequirementDescription(chartType, 'x');

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl select-none overflow-hidden rounded-lg">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            {t('chart_editor_axis_configuration', 'Axis Configuration')}
          </h3>
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </motion.div>
        </div>
      </CardHeader>
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            key="axis-config-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="space-y-4 mt-4">
              {/* Axis Labels at top */}
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="sr-only">Axis Labels</Label>
                    <AxisLabelsSettings />
                  </div>
                </div>
              </div>
              {/* Show warning if no dataset */}
              {!hasDataset && (
                <div>
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 pb-2">
                      X-Axis Column
                    </Label>
                    <WarningPanel
                      title={t('no_dataset_selected', 'No Dataset Selected')}
                      message={t(
                        'please_select_dataset_first',
                        'Please select a dataset first to configure axis columns.'
                      )}
                    />
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
                    value={chartConfig.axisConfigs.xAxisKey || 'placeholder'}
                    onChange={e => {
                      if (e.target.value !== 'placeholder') {
                        handleConfigChange({
                          axisConfigs: {
                            ...chartConfig.axisConfigs,
                            xAxisKey: e.target.value,
                          },
                        });
                      }
                    }}
                    className="mt-1 w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="placeholder" disabled>
                      {validXAxisHeaders.length === 0
                        ? t('no_valid_columns', 'No valid columns available')
                        : t('select_column', 'Select a column')}
                    </option>
                    {validXAxisHeaders.map((header: any) => (
                      <option key={header.id} value={header.id}>
                        {header.name} ({header.type})
                      </option>
                    ))}
                  </select>
                  {/* Show requirement hint */}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                    💡 {xAxisRequirement}
                  </p>
                  {/* Warning if no valid columns */}
                  {validXAxisHeaders.length === 0 && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                      ⚠️{' '}
                      {t('no_valid_xaxis_columns', 'No columns match the requirements for X-axis')}
                    </p>
                  )}
                </div>
              )}

              {/* X-Axis Start Configuration */}
              <div>
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('x_axis_start', 'X-Axis Start')}
                </Label>
                <div className="space-y-2 mt-2">
                  <select
                    value={chartConfig.axisConfigs?.xAxisStart || 'auto'}
                    onChange={e => {
                      handleConfigChange({
                        axisConfigs: {
                          ...chartConfig.axisConfigs,
                          xAxisStart: e.target.value as 'auto' | 'zero',
                        },
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
                    value={chartConfig.axisConfigs?.yAxisStart || 'auto'}
                    onChange={e => {
                      handleConfigChange({
                        axisConfigs: {
                          ...chartConfig.axisConfigs,
                          yAxisStart: e.target.value as 'auto' | 'zero',
                        },
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
                      {chartConfig.axisConfigs?.xAxisStart === 'auto'
                        ? 'Auto (min data)'
                        : chartConfig.axisConfigs?.xAxisStart === 'zero'
                          ? 'From 0'
                          : `From ${chartConfig.axisConfigs?.xAxisStart}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('y_axis_start', 'Y-Axis Start')}:</span>
                    <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">
                      {chartConfig.axisConfigs?.yAxisStart === 'auto'
                        ? 'Auto (min data)'
                        : chartConfig.axisConfigs?.yAxisStart === 'zero'
                          ? 'From 0'
                          : `From ${chartConfig.axisConfigs?.yAxisStart}`}
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
                      checked={!!chartConfig.axisConfigs?.showAxisLabels}
                      onCheckedChange={checked =>
                        handleConfigChange({
                          axisConfigs: {
                            ...chartConfig.axisConfigs,
                            showAxisLabels: !!checked,
                          },
                        })
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
                      checked={!!chartConfig.axisConfigs?.showAxisTicks}
                      onCheckedChange={checked =>
                        handleConfigChange({
                          axisConfigs: {
                            ...chartConfig.axisConfigs,
                            showAxisTicks: !!checked,
                          },
                        })
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
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default AxisConfigurationSection;
