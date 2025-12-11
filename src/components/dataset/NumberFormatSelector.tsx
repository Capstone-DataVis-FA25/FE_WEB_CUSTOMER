import React from 'react';
import { Input } from '@/components/ui/input';

interface NumberFormatSelectorProps {
  thousandsSeparator: string;
  decimalSeparator: string;
  onChange: (type: 'thousandsSeparator' | 'decimalSeparator', value: string) => void;
  disabled?: boolean;
}

export const NumberFormatSelector: React.FC<NumberFormatSelectorProps> = ({
  thousandsSeparator,
  decimalSeparator,
  onChange,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        Number Format
      </label>
      <div className="space-y-2">
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
            value={thousandsSeparator}
            onChange={e => onChange('thousandsSeparator', e.target.value.slice(0, 1))}
            className="w-12 h-8 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ml-auto"
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
            value={decimalSeparator}
            onChange={e => onChange('decimalSeparator', e.target.value.slice(0, 1))}
            className="w-12 h-8 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ml-auto"
            disabled={disabled}
            maxLength={1}
          />
        </div>

        {/* Preview */}
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
          <span className="text-gray-600 dark:text-gray-400">Preview: </span>
          <span className="font-mono text-gray-900 dark:text-gray-100">
            1{thousandsSeparator}234{decimalSeparator}56
          </span>
        </div>
      </div>
    </div>
  );
};
