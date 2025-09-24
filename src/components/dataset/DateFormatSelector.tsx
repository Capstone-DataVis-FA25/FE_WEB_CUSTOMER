import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateFormatSelectorProps {
  format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD' | 'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD';
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const DateFormatSelector: React.FC<DateFormatSelectorProps> = ({
  format,
  onChange,
  disabled = false,
}) => {
  const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2023' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2023' },
    { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD', example: '2023/12/31' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY', example: '31-12-2023' },
    { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY', example: '12-31-2023' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2023-12-31' },
  ] as const;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        Date Format
      </label>
      <div className="space-y-2">
        <Select
          value={format}
          onValueChange={v => {
            if (v === format) return; // no-op if same selection
            onChange(v);
          }}
        >
          <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="Select date format" />
          </SelectTrigger>
          <SelectContent>
            {dateFormats.map(dateFormat => (
              <SelectItem key={dateFormat.value} value={dateFormat.value}>
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono">{dateFormat.label}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-4">
                    {dateFormat.example}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Preview */}
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
          <span className="text-gray-600 dark:text-gray-400">Preview: </span>
          <span className="font-mono text-gray-900 dark:text-gray-100">
            {dateFormats.find(f => f.value === format)?.example || 'Invalid format'}
          </span>
        </div>
      </div>
    </div>
  );
};
