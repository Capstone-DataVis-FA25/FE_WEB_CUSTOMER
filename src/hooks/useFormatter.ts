/**
 * Formatter Hook - Converts FormatterConfig to formatter functions
 * Used by chart components to apply formatting from chart editor config
 */

import { useMemo } from 'react';
import type { FormatterConfig } from '@/types/chart';
import { createFormatter } from '@/utils/formatValue';
import type { FormatterConfig as UtilFormatterConfig } from '@/utils/formatValue';

export interface UseFormatterResult {
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: number | string) => string;
}

/**
 * Convert chart FormatterConfig to formatter functions
 */
export function useFormatter(formatterConfig?: Partial<FormatterConfig>): UseFormatterResult {
  const yAxisFormatter = useMemo(() => {
    if (
      !formatterConfig ||
      !formatterConfig.useYFormatter ||
      formatterConfig.yFormatterType === 'none'
    ) {
      return undefined;
    }

    const config: UtilFormatterConfig = {
      type: formatterConfig.yFormatterType || 'none',
      customFormat: formatterConfig.customYFormatter,
      currencySymbol: formatterConfig.yCurrencySymbol,
      decimalPlaces: formatterConfig.yDecimalPlaces,
      currencyStyle: formatterConfig.yCurrencyStyle,
      numberNotation: formatterConfig.yNumberNotation,
      dateFormat: formatterConfig.yDateFormat,
      durationFormat: formatterConfig.yDurationFormat,
      useGrouping: formatterConfig.yUseGrouping,
    };

    return createFormatter(config);
  }, [
    formatterConfig?.useYFormatter,
    formatterConfig?.yFormatterType,
    formatterConfig?.customYFormatter,
    formatterConfig?.yCurrencySymbol,
    formatterConfig?.yDecimalPlaces,
    formatterConfig?.yCurrencyStyle,
    formatterConfig?.yNumberNotation,
    formatterConfig?.yDateFormat,
    formatterConfig?.yDurationFormat,
    formatterConfig?.yUseGrouping,
  ]);

  const xAxisFormatter = useMemo(() => {
    if (
      !formatterConfig ||
      !formatterConfig.useXFormatter ||
      formatterConfig.xFormatterType === 'none'
    ) {
      return undefined;
    }

    const config: UtilFormatterConfig = {
      type: formatterConfig.xFormatterType || 'none',
      customFormat: formatterConfig.customXFormatter,
      currencySymbol: formatterConfig.xCurrencySymbol,
      decimalPlaces: formatterConfig.xDecimalPlaces,
      currencyStyle: formatterConfig.xCurrencyStyle,
      numberNotation: formatterConfig.xNumberNotation,
      dateFormat: formatterConfig.xDateFormat,
      durationFormat: formatterConfig.xDurationFormat,
      useGrouping: formatterConfig.xUseGrouping,
    };

    // X-axis formatter can receive string or number
    return (value: number | string) => {
      if (value === null || value === undefined) {
        return '';
      }

      if (typeof value === 'string') {
        if (value.trim() === '') {
          return '';
        }

        // Try to parse as date first (for date strings like "2024-01-15")
        const dateTest = new Date(value);
        if (!isNaN(dateTest.getTime()) && config.type === 'date') {
          // It's a valid date string, format it as timestamp
          return createFormatter(config)(dateTest.getTime());
        }

        // Try to parse as number
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return createFormatter(config)(numValue);
        }

        // Return as-is if not parseable
        return value;
      }

      // Check for NaN numbers
      if (typeof value === 'number' && isNaN(value)) {
        return '';
      }

      return createFormatter(config)(value);
    };
  }, [
    formatterConfig?.useXFormatter,
    formatterConfig?.xFormatterType,
    formatterConfig?.customXFormatter,
    formatterConfig?.xCurrencySymbol,
    formatterConfig?.xDecimalPlaces,
    formatterConfig?.xCurrencyStyle,
    formatterConfig?.xNumberNotation,
    formatterConfig?.xDateFormat,
    formatterConfig?.xDurationFormat,
    formatterConfig?.xUseGrouping,
  ]);

  return {
    yAxisFormatter,
    xAxisFormatter,
  };
}
