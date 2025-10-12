import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

interface DataTransformationSelectorProps {
  headers: string[];
  value?: string;
  onChange?: (column: string) => void;
  disabled?: boolean;
}

const DataTransformationSelector: React.FC<DataTransformationSelectorProps> = ({
  headers,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Data Transformation
      </label>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">
            Stack on
          </label>
          <div className="ml-auto w-full max-w-xs min-w-0">
            <Select
              value={value}
              onValueChange={v => {
                if (v === value) return; // no-op if same selection
                onChange?.(v);
              }}
            >
              <SelectTrigger disabled={disabled} className="truncate">
                <SelectValue placeholder="Select column" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                {/* Show reset option only after a column is chosen */}
                {value ? <SelectItem value="">Do not stack</SelectItem> : null}
                {headers && headers.length > 0 ? (
                  headers.map((h, idx) => (
                    <SelectItem key={`${h}-${idx}`} value={h} className="truncate">
                      <span className="truncate" title={h || `Column ${idx + 1}`}>
                        {h || `Column ${idx + 1}`}
                      </span>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                    No headers available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTransformationSelector;
