import DataViewerOptions from './DataViewerOptions';
import DataViewerContent from './DataViewerContent';
import { useDataset } from '@/contexts/DatasetContext';

interface DataViewerProps {
  onUpload: (name: string, description?: string) => void;
  onChangeData: () => void;
  onDelimiterChange?: (delimiter: string) => void;
  onNumberFormatChange?: (thousandsSeparator: string, decimalSeparator: string) => void;
}

function DataViewer({
  onUpload,
  onChangeData,
  onDelimiterChange,
  onNumberFormatChange,
}: DataViewerProps) {
  // Get states from context
  const { parsedData } = useDataset();
  return (
    <div className="flex gap-6 p-6">
      {/* Left Sidebar - Options */}
      <DataViewerOptions
        onUpload={onUpload}
        onChangeData={onChangeData}
        onDelimiterChange={onDelimiterChange}
        onNumberFormatChange={onNumberFormatChange}
      />

      {/* Main Content - Takes remaining width */}
      <div className="flex-1 min-w-0">
        <DataViewerContent data={parsedData?.data || null} />
      </div>
    </div>
  );
}

export default DataViewer;
