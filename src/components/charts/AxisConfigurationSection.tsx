import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ChevronDown, Sliders } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { useAppSelector } from '@/store/hooks';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { useDebouncedUpdater } from '@/hooks/useDebounce';
import {
  filterHeadersByAxisType,
  getAxisRequirementDescription,
  getChartTypeKey,
  validateHeaderForAxis,
} from '@/utils/chartValidation';
import { ChartType } from '@/features/charts/chartTypes';
import WarningPanel from './WarningPanel';
import AxisLabelsSettings from './AxisLabelsSettings';
import { getFormatterTypeFromDataType, isYearData } from '@/utils/formatValue';

// Type guard: check if chartConfig has axisConfigs
function hasAxisConfigs(config: any): config is { axisConfigs: any } {
  return config && typeof config === 'object' && 'axisConfigs' in config;
}

import type { DataHeader } from '@/utils/dataProcessors';

interface AxisConfigurationSectionProps {
  processedHeaders?: DataHeader[];
}

const AxisConfigurationSection: React.FC<AxisConfigurationSectionProps> = ({
  processedHeaders,
}) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { chartConfig } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  // Only subscribe to currentDataset to avoid re-renders when datasets list is refreshed
  const currentDataset = useAppSelector(state => state.dataset.currentDataset);

  // Local state for rotation inputs with immediate UI feedback
  const [xAxisRotation, setXAxisRotation] = useState<number>(0);
  const [yAxisRotation, setYAxisRotation] = useState<number>(0);

  // Debounced update handlers using custom hook
  const debouncedUpdateXRotation = useDebouncedUpdater<number>(value => {
    if (hasAxisConfigs(chartConfig)) {
      handleConfigChange({ axisConfigs: { ...chartConfig.axisConfigs, xAxisRotation: value } });
    }
  });

  const debouncedUpdateYRotation = useDebouncedUpdater<number>(value => {
    if (hasAxisConfigs(chartConfig)) {
      handleConfigChange({ axisConfigs: { ...chartConfig.axisConfigs, yAxisRotation: value } });
    }
  });

  // Sync local state with config changes from external sources
  useEffect(() => {
    if (hasAxisConfigs(chartConfig)) {
      if (chartConfig.axisConfigs.xAxisRotation !== undefined) {
        setXAxisRotation(chartConfig.axisConfigs.xAxisRotation);
      }
      if (chartConfig.axisConfigs.yAxisRotation !== undefined) {
        setYAxisRotation(chartConfig.axisConfigs.yAxisRotation);
      }
    }
  }, [
    hasAxisConfigs(chartConfig) ? chartConfig.axisConfigs.xAxisRotation : undefined,
    hasAxisConfigs(chartConfig) ? chartConfig.axisConfigs.yAxisRotation : undefined,
  ]);

  // Update handlers
  const handleXRotationChange = (value: number) => {
    setXAxisRotation(value);
    debouncedUpdateXRotation(value);
  };

  const handleYRotationChange = (value: number) => {
    setYAxisRotation(value);
    debouncedUpdateYRotation(value);
  };

  if (!chartConfig || !hasAxisConfigs(chartConfig)) return null;

  // Get chart type from config (chartType is at root level of MainChartConfig)
  const chartType = chartConfig.chartType || ChartType.Line;

  // Get headers: Use processed headers (aggregated) if provided, otherwise fall back to original dataset headers
  const dataHeaders = (processedHeaders as any[]) || currentDataset?.headers || [];
  const hasDataset = currentDataset && currentDataset.id;

  // Normalize chart type and debug
  const chartTypeKey = getChartTypeKey(chartType);
  // Debug: ensure chart type mapping is correct when troubleshooting
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[AxisConfiguration] raw chartType=', chartType, 'mapped=', chartTypeKey);
    console.debug('[AxisConfiguration] dataHeaders sample=', dataHeaders.slice(0, 6));
  }

  // Filter headers valid for X-axis based on chart type (use normalized key)
  const validXAxisHeaders = filterHeadersByAxisType(dataHeaders, chartTypeKey, 'x');

  // Current selected header for X (if any) and validation
  const currentXAxisId = chartConfig.axisConfigs?.xAxisKey;
  const currentHeader = dataHeaders.find((h: any) => h.id === currentXAxisId);
  const currentHeaderValidation = currentHeader
    ? validateHeaderForAxis(
        { name: currentHeader.name, type: currentHeader.type },
        chartTypeKey,
        'x'
      )
    : { isValid: true };

  // Get requirement description for X-axis
  const xAxisRequirement = getAxisRequirementDescription(chartTypeKey, 'x');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
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
              key="basic-settings-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
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
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                      {t('x_axis_start', 'X-Axis Start')}
                    </Label>
                    <select
                      value={
                        currentHeader && !currentHeaderValidation.isValid
                          ? 'placeholder'
                          : currentXAxisId || 'placeholder'
                      }
                      onChange={e => {
                        if (e.target.value !== 'placeholder' && hasAxisConfigs(chartConfig)) {
                          // Find the selected header to get its data type
                          const selectedHeader = dataHeaders.find(h => h.id === e.target.value);
                          const updates: any = {
                            axisConfigs: {
                              ...chartConfig.axisConfigs,
                              xAxisKey: e.target.value,
                            },
                          };

                          // Auto-detect and set formatter type based on column data type
                          if (selectedHeader && selectedHeader.type) {
                            const autoFormatterType = getFormatterTypeFromDataType(
                              selectedHeader.type as 'text' | 'number' | 'date'
                            );

                            // Update formatters with auto-detected type
                            const currentFormatters = (chartConfig as any).formatters || {};
                            const formatterUpdates: any = {
                              ...currentFormatters,
                              xFormatterType: autoFormatterType,
                              useXFormatter: autoFormatterType !== 'none',
                            };

                            // For number type, check if data looks like years (disable grouping)
                            if (
                              selectedHeader.type === 'number' &&
                              selectedHeader.data &&
                              Array.isArray(selectedHeader.data)
                            ) {
                              // Import isYearData helper
                              if (isYearData(selectedHeader.data)) {
                                formatterUpdates.xUseGrouping = false; // No thousands separator for years
                              } else {
                                formatterUpdates.xUseGrouping = true; // Use thousands separator
                              }
                            }

                            updates.formatters = formatterUpdates;
                          }

                          handleConfigChange(updates);
                        }
                      }}
                      className="mt-1 w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                    >
                      <option value="placeholder" disabled>
                        {validXAxisHeaders.length === 0
                          ? t('no_valid_columns', 'No valid columns available')
                          : t('select_column', 'Select a column')}
                      </option>

                      {/* List only valid headers as selectable options */}
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
                    {/* Warning if current selected header is invalid for this chart type */}
                    {currentHeader && !currentHeaderValidation.isValid && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        ⚠️{' '}
                        {currentHeaderValidation.message ||
                          'Selected column is not valid for X-axis'}
                      </p>
                    )}
                    {/* Warning if no valid columns */}
                    {validXAxisHeaders.length === 0 && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        ⚠️{' '}
                        {t(
                          'no_valid_xaxis_columns',
                          'No columns match the requirements for X-axis'
                        )}
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
                        if (hasAxisConfigs(chartConfig)) {
                          handleConfigChange({
                            axisConfigs: {
                              ...chartConfig.axisConfigs,
                              xAxisStart: e.target.value as 'auto' | 'zero',
                            },
                          });
                        }
                      }}
                      className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="auto">
                        {t('lineChart_editor_axisAutoFromMin', 'Auto (from minimum)')}
                      </option>
                      <option value="zero">
                        {t('lineChart_editor_axisZeroStart', 'From zero')}
                      </option>
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
                        if (hasAxisConfigs(chartConfig)) {
                          handleConfigChange({
                            axisConfigs: {
                              ...chartConfig.axisConfigs,
                              yAxisStart: e.target.value as 'auto' | 'zero',
                            },
                          });
                        }
                      }}
                      className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="auto">
                        {t('lineChart_editor_axisAutoFromMin', 'Auto (from minimum)')}
                      </option>
                      <option value="zero">
                        {t('lineChart_editor_axisZeroStart', 'From zero')}
                      </option>
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
                        onCheckedChange={checked => {
                          if (hasAxisConfigs(chartConfig)) {
                            handleConfigChange({
                              axisConfigs: {
                                ...chartConfig.axisConfigs,
                                showAxisLabels: !!checked,
                              },
                            });
                          }
                        }}
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
                        onCheckedChange={checked => {
                          if (hasAxisConfigs(chartConfig)) {
                            handleConfigChange({
                              axisConfigs: {
                                ...chartConfig.axisConfigs,
                                showAxisTicks: !!checked,
                              },
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor="showAxisTicks"
                        className="text-sm font-medium text-gray-900 dark:text-gray-100"
                      >
                        {t('lineChart_editor_showAxisTicks', 'Show Axis Ticks')}
                      </Label>
                    </div>

                    {/* Show All X-Axis Ticks */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showAllXAxisTicks"
                        checked={!!chartConfig.axisConfigs?.showAllXAxisTicks}
                        onCheckedChange={checked => {
                          if (hasAxisConfigs(chartConfig)) {
                            handleConfigChange({
                              axisConfigs: {
                                ...chartConfig.axisConfigs,
                                showAllXAxisTicks: !!checked,
                              },
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor="showAllXAxisTicks"
                        className="text-sm font-medium text-gray-900 dark:text-gray-100"
                      >
                        {t('lineChart_editor_showAllXAxisTicks', 'Show All X-Axis Ticks')}
                      </Label>
                    </div>

                    {/* Info about Show All X-Axis Ticks */}
                    {chartConfig.axisConfigs?.showAllXAxisTicks && (
                      <div className="col-span-2 text-xs bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md px-2.5 py-2">
                        <p className="text-blue-800 dark:text-blue-200">
                          💡 <strong>Tip:</strong> Showing all X-axis ticks works best with{' '}
                          <strong>compact date formats</strong> (Numeric, Year Only, Month-Year) or{' '}
                          <strong>rotated labels</strong>. Consider reducing chart width or using
                          ultra-compact formats for large datasets (200+ records).
                        </p>
                      </div>
                    )}

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
    </motion.div>
  );
};

export default AxisConfigurationSection;
