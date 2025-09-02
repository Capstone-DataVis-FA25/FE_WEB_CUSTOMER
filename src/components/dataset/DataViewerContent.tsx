import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';
import ExcelEditor from '../excel/ExcelEditor';

interface DataViewerContentProps {
  data: string[][] | null;
  onDataChange?: (data: string[][]) => void;
  onSave?: (data: string[][]) => void;
  readOnly?: boolean;
}

function DataViewerContent({ data, onDataChange, onSave, readOnly = false }: DataViewerContentProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Data Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 italic">No content to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ExcelEditor
      initialData={data}
      onDataChange={onDataChange}
      onSave={onSave}
      readOnly={readOnly}
      title="Data Preview"
    />
  );
}

export default DataViewerContent;
