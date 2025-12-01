import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { useAppSelector } from '@/store/hooks';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ChevronDown, ChevronUp, Sliders, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

const HeatmapAxisConfigSection: React.FC = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  const dataset = useAppSelector(state => state.dataset.currentDataset);

  if (!chartConfig || currentChartType !== ChartType.Heatmap) return null;

  const heatmapConfig = chartConfig as any;
  const axisConfigs = heatmapConfig.axisConfigs || {};
  const availableColumns = dataset?.headers || [];

  const xAxisKey = axisConfigs.xAxisKey || '';
  const yAxisKey = axisConfigs.yAxisKey || '';
  const valueKey = axisConfigs.valueKey || '';

  // Smart column suggestions based on data types
  const suggestedColumns = useMemo(() => {
    if (!availableColumns.length) return null;

    const textColumns = availableColumns.filter(
      (col: any) => col.type === 'text' || col.type === 'string'
    );
    const numberColumns = availableColumns.filter((col: any) => col.type === 'number');

    // For heatmap, we need 2 categorical (text) and 1 numeric (value)
    return {
      xAxis: textColumns[0]?.id || availableColumns[0]?.id,
      yAxis:
        textColumns[1]?.id ||
        (textColumns.length > 0 ? textColumns[0]?.id : availableColumns[1]?.id),
      value: numberColumns[0]?.id || availableColumns[2]?.id || availableColumns[0]?.id,
    };
  }, [availableColumns]);

  const handleAxisChange = (changes: any) => {
    handleConfigChange({ axisConfigs: { ...axisConfigs, ...changes } });
  };

  const applySmartSuggestion = () => {
    if (suggestedColumns) {
      handleAxisChange({
        xAxisKey: suggestedColumns.xAxis,
        yAxisKey: suggestedColumns.yAxis,
        valueKey: suggestedColumns.value,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('heatmap_axis_configuration', 'Axis Configuration')}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {suggestedColumns && (!xAxisKey || !yAxisKey || !valueKey) && (
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    applySmartSuggestion();
                  }}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {t('auto_suggest', 'Auto Suggest')}
                </Button>
              )}
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="space-y-4">
                {/* Smart Suggestion Info */}
                {suggestedColumns && (!xAxisKey || !yAxisKey || !valueKey) && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800 dark:text-amber-300">
                        <p className="font-semibold mb-1">
                          {t('smart_suggestion', 'Smart Suggestion')}
                        </p>
                        <p>
                          {t('heatmap_suggestion_hint', 'Based on your data types, we recommend:')}
                        </p>
                        <ul className="mt-1.5 space-y-0.5 list-disc list-inside ml-1">
                          <li>
                            <strong>X-Axis:</strong>{' '}
                            {
                              availableColumns.find((c: any) => c.id === suggestedColumns.xAxis)
                                ?.name
                            }
                          </li>
                          <li>
                            <strong>Y-Axis:</strong>{' '}
                            {
                              availableColumns.find((c: any) => c.id === suggestedColumns.yAxis)
                                ?.name
                            }
                          </li>
                          <li>
                            <strong>Value:</strong>{' '}
                            {
                              availableColumns.find((c: any) => c.id === suggestedColumns.value)
                                ?.name
                            }
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* X-Axis Key */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('x_axis_column', 'X-Axis Column')}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <select
                    value={xAxisKey}
                    onChange={e => handleAxisChange({ xAxisKey: e.target.value })}
                    className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">{t('select_column', 'Select column...')}</option>
                    {availableColumns.map((col: any) => (
                      <option key={col.id} value={col.id}>
                        {col.name} ({col.type})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('x_axis_hint', 'Categories displayed on horizontal axis')}
                  </p>
                </div>

                {/* Y-Axis Key */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('y_axis_column', 'Y-Axis Column')}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <select
                    value={yAxisKey}
                    onChange={e => handleAxisChange({ yAxisKey: e.target.value })}
                    className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">{t('select_column', 'Select column...')}</option>
                    {availableColumns.map((col: any) => (
                      <option key={col.id} value={col.id}>
                        {col.name} ({col.type})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('y_axis_hint', 'Categories displayed on vertical axis')}
                  </p>
                </div>

                {/* Value Key */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('value_column', 'Value Column')}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <select
                    value={valueKey}
                    onChange={e => handleAxisChange({ valueKey: e.target.value })}
                    className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">{t('select_column', 'Select column...')}</option>
                    {availableColumns.map((col: any) => (
                      <option key={col.id} value={col.id}>
                        {col.name} ({col.type})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('value_hint', 'Numeric values that determine cell colors')}
                  </p>
                </div>

                {/* Axis Labels */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('x_axis_label', 'X-Axis Label')}</Label>
                  <Input
                    type="text"
                    value={axisConfigs.xAxisLabel || ''}
                    onChange={e => handleAxisChange({ xAxisLabel: e.target.value })}
                    placeholder={t('x_axis_label_placeholder', 'Enter X-axis label...')}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('y_axis_label', 'Y-Axis Label')}</Label>
                  <Input
                    type="text"
                    value={axisConfigs.yAxisLabel || ''}
                    onChange={e => handleAxisChange({ yAxisLabel: e.target.value })}
                    placeholder={t('y_axis_label_placeholder', 'Enter Y-axis label...')}
                  />
                </div>

                {/* Helpful Information */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1.5">
                    {t('heatmap_data_requirements', 'Data Requirements')}
                  </h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>
                      {t('heatmap_req_1', 'X-Axis: Categorical column (e.g., months, products)')}
                    </li>
                    <li>
                      {t('heatmap_req_2', 'Y-Axis: Categorical column (e.g., years, regions)')}
                    </li>
                    <li>
                      {t('heatmap_req_3', 'Value: Numeric column representing intensity/magnitude')}
                    </li>
                  </ul>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default HeatmapAxisConfigSection;
