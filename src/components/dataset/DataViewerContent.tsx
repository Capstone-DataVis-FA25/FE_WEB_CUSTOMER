import { memo, useCallback, useMemo } from 'react';
import CustomExcel from '../excel/CustomExcel';
import type { DataHeader, ParsedDataResult } from '@/utils/dataProcessors';
import { useDataset } from '@/contexts/DatasetContext';

const DataViewerContent = memo(function DataViewerContent() {
  const { currentParsedData, setCurrentParsedData } = useDataset();

  const handleDataChange = useCallback(
    (data: string[][], columns: DataHeader[]) => {
      // Update the current working data with user modifications
      const updatedData: ParsedDataResult = {
        headers: columns,
        data: data,
      };
      setCurrentParsedData(updatedData);
    },
    [setCurrentParsedData]
  );

  // Memoize initial data to prevent unnecessary re-renders
  // Use deep comparison to prevent re-renders when data is identical
  const initialData = useMemo(
    () => (currentParsedData ? currentParsedData.data : []),
    [currentParsedData?.data, currentParsedData?.headers] // More specific dependencies
  );

  const initialColumns = useMemo(
    () => (currentParsedData ? currentParsedData.headers : []),
    [currentParsedData?.headers] // Only depend on headers, not the whole object
  );

  return (
    <CustomExcel
      initialData={initialData}
      initialColumns={initialColumns}
      onDataChange={handleDataChange}
      mode="edit" // can be toggled to 'view' where needed
    />
  );
});

export default DataViewerContent;
