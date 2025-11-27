import React from 'react';
import type { DatasetConfig, DatasetColumnType } from '@/types/chart';
import OperationsBanner from './OperationsBanner';
import type { NumberFormat } from '@/contexts/DatasetContext';

interface DataOperationsPanelProps {
  datasetName?: string;
  onOpenDatasetModal?: () => void;
  availableColumns?: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  datasetConfig?: DatasetConfig;
  onDatasetConfigChange: (next?: DatasetConfig) => void;
  numberFormat?: NumberFormat;
  uniqueValuesByColumn?: Record<string, string[]>;
}

const DataOperationsPanel: React.FC<DataOperationsPanelProps> = ({
  datasetName,
  onOpenDatasetModal,
  availableColumns = [],
  datasetConfig,
  onDatasetConfigChange,
  numberFormat,
  uniqueValuesByColumn,
}) => {
  return (
    <div className="h-full min-h-0 w-[480px] min-w-[480px] max-w-[480px] border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-y-auto hide-scrollbar select-none">
      {!datasetName || availableColumns.length === 0 ? (
        <OperationsBanner
          title="Operations Disabled"
          message="Select a dataset to enable sort and other operations."
        />
      ) : (
        <OperationsBanner
          title="Operations Moved"
          message="Filter, Sort, and Aggregation operations have been moved to the Dataset Operation section in the chart editor sidebar."
        />
      )}

      <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />
      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
        Other Operations
      </div>
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
        Additional operations coming soon...
      </div>
    </div>
  );
};

export default DataOperationsPanel;
