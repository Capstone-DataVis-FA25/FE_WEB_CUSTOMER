import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader } from '../ui/card';
import DragDropDatasetOperation from './DragDropDatasetOperation';
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
  const datasetDateFormat =
    (currentDataset as any)?.detectedDateFormat || currentDataset?.dateFormat;

  const availableColumns = useMemo(() => {
    const fallbackFormat = datasetDateFormat;

    if (currentDataset?.headers) {
      return (currentDataset.headers as any[]).map((h: any) => ({
        id: h.id || h.headerId || String(h.name || ''),
        name: h.name || '',
        type: (h.type as DatasetColumnType) || 'text',
        dateFormat:
          ((h.type as DatasetColumnType) || 'text') === 'date'
            ? h.dateFormat || fallbackFormat
            : undefined,
      }));
    }
    if (processedHeaders) {
      return processedHeaders.map((h, idx) => ({
        id: (h as any).id || (h as any).headerId || String(h.name || `col_${idx + 1}`),
        name: h.name || '',
        type: ((h as any).type as DatasetColumnType) || 'text',
        dateFormat:
          (((h as any).type as DatasetColumnType) || 'text') === 'date'
            ? (h as any).dateFormat || fallbackFormat
            : undefined,
      }));
    }
    return [];
  }, [currentDataset?.headers, processedHeaders, datasetDateFormat]);

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

  // Use the new drag-and-drop interface
  return <DragDropDatasetOperation className={className} processedHeaders={processedHeaders} />;
};

export default DatasetOperationSection;
