import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChartEditor } from '@/features/chartEditor';
import type { CyclePlotConfig } from '@/types/chart';
import { defaultColorsChart } from '@/utils/Utils';
import { RefreshCcw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CyclePlotSettingsSection: React.FC = () => {
  const { t } = useTranslation();
  const { chartData, chartConfig, handleConfigChange } = useChartEditor();
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Extract cycle plot specific keys from config
  const cyclePlotConfig = chartConfig as CyclePlotConfig | null;
  const cycleKey = cyclePlotConfig?.axisConfigs?.cycleKey;
  const periodKey = cyclePlotConfig?.axisConfigs?.periodKey;
  const valueKey = cyclePlotConfig?.axisConfigs?.valueKey;

  // Get available columns from chart data
  const availableColumns = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    // If data is array format, get headers from first row
    if (Array.isArray(chartData[0])) {
      return chartData[0] as string[];
    }

    // If data is object format, get keys from first object
    return Object.keys(chartData[0]);
  }, [chartData]);

  // Handlers to update config
  const setCycleKey = (value: string) => {
    handleConfigChange({
      axisConfigs: { cycleKey: value },
    });
  };

  const setPeriodKey = (value: string) => {
    handleConfigChange({
      axisConfigs: { periodKey: value },
    });
  };

  const setValueKey = (value: string) => {
    handleConfigChange({
      axisConfigs: { valueKey: value },
    });
  };

  // Display options handlers
  const toggleShowAverageLine = (checked: boolean) => {
    handleConfigChange({ axisConfigs: { showAverageLine: checked } });
  };

  const toggleEmphasizeLatest = (checked: boolean) => {
    handleConfigChange({ axisConfigs: { emphasizeLatestCycle: checked } });
  };

  const toggleShowRangeBand = (checked: boolean) => {
    handleConfigChange({ axisConfigs: { showRangeBand: checked } });
  };

  const toggleShowTooltipDelta = (checked: boolean) => {
    handleConfigChange({ axisConfigs: { showTooltipDelta: checked } });
  };

  const setPeriodOrdering = (value: string) => {
    handleConfigChange({ axisConfigs: { periodOrdering: value as 'auto' | 'custom' } });
  };

  // Get unique cycles from data for color configuration
  const uniqueCycles = React.useMemo(() => {
    if (!chartData || chartData.length === 0 || !cycleKey) return [];

    const cycles = new Set<string>();
    chartData.forEach((row, index) => {
      // Skip header row for array format
      if (index === 0 && Array.isArray(chartData[0])) {
        const headers = chartData[0];
        if (typeof headers[0] === 'string') return; // This is header row
      }

      if (typeof row === 'object' && !Array.isArray(row)) {
        const value = (row as Record<string, any>)[cycleKey];
        if (value !== undefined && value !== null) {
          cycles.add(String(value));
        }
      }
    });

    return Array.from(cycles).sort();
  }, [chartData, cycleKey]);

  // Cycle Colors Configuration Component
  const CycleColorsConfig: React.FC = () => {
    const cycleColors = cyclePlotConfig?.axisConfigs?.cycleColors || {};
    const colorKeys = Object.keys(defaultColorsChart);

    // Auto-assign colors to cycles if not already assigned
    useEffect(() => {
      if (uniqueCycles.length === 0) return;

      let needsUpdate = false;
      const updatedColors = { ...cycleColors };

      uniqueCycles.forEach((cycle, index) => {
        if (!updatedColors[cycle]) {
          const colorKey = colorKeys[index % colorKeys.length];
          updatedColors[cycle] = defaultColorsChart[colorKey as keyof typeof defaultColorsChart];
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        handleConfigChange({
          axisConfigs: {
            cycleColors: updatedColors,
          },
        });
      }
    }, [uniqueCycles.length]);

    const updateCycleColor = (cycle: string, colorKey: string) => {
      const selectedColor = defaultColorsChart[colorKey as keyof typeof defaultColorsChart];
      handleConfigChange({
        axisConfigs: {
          cycleColors: {
            ...cycleColors,
            [cycle]: selectedColor,
          },
        },
      });
    };

    if (uniqueCycles.length === 0) return null;

    return (
      <div className="mt-4 space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <Label className="text-sm font-medium flex items-center gap-2">
          {t('cycle_colors', 'Cycle Colors')}
        </Label>
        <div className="space-y-2">
          {uniqueCycles.map(cycle => {
            const currentColor = cycleColors[cycle];
            const currentColorKey =
              colorKeys.find(key => {
                const color = defaultColorsChart[key as keyof typeof defaultColorsChart];
                return JSON.stringify(color) === JSON.stringify(currentColor);
              }) || colorKeys[uniqueCycles.indexOf(cycle) % colorKeys.length];

            const displayColor =
              currentColor && typeof currentColor === 'object' && 'light' in currentColor
                ? currentColor.light
                : '#3b82f6';

            return (
              <div
                key={cycle}
                className="flex items-center justify-between gap-3 p-3 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: displayColor }}
                  />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {cycle}
                  </p>
                </div>
                <Select
                  value={currentColorKey}
                  onValueChange={value => updateCycleColor(cycle, value)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {colorKeys.map(key => {
                      const colorValue = defaultColorsChart[key as keyof typeof defaultColorsChart];
                      const previewColor =
                        typeof colorValue === 'object' && 'light' in colorValue
                          ? colorValue.light
                          : '#000000';

                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: previewColor }}
                            />
                            <span className="capitalize">{key}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl rounded-lg">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-700/10 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <RefreshCcw className="h-5 w-5" />
              {t('cycle_plot_settings', 'Cycle Plot Settings')}
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
              key="cycle-plot-settings-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <CardContent className="space-y-4 mt-4">
                {/* Display Options - End-user friendly toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60">
                    <Checkbox
                      checked={!!cyclePlotConfig?.axisConfigs?.showAverageLine}
                      onCheckedChange={(v: any) => toggleShowAverageLine(Boolean(v))}
                      id="show-average-line"
                    />
                    <div>
                      <Label htmlFor="show-average-line" className="text-sm font-medium">
                        {t('cycle_show_average_line', 'Show average line')}
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t(
                          'cycle_show_average_line_hint',
                          'Add an average line across cycles for each period'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60">
                    <Checkbox
                      checked={!!cyclePlotConfig?.axisConfigs?.emphasizeLatestCycle}
                      onCheckedChange={(v: any) => toggleEmphasizeLatest(Boolean(v))}
                      id="emphasize-latest-cycle"
                    />
                    <div>
                      <Label htmlFor="emphasize-latest-cycle" className="text-sm font-medium">
                        {t('cycle_emphasize_latest', 'Emphasize latest cycle')}
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t(
                          'cycle_emphasize_latest_hint',
                          'Highlight the most recent cycle to guide attention'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60">
                    <Checkbox
                      checked={!!cyclePlotConfig?.axisConfigs?.showRangeBand}
                      onCheckedChange={(v: any) => toggleShowRangeBand(Boolean(v))}
                      id="show-range-band"
                    />
                    <div>
                      <Label htmlFor="show-range-band" className="text-sm font-medium">
                        {t('cycle_show_range_band', 'Show range band (min–max)')}
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t(
                          'cycle_show_range_band_hint',
                          'Display variability between min and max per period'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60">
                    <Checkbox
                      checked={!!cyclePlotConfig?.axisConfigs?.showTooltipDelta}
                      onCheckedChange={(v: any) => toggleShowTooltipDelta(Boolean(v))}
                      id="show-tooltip-delta"
                    />
                    <div>
                      <Label htmlFor="show-tooltip-delta" className="text-sm font-medium">
                        {t('cycle_show_tooltip_delta', 'Show deltas in tooltip')}
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t(
                          'cycle_show_tooltip_delta_hint',
                          'Compare against average and last year when possible'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Period Ordering */}
                <div className="space-y-2">
                  <Label htmlFor="period-ordering" className="text-sm font-medium">
                    {t('cycle_period_ordering', 'Period ordering')}
                  </Label>
                  <Select
                    value={(cyclePlotConfig?.axisConfigs?.periodOrdering as any) || 'auto'}
                    onValueChange={setPeriodOrdering}
                  >
                    <SelectTrigger id="period-ordering" className="w-full max-w-xs">
                      <SelectValue
                        placeholder={t('cycle_period_ordering_placeholder', 'Select ordering')}
                      />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="auto">
                        {t('cycle_period_ordering_auto', 'Auto (Month/Quarter/Number)')}
                      </SelectItem>
                      <SelectItem value="custom">
                        {t('cycle_period_ordering_custom', 'Custom (coming soon)')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'cycle_period_ordering_hint',
                      'Automatically recognize month/quarter order, or choose custom later.'
                    )}
                  </p>
                </div>
                {/* Cycle Key Selection */}
                <div className="space-y-2">
                  <Label htmlFor="cycle-key" className="text-sm font-medium">
                    {t('cycle_key', 'Cycle Column')}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select value={cycleKey || ''} onValueChange={setCycleKey}>
                    <SelectTrigger id="cycle-key" className="w-full">
                      <SelectValue
                        placeholder={t('select_cycle_column', 'Select cycle column (e.g., Year)')}
                      />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'cycle_key_hint',
                      'Column that groups data into cycles (e.g., Year, Quarter)'
                    )}
                  </p>
                </div>

                {/* Period Key Selection */}
                <div className="space-y-2">
                  <Label htmlFor="period-key" className="text-sm font-medium">
                    {t('period_key', 'Period Column (X-Axis)')}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select value={periodKey || ''} onValueChange={setPeriodKey}>
                    <SelectTrigger id="period-key" className="w-full">
                      <SelectValue
                        placeholder={t(
                          'select_period_column',
                          'Select period column (e.g., Month)'
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'period_key_hint',
                      'Column for X-axis periods within each cycle (e.g., Month, Week)'
                    )}
                  </p>
                </div>

                {/* Value Key Selection */}
                <div className="space-y-2">
                  <Label htmlFor="value-key" className="text-sm font-medium">
                    {t('value_key', 'Value Column (Y-Axis)')}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select value={valueKey || ''} onValueChange={setValueKey}>
                    <SelectTrigger id="value-key-select" className="w-full max-w-xs">
                      <SelectValue
                        placeholder={t('value_key_placeholder', 'Select value column')}
                      />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      {availableColumns.map(col => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('value_key_hint', 'Column with numeric values for Y-axis')}
                  </p>
                </div>

                {/* Selection Summary */}
                {cycleKey && periodKey && valueKey && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-xs font-medium text-green-800 dark:text-green-200">
                      ✓ {t('cycle_plot_configured', 'Cycle Plot Configured')}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {t('cycle_plot_summary', 'Cycle')}: <strong>{cycleKey}</strong> →{' '}
                      {t('period', 'Period')}: <strong>{periodKey}</strong> → {t('value', 'Value')}:{' '}
                      <strong>{valueKey}</strong>
                    </p>
                  </div>
                )}

                {/* Cycle Colors Configuration */}
                {cycleKey && periodKey && valueKey && <CycleColorsConfig />}

                {/* Warning if not all fields selected */}
                {(!cycleKey || !periodKey || !valueKey) && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                      ⚠{' '}
                      {t(
                        'cycle_plot_incomplete',
                        'Please select all three columns to enable the chart'
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default CyclePlotSettingsSection;
