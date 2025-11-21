import React from 'react';
import UnifiedChartEditor from '@/components/charts/UnifiedChartEditor';
import type { DataHeader } from '@/utils/dataProcessors';

interface ChartTabProps {
  processedHeaders?: DataHeader[];
  setDataId: (dataId: string) => void;
}

const ChartTab: React.FC<ChartTabProps> = ({ processedHeaders, setDataId }) => {
  return (
    <div className="h-full w-full">
      <UnifiedChartEditor processedHeaders={processedHeaders} setDataId={setDataId} />
    </div>
  );
};

export default ChartTab;
