import React from 'react';
import type { DataHeader } from '@/utils/dataProcessors';
import { preformatDataToFormats } from '@/utils/dataProcessors';
import CustomExcel from '@/components/excel/CustomExcel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  DatasetProvider,
  useDataset,
  type NumberFormat,
  type DateFormat,
} from '@/contexts/DatasetContext';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

interface DataTabProps {
  initialData?: string[][];
  initialColumns?: DataHeader[];
  loading?: boolean;
  onOpenDatasetModal?: () => void;
  initialNumberFormat?: NumberFormat;
  initialDateFormat?: DateFormat;
  onDataChange?: (d: string[][], c: DataHeader[]) => void;
  onSorting?: (s: { column: number; direction: 'asc' | 'desc' } | null) => void;
  datasetName?: string;
  highlightHeaderIds?: string[];
}

const ApplyFormats: React.FC<{ nf?: NumberFormat; df?: DateFormat }> = ({ nf, df }) => {
  const { setNumberFormat, setDateFormat } = useDataset();
  React.useEffect(() => {
    if (nf) setNumberFormat(nf);
    if (df) setDateFormat(df);
  }, [nf, df, setNumberFormat, setDateFormat]);
  return null;
};

const DataTab: React.FC<DataTabProps> = ({
  initialData,
  initialColumns,
  loading,
  onOpenDatasetModal,
  initialNumberFormat,
  initialDateFormat,
  onDataChange,
  onSorting,
  datasetName,
  highlightHeaderIds,
}) => {
  // Removed artificial padding rows; render exactly what dataset provides

  // Normalize API values into strings that match the selected formats to prevent validation errors
  const formattedData = React.useMemo(() => {
    if (!initialData || !initialColumns || initialColumns.length === 0) return initialData;
    return preformatDataToFormats(
      initialData,
      initialColumns,
      initialNumberFormat,
      initialDateFormat
    );
  }, [initialData, initialColumns, initialNumberFormat, initialDateFormat]);

  // Stable key to remount grid when headers or highlight inputs change
  const excelKey = React.useMemo(() => {
    const colsSig = (initialColumns || [])
      .map(c => `${c.id ?? ''}|${c.name ?? ''}|${c.type ?? 'text'}`)
      .join('||');
    const hlSig = `${(highlightHeaderIds || []).join(',')}`;
    return `${colsSig}__${hlSig}`;
  }, [initialColumns, highlightHeaderIds]);

  React.useEffect(() => {
    console.log('[HighlightDebug][DataTab] excelKey & props', {
      excelKey,
      highlightHeaderIds: highlightHeaderIds || [],
      headers: (initialColumns || []).map(c => ({
        id: (c as any).id ?? (c as any).headerId,
        name: c.name,
      })),
    });
  }, [excelKey, highlightHeaderIds, initialColumns]);

  return (
    <div className="w-full h-full min-h-0 flex bg-white dark:bg-gray-900">
      {/* Left: Custom Excel */}
      <div className="flex-1 h-full min-h-0 min-w-0 p-4 overflow-hidden">
        {/* Legend */}
        <div className="mb-2 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-300 border border-amber-500" />
            <span>Used by current chart</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-200 border border-blue-400" />
            <span>Selected row highlight</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-200 border border-red-400" />
            <span>Invalid cell</span>
          </div>
        </div>
        {loading ? (
          <div className="h-full min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : initialColumns && initialColumns.length > 0 ? (
          <DatasetProvider>
            <ApplyFormats nf={initialNumberFormat} df={initialDateFormat} />
            <CustomExcel
              key={excelKey}
              initialData={formattedData}
              initialColumns={initialColumns}
              allowHeaderEdit={false}
              allowColumnEdit={false}
              onDataChange={onDataChange}
              onSorting={onSorting}
              highlightHeaderIds={highlightHeaderIds}
            />
          </DatasetProvider>
        ) : (
          <div className="w-full max-w-full p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <div className="border rounded-md bg-white dark:bg-gray-800 h-[60vh] relative overflow-hidden flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              No dataset selected yet
            </div>
          </div>
        )}
      </div>

      {/* Right: Operation panel (placeholder, keep as-is for now) */}
      <div className="h-full min-h-0 w-[360px] min-w-[360px] max-w-[360px] border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
        <div className="mb-3 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenDatasetModal}
            className="flex items-center gap-2 self-start"
          >
            <Database className="w-4 h-4" />
            Select Dataset
          </Button>
          <div className="flex flex-col gap-1">
            {datasetName ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 self-start max-w-[280px]"
                title={datasetName}
              >
                <Database className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[240px]">{datasetName}</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 self-start"
                title="No dataset selected"
              >
                No dataset selected
              </span>
            )}
          </div>
        </div>
        <div className="h-px bg-gray-200 dark:bg-gray-800 mb-3" />
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Operation</div>
        <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
          This is the operation panel. Leave as-is for now.
        </div>
      </div>
    </div>
  );
};

export default DataTab;
