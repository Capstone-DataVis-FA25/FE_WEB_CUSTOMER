import CustomExcel from '../excel/CustomExcel';
import type { DataHeader, ParsedDataResult } from '@/utils/dataProcessors';
import { useDataset } from '@/contexts/DatasetContext';

function DataViewerContent() {
  const { currentParsedData, setCurrentParsedData, transformationColumn, setOriginalParsedData } =
    useDataset();

  const handleDataChange = (data: string[][], columns: DataHeader[]) => {
    // Update the current working data with user modifications
    const updatedData: ParsedDataResult = {
      headers: columns,
      data: data,
    };
    setCurrentParsedData(updatedData);

    // If no transformation is active, also update originalParsedData to keep them in sync
    if (!transformationColumn) {
      setOriginalParsedData(updatedData);
    }
  };

  const initialData = currentParsedData ? currentParsedData.data : [];
  const initialColumns = currentParsedData ? currentParsedData.headers : [];

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
