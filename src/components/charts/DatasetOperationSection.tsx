import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '../ui/card';
import FilterConfiguration from './FilterConfiguration';
import SortConfiguration from './SortConfiguration';
import AggregationConfiguration from './AggregationConfiguration';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import type { DatasetFilterColumn, DatasetColumnType } from '@/types/chart';
import type { DataHeader } from '@/utils/dataProcessors';
import { useAppSelector } from '@/store/hooks';
import { selectWorkingDataset } from '@/features/chartEditor/chartEditorSelectors';

interface DatasetOperationSectionProps {
  className?: string;
  processedHeaders?: DataHeader[];
}

const DatasetOperationSection: React.FC<DatasetOperationSectionProps> = ({
  className = '',
  processedHeaders,
}) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { chartConfig } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  // Only subscribe to currentDataset to avoid re-renders when datasets list is refreshed
  const currentDataset = useAppSelector(state => state.dataset.currentDataset);
  const working = useAppSelector(selectWorkingDataset);

  // Extract datasetConfig from chartConfig
  const datasetConfig = (chartConfig as any)?.datasetConfig;

  // Get available columns from currentDataset or processedHeaders
  const availableColumns = useMemo(() => {
    if (currentDataset?.headers) {
      return (currentDataset.headers as any[]).map((h: any) => ({
        id: h.id || h.headerId || String(h.name || ''),
        name: h.name || '',
        type: (h.type as DatasetColumnType) || 'text',
        dateFormat: h.dateFormat,
      }));
    }
    if (processedHeaders) {
      return processedHeaders.map((h, idx) => ({
        id: (h as any).id || (h as any).headerId || String(h.name || `col_${idx + 1}`),
        name: h.name || '',
        type: ((h as any).type as DatasetColumnType) || 'text',
        dateFormat: (h as any).dateFormat,
      }));
    }
    return [];
  }, [currentDataset?.headers, processedHeaders]);

  // Get number format from dataset
  const numberFormat = useMemo(() => {
    if (currentDataset) {
      const ds: any = currentDataset;
      return (
        ds.detectedNumberFormat ||
        (ds.decimalSeparator && ds.thousandsSeparator
          ? { decimalSeparator: ds.decimalSeparator, thousandsSeparator: ds.thousandsSeparator }
          : ds.numberFormat || undefined)
      );
    }
    return undefined;
  }, [currentDataset]);

  // Calculate unique values by column from working dataset
  const uniqueValuesByColumn = useMemo(() => {
    if (!working?.headers || !working?.data) return {} as Record<string, string[]>;
    const headers = working.headers as any[];
    const rows = working.data as string[][];
    const MAX_TRACKED_UNIQUE_VALUES = Number.POSITIVE_INFINITY;
    const maps = headers.map(() => new Map<string, string>());

    rows.forEach(row => {
      row.forEach((cell, colIdx) => {
        if (colIdx < maps.length && cell != null && cell !== '') {
          const str = String(cell).trim();
          if (str) maps[colIdx].set(str, str);
        }
      });
    });

    const result: Record<string, string[]> = {};
    headers.forEach((h, idx) => {
      const colId = (h as any).id || (h as any).headerId || String(h.name || `col_${idx + 1}`);
      const unique = Array.from(maps[idx].values()).sort();
      result[colId] =
        unique.length > MAX_TRACKED_UNIQUE_VALUES
          ? unique.slice(0, MAX_TRACKED_UNIQUE_VALUES)
          : unique;
    });
    return result;
  }, [working?.headers, working?.data]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const hasDataset = currentDataset && availableColumns.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.25 }}
      className={`select-none ${className}`}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={toggleCollapse}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('chart_editor_dataset_operation', 'Dataset Operation')}
            </h3>
            <motion.div
              className="flex items-center gap-2"
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </motion.div>
          </div>
        </CardHeader>

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="dataset-operation-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <CardContent className="space-y-4 mt-4">
                {!hasDataset ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                    {t(
                      'chart_editor_dataset_operation_no_dataset',
                      'Select a dataset to enable filter operations.'
                    )}
                  </div>
                ) : (
                  <>
                    <FilterConfiguration
                      availableColumns={availableColumns}
                      filters={(datasetConfig?.filters as unknown as DatasetFilterColumn[]) || []}
                      numberFormat={numberFormat}
                      uniqueValuesByColumn={uniqueValuesByColumn}
                      onFilterChange={cols =>
                        handleConfigChange({
                          datasetConfig: {
                            ...(datasetConfig || {}),
                            filters: cols.length ? (cols as any) : undefined,
                          },
                        } as any)
                      }
                    />
                    <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
                    <SortConfiguration
                      availableColumns={availableColumns}
                      sortLevels={datasetConfig?.sort || []}
                      onSortChange={(levels: any[]) =>
                        handleConfigChange({
                          datasetConfig: {
                            ...(datasetConfig || {}),
                            sort: levels.length ? levels : undefined,
                          },
                        } as any)
                      }
                    />
                    <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
                    <AggregationConfiguration
                      availableColumns={availableColumns}
                      groupBy={datasetConfig?.aggregation?.groupBy || []}
                      metrics={datasetConfig?.aggregation?.metrics || []}
                      onAggregationChange={(groupBy, metrics) =>
                        handleConfigChange({
                          datasetConfig: {
                            ...(datasetConfig || {}),
                            aggregation:
                              groupBy.length > 0 || metrics.length > 0
                                ? { groupBy, metrics }
                                : undefined,
                          },
                        } as any)
                      }
                    />
                  </>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default DatasetOperationSection;
