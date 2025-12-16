import { memo, useState } from 'react';
import DataViewerOptions from './DataViewerOptions';
import DataViewerContent from './DataViewerContent';
import CorrelationAnalysis from './CorrelationAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TrendingUp } from 'lucide-react';
import { useDataset } from '@/contexts/DatasetContext';

interface DataViewerProps {
  onUpload?: () => void;
  onChangeData?: () => void;
}

const DataViewer = memo(function DataViewer({ onUpload, onChangeData }: DataViewerProps) {
  const [activeTab, setActiveTab] = useState('data');
  const { currentParsedData } = useDataset();

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 relative">
      {/* Left Sidebar - Options */}
      <div className="w-full lg:w-[420px] lg:flex-shrink-0 relative z-20">
        <DataViewerOptions onUpload={onUpload} onChangeData={onChangeData} />
      </div>

      {/* Main Content - Takes remaining width */}
      <div className="flex-1 min-w-0 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Table className="w-4 h-4" />
              Dữ liệu
            </TabsTrigger>
            <TabsTrigger value="correlation" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Phân tích tương quan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-0">
            <DataViewerContent />
          </TabsContent>

          <TabsContent value="correlation" className="mt-0">
            {currentParsedData && (
              <CorrelationAnalysis
                headers={currentParsedData.headers}
                data={currentParsedData.data}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});

export default DataViewer;
