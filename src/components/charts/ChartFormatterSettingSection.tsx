import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ChevronDown, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { useAppSelector } from '@/store/hooks';
import FormatterSection from './FormatterSection';
import type { FormatterType } from '@/utils/formatValue';
import type { FormatterConfig } from '@/types/chart';
import { ChartType } from '@/features/charts/chartTypes';

const SUPPORTED_CHART_TYPES = [
  ChartType.Line,
  ChartType.Bar,
  ChartType.Area,
  ChartType.Scatter,
  ChartType.CyclePlot,
];

const ChartFormatterSettings: React.FC = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  // Only subscribe to currentDataset to avoid re-renders when datasets list is refreshed
  const currentDataset = useAppSelector(state => state.dataset.currentDataset);

  // Get axis configuration to find selected columns (MUST be before any early returns)
  const axisConfigs = chartConfig && 'axisConfigs' in chartConfig ? chartConfig.axisConfigs : null;

  // Detect data types for X and Y axis columns (MUST be before any early returns)
  const { xAxisDataType, yAxisDataTypes, xAxisColumnName, yAxisColumnNames } = useMemo(() => {
    if (!axisConfigs || !currentDataset?.headers) {
      return {
        xAxisDataType: null,
        yAxisDataTypes: [],
        xAxisColumnName: null,
        yAxisColumnNames: [],
      };
    }

    // Get X-axis column ID
    const xAxisKeyId = Array.isArray(axisConfigs.xAxisKey)
      ? axisConfigs.xAxisKey[0]
      : axisConfigs.xAxisKey;

    // Find X-axis header
    const xAxisHeader = currentDataset.headers.find(h => h.id === xAxisKeyId);
    const xAxisDataType = xAxisHeader?.type || null;
    const xAxisColumnName = xAxisHeader?.name || null;

    // Get Y-axis column IDs from series configs
    const seriesConfigs = axisConfigs.seriesConfigs || [];
    const yAxisHeaders = seriesConfigs
      .map((series: any) => {
        const header = currentDataset.headers.find(h => h.id === series.dataColumn);
        return header;
      })
      .filter(Boolean);

    const yAxisDataTypes = yAxisHeaders.map(h => h!.type);
    const yAxisColumnNames = yAxisHeaders.map(h => h!.name);

    return {
      xAxisDataType,
      yAxisDataTypes,
      xAxisColumnName,
      yAxisColumnNames,
    };
  }, [axisConfigs, currentDataset?.headers]);

  // Only show for charts that support X/Y axis formatters
  // IMPORTANT: This early return MUST be AFTER all hooks
  if (
    !chartConfig ||
    !currentChartType ||
    !SUPPORTED_CHART_TYPES.includes(currentChartType as ChartType)
  ) {
    return null;
  }

  const formatters = (chartConfig.formatters as FormatterConfig) || {
    useYFormatter: false,
    useXFormatter: false,
    yFormatterType: 'none',
    xFormatterType: 'none',
  };

  // Y-Axis Formatter Handlers
  const handleYFormatterTypeChange = (type: FormatterType) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        yFormatterType: type,
        useYFormatter: type !== 'none',
      },
    });
  };

  const handleYCustomFormatChange = (format: string) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        customYFormatter: format,
      },
    });
  };

  const handleYCurrencySymbolChange = (symbol: string) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        yCurrencySymbol: symbol,
      },
    });
  };

  const handleYDecimalPlacesChange = (places: number) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        yDecimalPlaces: places,
      },
    });
  };

  // Y-Axis Sub-options Handlers
  const handleYCurrencyStyleChange = (style: 'symbol' | 'code' | 'name') => {
    handleConfigChange({
      formatters: {
        ...formatters,
        yCurrencyStyle: style,
      },
    });
  };

  const handleYNumberNotationChange = (
    notation: 'standard' | 'compact' | 'scientific' | 'engineering'
  ) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        yNumberNotation: notation,
      },
    });
  };

  const handleYDateFormatChange = (
    format:
      | 'auto'
      | 'numeric'
      | 'short'
      | 'medium'
      | 'long'
      | 'full'
      | 'relative'
      | 'year-only'
      | 'month-year'
      | 'iso'
  ) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        yDateFormat: format,
      },
    });
  };

  const handleYDurationFormatChange = (format: 'short' | 'narrow' | 'long') => {
    handleConfigChange({
      formatters: {
        ...formatters,
        yDurationFormat: format,
      },
    });
  };

  // X-Axis Formatter Handlers
  const handleXFormatterTypeChange = (type: FormatterType) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        xFormatterType: type,
        useXFormatter: type !== 'none',
      },
    });
  };

  const handleXCustomFormatChange = (format: string) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        customXFormatter: format,
      },
    });
  };

  const handleXCurrencySymbolChange = (symbol: string) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        xCurrencySymbol: symbol,
      },
    });
  };

  const handleXDecimalPlacesChange = (places: number) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        xDecimalPlaces: places,
      },
    });
  };

  // X-Axis Sub-options Handlers
  const handleXCurrencyStyleChange = (style: 'symbol' | 'code' | 'name') => {
    handleConfigChange({
      formatters: {
        ...formatters,
        xCurrencyStyle: style,
      },
    });
  };

  const handleXNumberNotationChange = (
    notation: 'standard' | 'compact' | 'scientific' | 'engineering'
  ) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        xNumberNotation: notation,
      },
    });
  };

  const handleXDateFormatChange = (
    format:
      | 'auto'
      | 'numeric'
      | 'short'
      | 'medium'
      | 'long'
      | 'full'
      | 'relative'
      | 'year-only'
      | 'month-year'
      | 'iso'
  ) => {
    handleConfigChange({
      formatters: {
        ...formatters,
        xDateFormat: format,
      },
    });
  };

  const handleXDurationFormatChange = (format: 'short' | 'narrow' | 'long') => {
    handleConfigChange({
      formatters: {
        ...formatters,
        xDurationFormat: format,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-700/10 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Axis Formatter
            </h3>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </motion.div>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="formatter-settings-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <CardContent className="space-y-6 mt-4">
                {/* Y-Axis Formatter */}
                <div className="space-y-4">
                  <FormatterSection
                    axis="y"
                    label={t('chart_editor_y_axis_formatter', 'Y-Axis (Values)')}
                    formatterType={formatters.yFormatterType || 'none'}
                    onFormatterTypeChange={handleYFormatterTypeChange}
                    customFormat={formatters.customYFormatter || '{value}'}
                    onCustomFormatChange={handleYCustomFormatChange}
                    currencySymbol={formatters.yCurrencySymbol || '$'}
                    onCurrencySymbolChange={handleYCurrencySymbolChange}
                    decimalPlaces={formatters.yDecimalPlaces || 2}
                    onDecimalPlacesChange={handleYDecimalPlacesChange}
                    sampleValue={12345.67}
                    detectedDataType={(yAxisDataTypes[0] as 'text' | 'number' | 'date') || null}
                    columnName={yAxisColumnNames[0] || null}
                    currencyStyle={formatters.yCurrencyStyle || 'symbol'}
                    onCurrencyStyleChange={handleYCurrencyStyleChange}
                    numberNotation={formatters.yNumberNotation || 'standard'}
                    onNumberNotationChange={handleYNumberNotationChange}
                    dateFormat={formatters.yDateFormat || 'short'}
                    onDateFormatChange={handleYDateFormatChange}
                    durationFormat={formatters.yDurationFormat || 'short'}
                    onDurationFormatChange={handleYDurationFormatChange}
                  />
                </div>

                {/* X-Axis Formatter */}
                <div className="space-y-4">
                  <FormatterSection
                    axis="x"
                    label={t('chart_editor_x_axis_formatter', 'X-Axis (Categories/Time)')}
                    formatterType={formatters.xFormatterType || 'none'}
                    onFormatterTypeChange={handleXFormatterTypeChange}
                    customFormat={formatters.customXFormatter || '{value}'}
                    onCustomFormatChange={handleXCustomFormatChange}
                    currencySymbol={formatters.xCurrencySymbol || '$'}
                    onCurrencySymbolChange={handleXCurrencySymbolChange}
                    decimalPlaces={formatters.xDecimalPlaces || 2}
                    onDecimalPlacesChange={handleXDecimalPlacesChange}
                    sampleValue={2024}
                    detectedDataType={(xAxisDataType as 'text' | 'number' | 'date') || null}
                    columnName={xAxisColumnName || null}
                    currencyStyle={formatters.xCurrencyStyle || 'symbol'}
                    onCurrencyStyleChange={handleXCurrencyStyleChange}
                    numberNotation={formatters.xNumberNotation || 'standard'}
                    onNumberNotationChange={handleXNumberNotationChange}
                    dateFormat={formatters.xDateFormat || 'short'}
                    onDateFormatChange={handleXDateFormatChange}
                    durationFormat={formatters.xDurationFormat || 'short'}
                    onDurationFormatChange={handleXDurationFormatChange}
                  />
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default ChartFormatterSettings;
