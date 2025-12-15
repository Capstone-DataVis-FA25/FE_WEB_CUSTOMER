import React from 'react';
import UnifiedChartEditor from '@/components/charts/UnifiedChartEditor';
import type { DataHeader } from '@/utils/dataProcessors';

interface ChartTabProps {
  processedHeaders?: DataHeader[];
  setDataId: (dataId: string) => void;
  datasetId?: string;
  showLeftSidebar?: boolean;
}

const ChartTab: React.FC<ChartTabProps> = ({
  processedHeaders,
  setDataId,
  datasetId,
  showLeftSidebar = true,
}) => {
  return (
    <div className="h-full w-full">
      <UnifiedChartEditor
        processedHeaders={processedHeaders}
        setDataId={setDataId}
        datasetId={datasetId}
        showLeftSidebar={showLeftSidebar}
      />
    </div>
  );
};

export default ChartTab;
