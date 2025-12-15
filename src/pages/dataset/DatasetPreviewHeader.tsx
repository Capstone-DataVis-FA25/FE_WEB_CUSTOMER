import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  t: any;
  currentDataset: any;
  onExport: () => void;
};

const DatasetPreviewHeader: React.FC<Props> = ({ t, currentDataset, onExport }) => {
  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Columns: {currentDataset.columnCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Rows: {currentDataset.rowCount?.toLocaleString()}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 pl-4 ml-2 border-l border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="font-semibold">Thousands Separator:</span>
              <code className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 text-gray-800 dark:text-gray-200 text-[11px] font-mono">
                {(currentDataset.thousandsSeparator || ',') === ' '
                  ? '␠'
                  : currentDataset.thousandsSeparator || ','}
              </code>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-semibold">Decimal Separator:</span>
              <code className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 text-gray-800 dark:text-gray-200 text-[11px] font-mono">
                {currentDataset.decimalSeparator || '.'}
              </code>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-semibold">Date:</span>
              <code className="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-700/70 text-gray-800 dark:text-gray-200 text-[11px] font-mono">
                {currentDataset.dateFormat || 'YYYY-MM-DD'}
              </code>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onExport}
            className="ml-3"
            aria-label={t('export_csv', 'Export CSV')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DatasetPreviewHeader;
