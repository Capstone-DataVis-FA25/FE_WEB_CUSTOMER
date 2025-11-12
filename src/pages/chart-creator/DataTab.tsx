import React from 'react';
import type { DataHeader } from '@/utils/dataProcessors';
import { preformatDataToFormats } from '@/utils/dataProcessors';
import CustomExcel from '@/components/excel/CustomExcel';
import {
  DatasetProvider,
  useDataset,
  type NumberFormat,
  type DateFormat,
} from '@/contexts/DatasetContext';
import DataOperationsPanel from './operations/DataOperationsPanel';
import type { DatasetConfig, SortLevel } from '@/types/chart';
import { buildColumnIndexMap, applyMultiLevelSort, applyDatasetFilters } from '@/utils/datasetOps';

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
  datasetConfig?: DatasetConfig;
  onDatasetConfigChange: (next?: DatasetConfig) => void;
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
  datasetConfig,
  onDatasetConfigChange,
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

  // Build a lookup from various header identifiers to column index
  const columnIndexMap = React.useMemo(() => buildColumnIndexMap(initialColumns), [initialColumns]);

  // Apply filters then multi-level sort to formatted data
  const sortLevels: SortLevel[] = React.useMemo(() => datasetConfig?.sort ?? [], [datasetConfig]);
  const filteredThenSorted = React.useMemo(() => {
    const filtered = applyDatasetFilters(
      formattedData,
      datasetConfig?.filters as any,
      columnIndexMap
    );
    return applyMultiLevelSort(filtered, sortLevels, columnIndexMap);
  }, [formattedData, datasetConfig?.filters, sortLevels, columnIndexMap]);

  // Stable key to remount grid when headers or highlight inputs change
  const excelKey = React.useMemo(() => {
    const colsSig = (initialColumns || [])
      .map(c => `${c.id ?? ''}|${c.name ?? ''}|${c.type ?? 'text'}`)
      .join('||');
    const hlSig = `${(highlightHeaderIds || []).join(',')}`;
    const sortSig = (datasetConfig?.sort || []).map(l => `${l.columnId}:${l.direction}`).join('|');
    return `${colsSig}__${hlSig}__${sortSig}`;
  }, [initialColumns, highlightHeaderIds, datasetConfig?.sort]);

  // React.useEffect(() => {
  //   console.log('[HighlightDebug][DataTab] excelKey & props', {
  //     excelKey,
  //     highlightHeaderIds: highlightHeaderIds || [],
  //     headers: (initialColumns || []).map(c => ({
  //       id: (c as any).id ?? (c as any).headerId,
  //       name: c.name,
  //     })),
  //   });
  // }, [excelKey, highlightHeaderIds, initialColumns]);

  return (
    <div className="w-full h-full min-h-0 flex bg-white dark:bg-gray-900">
      {/* Left: Custom Excel */}
      <div className="flex-1 h-full min-h-0 min-w-0 p-4 overflow-hidden">
        {/* Legend (yellow only) */}
        <div className="mb-2 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-300 border border-amber-500" />
            <span>Used by current chart</span>
          </div>
        </div>
        <div className="relative h-full min-h-[60vh]">
          {initialColumns && initialColumns.length > 0 ? (
            <DatasetProvider>
              <ApplyFormats nf={initialNumberFormat} df={initialDateFormat} />
              <CustomExcel
                key={excelKey}
                initialData={filteredThenSorted}
                initialColumns={initialColumns}
                mode="view"
                allowHeaderEdit={false}
                allowColumnEdit={false}
                onDataChange={onDataChange}
                onSorting={onSorting}
                highlightHeaderIds={highlightHeaderIds}
                disableSelection={true}
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
      </div>

      {/* Right: Operation panel */}
      <DataOperationsPanel
        datasetName={datasetName}
        onOpenDatasetModal={onOpenDatasetModal}
        availableColumns={(initialColumns || []).map((c, idx) => ({
          id: (c as any).id || (c as any).headerId || String(c.name || `col_${idx + 1}`),
          name: c.name || String((c as any).id || (c as any).headerId || `Column ${idx + 1}`),
          type: (c as any).type || 'text',
          dateFormat: (c as any).dateFormat,
        }))}
        datasetConfig={datasetConfig}
        onDatasetConfigChange={onDatasetConfigChange}
        numberFormat={initialNumberFormat}
      />
    </div>
  );
};

export default DataTab;
