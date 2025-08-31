import DataViewerOptions from './DataViewerOptions';
import DataViewerContent from './DataViewerContent';

interface DataViewerProps {
  data: string[][] | null;
  isUploading: boolean;
  onUpload: (name: string) => void;
  onChangeData: () => void;
  onDelimiterChange?: (delimiter: string) => void;
}

function DataViewer({
  data,
  isUploading,
  onUpload,
  onChangeData,
  onDelimiterChange,
}: DataViewerProps) {
  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Options */}
      <DataViewerOptions
        isUploading={isUploading}
        onUpload={onUpload}
        onChangeData={onChangeData}
        onDelimiterChange={onDelimiterChange}
      />

      {/* Main Content - Takes remaining width */}
      <div className="flex-1 pr-6">
        <DataViewerContent data={data} />
      </div>
    </div>
  );
}

export default DataViewer;
