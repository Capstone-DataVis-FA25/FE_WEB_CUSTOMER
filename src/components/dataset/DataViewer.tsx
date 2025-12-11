import DataViewerOptions from './DataViewerOptions';
import DataViewerContent from './DataViewerContent';

interface DataViewerProps {
  onUpload?: () => void;
  onChangeData?: () => void;
}

function DataViewer({ onUpload, onChangeData }: DataViewerProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 relative">
      {/* Left Sidebar - Options */}
      <div className="w-full lg:w-[420px] lg:flex-shrink-0 relative z-20">
        <DataViewerOptions onUpload={onUpload} onChangeData={onChangeData} />
      </div>

      {/* Main Content - Takes remaining width */}
      <div className="flex-1 min-w-0 relative z-10">
        <DataViewerContent />
      </div>
    </div>
  );
}

export default DataViewer;
