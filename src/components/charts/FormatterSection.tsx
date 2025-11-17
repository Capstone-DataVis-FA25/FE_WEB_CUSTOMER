import React, { useState, useCallback, useMemo } from 'react';
import { Info, Eye } from 'lucide-react';
import type { FormatterType, FormatterConfig } from '@/utils/formatValue';
import {
  getFormatterLabel,
  getFormatterDescription,
  getFormatterSymbol,
  formatValue,
  validateCustomFormat,
} from '@/utils/formatValue';

export interface FormatterSectionProps {
  /** Axis identifier (e.g., 'xAxis', 'yAxis') */
  axis: 'x' | 'y';
  /** Display label for the axis */
  label?: string;
  /** Current formatter type */
  formatterType: FormatterType;
  /** Custom format string (for custom type) */
  customFormat?: string;
  /** Currency symbol (for currency type) */
  currencySymbol?: string;
  /** Decimal places (for decimal/percentage types) */
  decimalPlaces?: number;
  /** Sample value for preview */
  sampleValue?: number;
  /** Detected data type from dataset column */
  detectedDataType?: 'text' | 'number' | 'date' | null;
  /** Column name for context */
  columnName?: string | null;
  /** Callback when formatter type changes */
  onFormatterTypeChange: (type: FormatterType) => void;
  /** Callback when custom format changes */
  onCustomFormatChange?: (format: string) => void;
  /** Callback when currency symbol changes */
  onCurrencySymbolChange?: (symbol: string) => void;
  /** Callback when decimal places change */
  onDecimalPlacesChange?: (places: number) => void;
  /** Whether this section is collapsible (default: true) */
  collapsible?: boolean;
  /** Whether section is initially collapsed (default: false) */
  defaultCollapsed?: boolean;
  // Sub-options callbacks
  onCurrencyStyleChange?: (style: 'symbol' | 'code' | 'name') => void;
  onNumberNotationChange?: (
    notation: 'standard' | 'compact' | 'scientific' | 'engineering'
  ) => void;
  onDateFormatChange?: (
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
  ) => void;
  onDurationFormatChange?: (format: 'short' | 'narrow' | 'long') => void;
  // Sub-option values
  currencyStyle?: 'symbol' | 'code' | 'name';
  numberNotation?: 'standard' | 'compact' | 'scientific' | 'engineering';
  dateFormat?:
    | 'auto'
    | 'numeric'
    | 'short'
    | 'medium'
    | 'long'
    | 'full'
    | 'relative'
    | 'year-only'
    | 'month-year'
    | 'iso';
  durationFormat?: 'short' | 'narrow' | 'long';
}

const FORMATTER_TYPES: FormatterType[] = [
  'none',
  'number',
  'currency',
  'percentage',
  'decimal',
  'scientific',
  'bytes',
  'duration',
  'date',
  'custom',
];

