import CustomExcel from '../excel/CustomExcel';
// Local column type (mirrors the spreadsheet component's definition)
type Column = { name: string; type: 'string' | 'number' | 'decimal' };
import { useDataset } from '@/contexts/DatasetContext';

function DataViewerContent() {
  const { parsedData, setParsedData, setOriginalHeaders } = useDataset();

  const handleDataChange = (data: string[][], columns: Column[]) => {
    const newHeaders = columns.map(c => c.name);
    const newData = [newHeaders, ...data];
    setParsedData(newData);
    setOriginalHeaders(newHeaders);
  };

  const initialData = parsedData ? parsedData.slice(1) : [];
  const initialColumns = parsedData
    ? parsedData[0].map(name => ({ name, type: 'string' as const }))
    : [];

  return (
    <CustomExcel
      initialData={initialData}
      initialColumns={initialColumns}
      onDataChange={handleDataChange}
      mode="edit" // can be toggled to 'view' where needed
    />
  );
}

export default DataViewerContent;
