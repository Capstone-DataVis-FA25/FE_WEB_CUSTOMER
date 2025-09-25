import React, { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useDataset, type NumberFormat } from '@/contexts/DatasetContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { useAppSelector } from '@/store/hooks';

interface NumberFormatSelectorProps {
  thousandsSeparator: string;
  decimalSeparator: string;
  onChange: (format: NumberFormat) => void;
  disabled?: boolean;
}

export const NumberFormatSelector: React.FC<NumberFormatSelectorProps> = ({
  thousandsSeparator,
  decimalSeparator,
  onChange,
  disabled = false,
}) => {
  const { validationErrors, setValidationError } = useDataset();
  const { creating: isUploading } = useAppSelector(state => state.dataset);
  const [isCustom, setIsCustom] = useState(false);
  const [customNumberFormat, setCustomNumberFormat] = useState<NumberFormat>({
    thousandsSeparator: '',
    decimalSeparator: '',
  });
  const numberFormats = [
    {
      key: 'US (1,234.56)',
      value: {
        thousandsSeparator: ',',
        decimalSeparator: '.',
      },
      label: 'US (1,234.56)',
      example: '1,234.56',
    },
    {
      key: 'EU (1.234,56)',
      value: {
        thousandsSeparator: '.',
        decimalSeparator: ',',
      },
      label: 'EU (1.234,56)',
      example: '1.234,56',
    },
    {
      key: 'Custom',
      value: {
        thousandsSeparator: '',
        decimalSeparator: '',
      },
      label: 'Custom',
      example: '',
    },
  ] as const;

  // Update validation errors whenever format changes
  useEffect(() => {
    const separatorsEqual =
      isCustom &&
      !!(
        customNumberFormat.thousandsSeparator &&
        customNumberFormat.decimalSeparator &&
        customNumberFormat.thousandsSeparator === customNumberFormat.decimalSeparator
      );
    const missingDecimalSeparator =
      isCustom &&
      (!customNumberFormat.decimalSeparator || customNumberFormat.decimalSeparator.trim() === '');

    setValidationError('numberFormat', 'separatorsEqual', separatorsEqual);
    setValidationError('numberFormat', 'missingDecimalSeparator', missingDecimalSeparator);
  }, [customNumberFormat, setValidationError, isCustom]);

  // Get current error states
  const separatorsAreEqual = validationErrors.numberFormat?.separatorsEqual || false;
  const isDecimalSeparatorMissing = validationErrors.numberFormat?.missingDecimalSeparator || false;
  const hasValidationError = separatorsAreEqual || isDecimalSeparatorMissing;
  const selectedNumberFormat = isCustom
    ? 'Custom'
    : numberFormats.find(
        numberFormat =>
          numberFormat.value.decimalSeparator === decimalSeparator &&
          numberFormat.value.thousandsSeparator === thousandsSeparator
      )?.key;

  // Placeholder: apply number/date formats to current data (wire actual logic later)
  const proceedParsingByNumberFormat = useCallback(
    (thousandsSeparator: string, decimalSeparator: string) => {
      console.log('Proceed parsing by format', { thousandsSeparator, decimalSeparator });
    },
    []
  );
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        Number Format
      </label>
      <div className="space-y-2">
        <Select
          value={selectedNumberFormat}
          onValueChange={v => {
            const data = JSON.parse(v) as {
              thousandsSeparator: string;
              decimalSeparator: string;
            };

            const isEmpty = data.thousandsSeparator === '' && data.decimalSeparator === '';
            const isSame =
              data.thousandsSeparator === thousandsSeparator &&
              data.decimalSeparator === decimalSeparator;

            // Skip if nothing changes
            if ((isCustom && isEmpty) || (!isCustom && isSame)) {
              return;
            }

            if (isEmpty) {
              setIsCustom(true);
            } else {
              setIsCustom(false);
              proceedParsingByNumberFormat(data.thousandsSeparator, data.decimalSeparator);
            }

            onChange(data);
          }}
        >
          <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Select number format" />
          </SelectTrigger>
          <SelectContent>
            {numberFormats.map(numberFormat => (
              <SelectItem key={numberFormat.key} value={JSON.stringify(numberFormat.value)}>
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono">{numberFormat.label}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-4">
                    {numberFormat.example}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isCustom && (
          <>
            {/* Thousands Separator */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="thousands-separator"
                className="text-xs font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0"
              >
                Thousands Separator
              </label>
              <Input
                id="thousands-separator"
                type="text"
                placeholder=","
                value={customNumberFormat.thousandsSeparator}
                onChange={e =>
                  setCustomNumberFormat({
                    thousandsSeparator: e.target.value.slice(0, 1),
                    decimalSeparator: customNumberFormat.decimalSeparator,
                  })
                }
                className={`w-12 h-8 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ml-auto ${
                  separatorsAreEqual
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={disabled}
                maxLength={1}
              />
            </div>

            {/* Decimal Separator */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="decimal-separator"
                className="text-xs font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0"
              >
                Decimal Separator
              </label>
              <Input
                id="decimal-separator"
                type="text"
                placeholder="."
                value={customNumberFormat.decimalSeparator}
                onChange={e =>
                  setCustomNumberFormat({
                    thousandsSeparator: customNumberFormat.thousandsSeparator,
                    decimalSeparator: e.target.value.slice(0, 1),
                  })
                }
                className={`w-12 h-8 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ml-auto ${
                  hasValidationError
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={disabled}
                maxLength={1}
              />
            </div>

            {/* Error Messages */}
            {hasValidationError && (
              <div className="space-y-1">
                {isDecimalSeparatorMissing && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    • Decimal separator is required
                  </p>
                )}
                {separatorsAreEqual && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    • Separators cannot be the same character
                  </p>
                )}
              </div>
            )}

            {/* Apply formats action */}
            <div>
              <Button
                type="button"
                onClick={() => {
                  onChange(customNumberFormat);
                  if (isCustom) {
                    proceedParsingByNumberFormat(
                      customNumberFormat.thousandsSeparator,
                      customNumberFormat.decimalSeparator
                    );
                  } else {
                    proceedParsingByNumberFormat(thousandsSeparator, decimalSeparator);
                  }
                }}
                variant="outline"
                className="w-full"
                disabled={hasValidationError || isUploading}
              >
                Apply format
              </Button>
            </div>
          </>
        )}

        {/* Preview */}
        <div
          className={`mt-2 p-2 rounded text-xs ${
            hasValidationError
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-700'
          }`}
        >
          <span
            className={`${hasValidationError ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Preview:{' '}
          </span>
          <span
            className={`font-mono ${hasValidationError ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-gray-100'}`}
          >
            1{thousandsSeparator}234{decimalSeparator || '?'}56
          </span>
        </div>
      </div>
    </div>
  );
};
