import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  LineChart,
  BarChart3,
  AreaChart,
  Dot,
  ChartPie,
  Donut,
  RefreshCcw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { useChartEditor } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { getDefaultChartConfig } from '@/utils/chartDefaults';
import type { MainChartConfig } from '@/types/chart';

interface ChartTypeOption {
  value: ChartType;
  label: string;
  icon: LucideIcon;
}

interface ChartTypeSelectorProps {
  disabled?: boolean;
  className?: string;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const { currentChartType, setCurrentChartType, chartConfig, setChartConfig } = useChartEditor();

  const chartTypeOptions: ChartTypeOption[] = useMemo(
    () => [
      {
        value: ChartType.Line,
        label: t('chart_type_line', 'Line Chart'),
        icon: LineChart,
      },
      {
        value: ChartType.Bar,
        label: t('chart_type_bar', 'Bar Chart'),
        icon: BarChart3,
      },
      {
        value: ChartType.Area,
        label: t('chart_type_area', 'Area Chart'),
        icon: AreaChart,
      },
      {
        value: ChartType.Scatter,
        label: t('chart_type_scatter', 'Scatter Chart'),
        icon: Dot,
      },
      {
        value: ChartType.Pie,
        label: t('chart_type_pie', 'Pie Chart'),
        icon: ChartPie,
      },
      {
        value: ChartType.Donut,
        label: t('chart_type_donut', 'Donut Chart'),
        icon: Donut,
      },
      {
        value: ChartType.CyclePlot,
        label: t('chart_type_cycle_plot', 'Cycle Plot'),
        icon: RefreshCcw,
      },
    ],
    [t]
  );

  const selectedOption = useMemo(
    () => chartTypeOptions.find(opt => opt.value === currentChartType),
    [chartTypeOptions, currentChartType]
  );

  // Intersection merge: keep only keys that exist in the new default.
  // For overlapping keys, prefer current values; for nested objects, recurse using
  // only the keys present in the new default. Old-type-only fields are dropped.
  const deepMergeConfigs = (currentConfig: any, newDefaultConfig: any): any => {
    if (!newDefaultConfig) return currentConfig;
    if (!currentConfig) return newDefaultConfig;

    if (typeof newDefaultConfig !== 'object' || Array.isArray(newDefaultConfig)) {
      return currentConfig;
    }
    if (typeof currentConfig !== 'object' || Array.isArray(currentConfig)) {
      return newDefaultConfig;
    }

    const result: any = {};
    // Only iterate keys from the new default (drop old-only keys)
    for (const key of Object.keys(newDefaultConfig)) {
      const currentValue = currentConfig[key];
      const newValue = newDefaultConfig[key];

      if (
        currentValue !== undefined &&
        typeof currentValue === 'object' &&
        currentValue !== null &&
        !Array.isArray(currentValue) &&
        typeof newValue === 'object' &&
        newValue !== null &&
        !Array.isArray(newValue)
      ) {
        // Special handling for datasetConfig: preserve it if it has content
        if (key === 'datasetConfig') {
          const hasCurrentContent = Object.keys(currentValue).length > 0;
          const hasNewContent = Object.keys(newValue).length > 0;
          if (hasCurrentContent && !hasNewContent) {
            // Preserve current datasetConfig if new default is empty
            result[key] = currentValue;
          } else {
            // Otherwise merge normally
            result[key] = deepMergeConfigs(currentValue, newValue);
          }
        } else {
          result[key] = deepMergeConfigs(currentValue, newValue);
        }
      } else if (currentValue !== undefined) {
        result[key] = currentValue;
      } else {
        result[key] = newValue;
      }
    }

    return result;
  };

  // Smart function to merge configs while preserving common fields
  const mergeConfigs = (
    currentConfig: MainChartConfig,
    newChartType: ChartType
  ): MainChartConfig => {
    const newDefaultConfig = getDefaultChartConfig(newChartType);

    // Use universal deep merge that works with any structure
    return deepMergeConfigs(currentConfig, newDefaultConfig);
  };

  const handleChartTypeChange = (value: string) => {
    const newChartType = value as ChartType;

    // If we have an existing config, merge it with the new chart type defaults
    if (chartConfig) {
      const mergedConfig = mergeConfigs(chartConfig, newChartType);
      // Ensure chartType reflects the new selection and drop old-type-only keys
      setChartConfig({ ...mergedConfig, chartType: newChartType } as MainChartConfig);
    } else {
      // If there's no existing config (e.g. fresh create flow), immediately set a
      // sensible default config for the selected chart type so downstream UI does
      // not observe a transient null `chartConfig` value.
      const defaultConfig = getDefaultChartConfig(newChartType);
      setChartConfig({ ...defaultConfig, chartType: newChartType } as MainChartConfig);
    }

    setCurrentChartType(newChartType);
  };

  const renderSelectedValue = () => {
    if (!selectedOption) {
      return (
        <span className="text-gray-500">
          {t('chart_editor_select_type', 'Select chart type...')}
        </span>
      );
    }

    const IconComponent = selectedOption.icon;
    return (
      <>
        <IconComponent className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{selectedOption.label}</span>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className={`relative z-50 ${className}`}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl rounded-lg">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('chart_editor_chartType', 'Chart Type')}
          </h3>
        </CardHeader>

        <CardContent className="relative overflow-visible">
          <div className="relative z-50">
            <Select value={currentChartType} onValueChange={handleChartTypeChange}>
              <SelectTrigger className="w-full" disabled={disabled}>
                <div className="flex items-center gap-2 min-h-[20px]">{renderSelectedValue()}</div>
              </SelectTrigger>

              <SelectContent className="z-[60]">
                {chartTypeOptions.map(option => {
                  const IconComponent = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(ChartTypeSelector);
