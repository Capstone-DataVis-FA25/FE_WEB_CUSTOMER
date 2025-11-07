import React, { useMemo, useState } from 'react';
import type { SubPieDonutChartConfig } from '@/types/chart';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import { Label } from '../ui/label';
import { useChartEditor, useChartEditorActions } from '@/features/chartEditor';
import { useDataset } from '@/features/dataset/useDataset';
import { AnimatePresence, motion } from '@/theme/animation';
import { CHART_ROLE_VALIDATION_RULES } from '@/utils/chartValidation';

// Pie config type guard
function isPieDonutConfig(config: any): config is SubPieDonutChartConfig {
  return (
    config &&
    typeof config === 'object' &&
    'labelKey' in config &&
    'valueKey' in config &&
    'innerRadius' in config &&
    'cornerRadius' in config &&
    'padAngle' in config &&
    'sortSlices' in config
  );
}

const ChartSettingsPieSection: React.FC = () => {
  const { chartConfig } = useChartEditor();
  const { currentDataset } = useDataset();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { handleConfigChange } = useChartEditorActions();
  const config = chartConfig?.config;

  // Role-based validation for label/value by chart type (pie/donut)
  const roleRules = useMemo(() => {
    const key = String(chartConfig?.chartType || '').toLowerCase();
    return (
      CHART_ROLE_VALIDATION_RULES[key as 'pie' | 'donut'] || CHART_ROLE_VALIDATION_RULES['pie']
    );
  }, [chartConfig?.chartType]);

  const headers = (currentDataset?.headers as any[]) || [];
  const normalizeType = (t?: string) => (t || '').toLowerCase();
  const validLabelHeaders = useMemo(
    () => headers.filter(h => roleRules.label.allowedTypes.includes(normalizeType(h.type) as any)),
    [headers, roleRules]
  );
  const validValueHeaders = useMemo(
    () => headers.filter(h => roleRules.value.allowedTypes.includes(normalizeType(h.type) as any)),
    [headers, roleRules]
  );
  const currentLabelHeader = headers.find(h => (h.id || h.name) === (config as any)?.labelKey);
  const currentValueHeader = headers.find(h => (h.id || h.name) === (config as any)?.valueKey);
  const isCurrentLabelValid = !currentLabelHeader
    ? true
    : roleRules.label.allowedTypes.includes(normalizeType(currentLabelHeader?.type) as any);
  const isCurrentValueValid = !currentValueHeader
    ? true
    : roleRules.value.allowedTypes.includes(normalizeType(currentValueHeader?.type) as any);

  const toggleSection = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={toggleSection}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              {'Chart Settings'}
            </h3>
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        <AnimatePresence mode="wait">
          {!isCollapsed && isPieDonutConfig(config) && (
            <motion.div
              key="basic-settings-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <CardContent className="space-y-4 mt-4">
                <div className="space-y-3">
                  {/* Label Column Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {'Label Column'}
                    </Label>
                    <select
                      value={config.labelKey || ''}
                      onChange={e =>
                        handleConfigChange({ config: { labelKey: e.target.value } as any })
                      }
                      className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={
                        !currentDataset ||
                        !currentDataset.headers ||
                        currentDataset.headers.length === 0
                      }
                    >
                      <option value="" disabled>
                        {!currentDataset ||
                        !currentDataset.headers ||
                        currentDataset.headers.length === 0
                          ? 'No dataset or columns available'
                          : 'Select a column'}
                      </option>
                      {/* Show current invalid selection as disabled so user can see it */}
                      {currentLabelHeader && !isCurrentLabelValid && (
                        <option value={currentLabelHeader.id || currentLabelHeader.name} disabled>
                          {(currentLabelHeader.name || currentLabelHeader.id) + ' (invalid type)'}
                        </option>
                      )}
                      {validLabelHeaders.map((header: any) => (
                        <option key={header.id || header.name} value={header.id || header.name}>
                          {header.name || header.id} {`(${normalizeType(header.type)})`}
                        </option>
                      ))}
                    </select>
                    {/* Hint */}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {`💡 Label should be categorical data (text/date)`}
                    </p>
                    {/* Hint / Warning */}
                    {!isCurrentLabelValid && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        ⚠️ Selected label column type is not allowed for this chart. Allowed:{' '}
                        {roleRules.label.allowedTypes.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Value Column Selection */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {'Value Column'}
                    </Label>
                    <select
                      value={config.valueKey || ''}
                      onChange={e =>
                        handleConfigChange({ config: { valueKey: e.target.value } as any })
                      }
                      className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={
                        !currentDataset ||
                        !currentDataset.headers ||
                        currentDataset.headers.length === 0
                      }
                    >
                      <option value="" disabled>
                        {!currentDataset ||
                        !currentDataset.headers ||
                        currentDataset.headers.length === 0
                          ? 'No dataset or columns available'
                          : 'Select a column'}
                      </option>
                      {/* Show current invalid selection as disabled so user can see it */}
                      {currentValueHeader && !isCurrentValueValid && (
                        <option value={currentValueHeader.id || currentValueHeader.name} disabled>
                          {(currentValueHeader.name || currentValueHeader.id) + ' (invalid type)'}
                        </option>
                      )}
                      {validValueHeaders.map((header: any) => (
                        <option key={header.id || header.name} value={header.id || header.name}>
                          {header.name || header.id} {`(${normalizeType(header.type)})`}
                        </option>
                      ))}
                    </select>
                    {/* Hint */}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {`💡 Value must be numeric values (number)`}
                    </p>
                    {!isCurrentValueValid && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        ⚠️ Selected value column type is not allowed for this chart. Allowed:{' '}
                        {roleRules.value.allowedTypes.join(', ')}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {'Inner Radius (Donut)'}: {((config.innerRadius ?? 0) * 100).toFixed(0)}%
                    </Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={config.innerRadius ?? 0}
                      onChange={e =>
                        handleConfigChange({
                          config: { innerRadius: parseFloat(e.target.value) } as any,
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {'Corner Radius'}: {config.cornerRadius}
                    </Label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={config.cornerRadius}
                      onChange={e =>
                        handleConfigChange({
                          config: { cornerRadius: parseInt(e.target.value) } as any,
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {'Pad Angle'}: {(config.padAngle ?? 0).toFixed(2)}
                    </Label>
                    <input
                      type="range"
                      min="0"
                      max="0.1"
                      step="0.01"
                      value={config.padAngle ?? 0}
                      onChange={e =>
                        handleConfigChange({
                          config: { padAngle: parseFloat(e.target.value) } as any,
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {'Sort Slices'}
                    </Label>
                    <select
                      value={config.sortSlices}
                      onChange={e =>
                        handleConfigChange({
                          config: {
                            sortSlices: e.target.value as 'ascending' | 'descending' | 'none',
                          } as any,
                        })
                      }
                      className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="descending">Descending</option>
                      <option value="ascending">Ascending</option>
                      <option value="none">None</option>
                    </select>
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

export default ChartSettingsPieSection;
