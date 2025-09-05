import DataViewerOptions from './DataViewerOptions';
import DataViewerContent from './DataViewerContent';
import { useDataset } from '@/contexts/DatasetContext';

interface DataViewerProps {
  onUpload?: (name: string, description?: string) => void;
  onChangeData?: () => void;
}

function DataViewer({ onUpload, onChangeData }: DataViewerProps) {
  // Get states from context
  const { parsedData } = useDataset();

  return (
    <div className="flex gap-6 p-6">
      {/* Left Sidebar - Options */}
      <DataViewerOptions onUpload={onUpload} onChangeData={onChangeData} />

      {/* Main Content - Takes remaining width */}
      <div className="flex-1 min-w-0">
        <DataViewerContent data={parsedData?.data || null} />
      </div>
    </div>
  );
}

export default DataViewer;
