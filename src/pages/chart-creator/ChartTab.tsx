import React from 'react';
import UnifiedChartEditor from '@/components/charts/UnifiedChartEditor';
import type { DataHeader } from '@/utils/dataProcessors';

interface ChartTabProps {
  processedHeaders?: DataHeader[];
}

const ChartTab: React.FC<ChartTabProps> = ({ processedHeaders }) => {
  return (
    <div className="h-full w-full">
      <UnifiedChartEditor processedHeaders={processedHeaders} />
    </div>
  );
};

export default ChartTab;