const FormatterSection: React.FC<FormatterSectionProps> = ({
  axis,
  label,
  formatterType,
  customFormat = '{value}',
  currencySymbol = '$',
  decimalPlaces = 2,
  sampleValue = 1234.56,
  detectedDataType = null,
  columnName = null,
  onFormatterTypeChange,
  onCustomFormatChange,
  onCurrencySymbolChange,
  onDecimalPlacesChange,
  collapsible = true,
  defaultCollapsed = false,
  currencyStyle = 'symbol',
  numberNotation = 'standard',
  dateFormat = 'short',
  durationFormat = 'short',
  onCurrencyStyleChange,
  onNumberNotationChange,
  onDateFormatChange,
  onDurationFormatChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [showPreview, setShowPreview] = useState(true);

  const axisLabel = label || (axis === 'x' ? 'X-Axis' : 'Y-Axis');

  // Build formatter config from current state
  const currentConfig: FormatterConfig = useMemo(
    () => ({
      type: formatterType,
      customFormat,
      currencySymbol,
      decimalPlaces,
      currencyStyle,
      numberNotation,
      dateFormat,
      durationFormat,
    }),
    [
      formatterType,
      customFormat,
      currencySymbol,
      decimalPlaces,
      currencyStyle,
      numberNotation,
      dateFormat,
      durationFormat,
    ]
  );

  // Generate preview with current config
  const previewOutput = useMemo(() => {
    try {
      return formatValue(sampleValue, currentConfig);
    } catch (error) {
      return 'Error';
    }
  }, [sampleValue, currentConfig]);

  // Validate custom format if type is custom
  const customFormatValidation = useMemo(() => {
    if (formatterType === 'custom') {
      return validateCustomFormat(customFormat);
    }
    return { valid: true };
  }, [formatterType, customFormat]);

  // Handle formatter type change
  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as FormatterType;
      onFormatterTypeChange(newType);
    },
    [onFormatterTypeChange]
  );

  // Toggle collapse
  const toggleCollapse = useCallback(() => {
    if (collapsible) {
      setIsCollapsed(prev => !prev);
    }
  }, [collapsible]);

  return (
    <div className="space-y-3 border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={toggleCollapse}
          className={`flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 ${
            collapsible ? 'hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer' : ''
          }`}
          type="button"
        >
          {collapsible && (
            <span className={`transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}>
              ▶
            </span>
          )}
          <span>
            {axisLabel} Formatter {getFormatterSymbol(formatterType)}
          </span>
        </button>

        {/* Preview toggle */}
        {!isCollapsed && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title={showPreview ? 'Hide preview' : 'Show preview'}
            type="button"
          >
            <Eye size={14} />
            <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
          </button>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="space-y-3">
          {/* Data Type Detection Badge */}
          {detectedDataType && columnName && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Column "{columnName}"</strong> is detected as{' '}
                  <span className="font-semibold uppercase">{detectedDataType}</span> type.
                  {detectedDataType === 'number' && formatterType === 'none' && (
                    <span className="block mt-1 text-amber-700 dark:text-amber-300">
                      💡 Suggestion: Use <strong>Number</strong> formatter for better readability
                    </span>
                  )}
                  {detectedDataType === 'date' && formatterType === 'none' && (
                    <span className="block mt-1 text-amber-700 dark:text-amber-300">
                      💡 Suggestion: Use <strong>Date</strong> formatter to display dates properly
                    </span>
                  )}
                  {detectedDataType === 'text' && formatterType !== 'none' && (
                    <span className="block mt-1 text-amber-700 dark:text-amber-300">
                      ℹ️ Note: Text columns typically don't need formatting
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Formatter Type Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Format Type
            </label>
            <select
              value={formatterType}
              onChange={handleTypeChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {FORMATTER_TYPES.map(type => (
                <option key={type} value={type}>
                  {getFormatterSymbol(type)} {getFormatterLabel(type)}
                </option>
              ))}
            </select>

            {/* Description */}
            <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-md">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              <span>{getFormatterDescription(formatterType)}</span>
            </div>
          </div>

          {/* Type-specific options */}
          {formatterType === 'currency' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={e => onCurrencySymbolChange?.(e.target.value)}
                  placeholder="$"
                  maxLength={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Examples: $, €, £, ¥, ₹, ₽, ₩
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Currency Style
                </label>
                <select
                  value={currencyStyle}
                  onChange={e =>
                    onCurrencyStyleChange?.(e.target.value as 'symbol' | 'code' | 'name')
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="symbol">Symbol ($1,234.56)</option>
                  <option value="code">Code (USD 1,234.56)</option>
                  <option value="name">Name (1,234.56 US dollars)</option>
                </select>
              </div>
            </>
          )}

          {formatterType === 'number' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Number Notation
              </label>
              <select
                value={numberNotation}
                onChange={e =>
                  onNumberNotationChange?.(
                    e.target.value as 'standard' | 'compact' | 'scientific' | 'engineering'
                  )
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="standard">Standard (1,234,567)</option>
                <option value="compact">Compact (1.2M)</option>
                <option value="scientific">Scientific (1.23e+6)</option>
                <option value="engineering">Engineering (1.235E6)</option>
              </select>
            </div>
          )}

          {formatterType === 'date' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={e =>
                    onDateFormatChange?.(
                      e.target.value as
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
                    )
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <optgroup label="💡 Recommended for Large Datasets (200+ records)">
                    <option value="numeric">🔥 Numeric - Ultra Compact (1/15)</option>
                    <option value="year-only">📅 Year Only (2025)</option>
                    <option value="month-year">📆 Month-Year (Jan '25)</option>
                  </optgroup>
                  <optgroup label="Standard Formats">
                    <option value="short">Short (Jan 15)</option>
                    <option value="medium">Medium (Jan 15, '25)</option>
                    <option value="long">Long (Jan 15, 2025)</option>
                    <option value="full">Full (Monday, January 15, 2025)</option>
                  </optgroup>
                  <optgroup label="Other Formats">
                    <option value="iso">ISO Format (2025-01-15)</option>
                    <option value="relative">Relative (2 days ago)</option>
                    <option value="auto">Auto (Smart)</option>
                  </optgroup>
                </select>
              </div>
              {/* Helpful hint for large datasets */}
              {(dateFormat === 'long' || dateFormat === 'full' || dateFormat === 'medium') && (
                <div className="text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-2.5 py-2">
                  <p className="text-amber-800 dark:text-amber-200">
                    ⚠️ <strong>Tip for large datasets:</strong> Consider using{' '}
                    <strong>Numeric</strong>, <strong>Year Only</strong>, or{' '}
                    <strong>Month-Year</strong> format for better readability when you have 200+
                    data points.
                  </p>
                </div>
              )}
            </>
          )}

          {formatterType === 'duration' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Duration Format
              </label>
              <select
                value={durationFormat}
                onChange={e =>
                  onDurationFormatChange?.(e.target.value as 'short' | 'narrow' | 'long')
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="short">Short (1h 23m)</option>
                <option value="narrow">Narrow (1h23m)</option>
                <option value="long">Long (1 hour 23 minutes)</option>
              </select>
            </div>
          )}

          {(formatterType === 'decimal' || formatterType === 'percentage') && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Decimal Places
              </label>
              <input
                type="number"
                value={decimalPlaces}
                onChange={e => onDecimalPlacesChange?.(parseInt(e.target.value, 10) || 2)}
                min={0}
                max={10}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {formatterType === 'custom' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Custom Format String
              </label>
              <input
                type="text"
                value={customFormat}
                onChange={e => onCustomFormatChange?.(e.target.value)}
                placeholder="{value} units"
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  customFormatValidation.valid
                    ? 'border-gray-300 dark:border-gray-600'
                    : 'border-red-500 dark:border-red-400'
                }`}
              />

              {/* Validation error */}
              {!customFormatValidation.valid && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {customFormatValidation.error}
                </p>
              )}

              {/* Help text */}
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-2 rounded-md space-y-1">
                <p className="font-medium">Available placeholders:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{value}'}</code> -
                    Original value
                  </li>
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{round}'}</code> -
                    Rounded integer
                  </li>
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{abs}'}</code> -
                    Absolute value
                  </li>
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{sign}'}</code> -
                    Sign (+/-)
                  </li>
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{fixed1}'}</code>,{' '}
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{fixed2}'}</code>,{' '}
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{fixed3}'}</code>{' '}
                    - Fixed decimals
                  </li>
                </ul>
                <p className="mt-2 font-medium">Examples:</p>
                <ul className="list-none space-y-0.5 ml-2">
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                      {'{value} units'}
                    </code>{' '}
                    → 1234.56 units
                  </li>
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                      {'{sign}{fixed2}%'}
                    </code>{' '}
                    → +1234.56%
                  </li>
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">${'{round}'}</code>{' '}
                    → $1235
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Live Preview */}
          {showPreview && (
            <div className="space-y-1.5 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-3 py-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Live Preview
                </span>
                <Eye size={14} className="text-blue-600 dark:text-blue-400" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Input */}
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Input:</p>
                  <p className="font-mono bg-white dark:bg-gray-800 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600">
                    {sampleValue}
                  </p>
                </div>

                {/* Output */}
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Output:</p>
                  <p className="font-mono bg-white dark:bg-gray-800 px-2 py-1.5 rounded border border-blue-300 dark:border-blue-600 font-semibold text-blue-700 dark:text-blue-300">
                    {previewOutput}
                  </p>
                </div>
              </div>

              {/* More examples */}
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium">
                  More examples
                </summary>
                <div className="mt-2 space-y-1 pl-2">
                  {[0, 1, 100, 1000, 1000000, -500.5].map(val => (
                    <div
                      key={val}
                      className="flex justify-between gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <span className="font-mono text-gray-500 dark:text-gray-400">{val}</span>
                      <span className="font-mono font-medium">
                        {formatValue(val, currentConfig)}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* Quick Tips */}
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-2 rounded-md border border-yellow-200 dark:border-yellow-800">
            <p className="font-medium mb-1">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1">
              <li>Large numbers automatically use K/M/B abbreviations</li>
              <li>Preview updates in real-time as you change settings</li>
              <li>Format applies to all {axisLabel.toLowerCase()} labels and tooltips</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormatterSection;
