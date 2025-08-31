import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';
import DataTable from './DataTable';

interface DataViewerContentProps {
  data: string[][] | null;
}

function DataViewerContent({ data }: DataViewerContentProps) {
  return (
    <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          Data Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable data={data || []} />
      </CardContent>
    </Card>
  );
}

export default DataViewerContent;
