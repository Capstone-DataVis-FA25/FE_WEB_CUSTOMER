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
import type { DatasetConfig, SortLevel } from '@/types/chart';
import { buildColumnIndexMap } from '@/utils/datasetOps';

interface DataTabProps {
  initialData?: string[][];
  initialColumns?: DataHeader[];
  originalColumns?: DataHeader[]; // Original columns before aggregation (for filter/sort operations)
  originalData?: string[][]; // Original data before aggregation (for unique values calculation)
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
  originalColumns,
  originalData,
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
  // This is for display data (processed/aggregated)
  const formattedData = React.useMemo(() => {
    if (!initialData || !initialColumns || initialColumns.length === 0) return initialData;
    return preformatDataToFormats(
      initialData,
      initialColumns,
      initialNumberFormat,
      initialDateFormat
    );
  }, [initialData, initialColumns, initialNumberFormat, initialDateFormat]);

  // Format original data for unique values calculation (before any processing)
  const formattedOriginalData = React.useMemo(() => {
    if (!originalData || !originalColumns || originalColumns.length === 0) return originalData;
    return preformatDataToFormats(
      originalData,
      originalColumns,
      initialNumberFormat,
      initialDateFormat
    );
  }, [originalData, originalColumns, initialNumberFormat, initialDateFormat]);

  // Use original columns for filter/sort operations, aggregated columns for display
  const columnsForOperations = originalColumns || initialColumns;

  // Build a lookup from various header identifiers to column index
  const columnIndexMap = React.useMemo(
    () => buildColumnIndexMap(columnsForOperations),
    [columnsForOperations]
  );

  // Calculate unique values from ORIGINAL dataset (before filter/sort/aggregation)
  // This ensures equals/not equals dropdowns work correctly
  const uniqueValuesByColumn = React.useMemo(() => {
    const colsToUse = columnsForOperations || initialColumns;
    // MUST use original formatted data, not processed/aggregated data
    const dataToUse = formattedOriginalData;
    if (!dataToUse || !colsToUse || colsToUse.length === 0) return {} as Record<string, string[]>;
    const MAX_TRACKED_UNIQUE_VALUES = Number.POSITIVE_INFINITY; // allow collecting all unique values
    const columnKeys = colsToUse.map(
      (col, idx) => (col as any).id || (col as any).headerId || String(col.name || `col_${idx + 1}`)
    );
    const maps = colsToUse.map(() => new Map<string, string>());

    // Calculate unique values from original dataset (before any processing)
    for (const row of dataToUse) {
      if (!row) continue;
      colsToUse.forEach((_, idx) => {
        if (idx >= row.length) return; // Skip if index out of bounds
        const map = maps[idx];
        if (!map) return;
        if (map.size >= MAX_TRACKED_UNIQUE_VALUES) return;
        const raw = (row as any)[idx];
        const str = raw === null || raw === undefined ? '' : String(raw).trim();
        if (!map.has(str)) {
          map.set(str, str);
        }
      });
    }

    const result: Record<string, string[]> = {};
    colsToUse.forEach((_, idx) => {
      const key = columnKeys[idx];
      if (!key) return;
      const colType = (colsToUse[idx] as any)?.type || 'text';
      const values = Array.from(maps[idx].values()).sort((a, b) => {
        // For number columns, try numeric sorting first
        if (colType === 'number') {
          // Remove formatting (commas, spaces) for comparison
          const cleanA = a.replace(/[,\s]/g, '');
          const cleanB = b.replace(/[,\s]/g, '');
          const numA = Number.parseFloat(cleanA);
          const numB = Number.parseFloat(cleanB);
          if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
            return numA - numB;
          }
          // If one is numeric and one isn't, numeric comes first
          if (!Number.isNaN(numA)) return -1;
          if (!Number.isNaN(numB)) return 1;
        }
        // Fallback to locale-aware string comparison
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
      });
      result[key] = values;
    });

    return result;
  }, [formattedOriginalData, columnsForOperations, initialColumns]);

  // Data is already processed (filtered, sorted, aggregated) by ChartEditorPage
  // Just use the passed data directly
  const displayData = formattedData;
  const displayHeaders = initialColumns;

  // Stable key to remount grid when headers, filters, sort, or aggregation change
  const excelKey = React.useMemo(() => {
    const colsSig = (displayHeaders || [])
      .map(c => `${c.id ?? ''}|${c.name ?? ''}|${c.type ?? 'text'}`)
      .join('||');
    const hlSig = `${(highlightHeaderIds || []).join(',')}`;
    const sortSig = (datasetConfig?.sort || []).map(l => `${l.columnId}:${l.direction}`).join('|');
    const filterSig = datasetConfig?.filters
      ? `filt_${datasetConfig.filters.map(f => `${f.columnId}_${(f.conditions || []).map(c => `${c.operator}_${JSON.stringify(c.value)}`).join(',')}`).join('|')}`
      : 'nofilt';
    const aggSig = datasetConfig?.aggregation
      ? `agg_${(datasetConfig.aggregation.groupBy || []).map(g => g.id).join(',')}_${(datasetConfig.aggregation.metrics || []).map(m => m.id).join(',')}`
      : 'noagg';
    return `${colsSig}__${hlSig}__${sortSig}__${filterSig}__${aggSig}`;
  }, [
    displayHeaders,
    highlightHeaderIds,
    datasetConfig?.sort,
    datasetConfig?.filters,
    datasetConfig?.aggregation,
  ]);

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
    <div className="w-full h-full min-h-0 bg-white dark:bg-gray-900">
      {/* Custom Excel - Full Width */}
      <div className="w-full h-full min-h-0 min-w-0 p-4 overflow-hidden">
        {/* Legend (yellow only) */}
        <div className="mb-2 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-300 border border-amber-500" />
            <span>Used by current chart</span>
          </div>
        </div>
        <div className="relative h-full min-h-[60vh]">
          {displayHeaders && displayHeaders.length > 0 ? (
            <DatasetProvider>
              <ApplyFormats nf={initialNumberFormat} df={initialDateFormat} />
              <CustomExcel
                key={excelKey}
                initialData={displayData}
                initialColumns={displayHeaders}
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
    </div>
  );
};

export default DataTab;
