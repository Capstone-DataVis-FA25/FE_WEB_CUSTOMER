import React from 'react';
import DragDropDatasetOperation from './DragDropDatasetOperation';
import type { DataHeader } from '@/utils/dataProcessors';

interface DatasetOperationSectionProps {
  className?: string;
  processedHeaders?: DataHeader[];
}

const DatasetOperationSection: React.FC<DatasetOperationSectionProps> = ({
  className = '',
  processedHeaders,
}) => {
  return <DragDropDatasetOperation className={className} processedHeaders={processedHeaders} />;
};

export default DatasetOperationSection;
