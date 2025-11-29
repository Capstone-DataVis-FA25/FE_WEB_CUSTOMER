import React, { useMemo, useState } from 'react';
import type { DatasetFilterColumn, DatasetColumnType } from '@/types/chart';
import type { NumberFormat } from '@/contexts/DatasetContext';
import { ColumnFilterSection } from '@/pages/chart-creator/operations/filters/FilterComponents';

interface InlineFilterCardProps {
  filter: DatasetFilterColumn;
  index: number;
  filters: DatasetFilterColumn[];
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  uniqueValuesByColumn: Record<string, string[]>;
  numberFormat?: NumberFormat;
  onUpdate: (next: DatasetFilterColumn) => void;
  onRemove: () => void;
  onDragStart: (filterId: string, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (filterId: string, event: React.DragEvent<HTMLDivElement>) => void;
}

const InlineFilterCard: React.FC<InlineFilterCardProps> = ({
  filter,
  index,
  filters,
  availableColumns,
  uniqueValuesByColumn,
  numberFormat,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [collapseSignal, setCollapseSignal] = useState(0);
  const usedColumnIds = useMemo(() => filters.map(f => f.columnId), [filters]);

  const resolveUniqueValues = useMemo(() => {
    const meta = availableColumns.find(c => c.id === filter.columnId);
    const candidates = [filter.columnId, meta?.id, meta?.name, filter.columnName].filter(
      Boolean
    ) as string[];
    for (const candidate of candidates) {
      if (candidate && uniqueValuesByColumn?.[candidate]) {
        return uniqueValuesByColumn[candidate];
      }
    }
    return undefined;
  }, [filter, availableColumns, uniqueValuesByColumn]);

  return (
    <div
      draggable
      onDragStart={event => {
        event.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
        setCollapseSignal(prev => prev + 1);
        onDragStart(filter.id, event);
      }}
      onDragEnd={event => {
        onDragEnd(filter.id, event);
        setIsDragging(false);
      }}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-0' : 'opacity-100'}`}
    >
      <ColumnFilterSection
        column={filter}
        availableColumns={availableColumns}
        usedColumnIds={usedColumnIds}
        onUpdate={onUpdate}
        onRemove={onRemove}
        numberFormat={numberFormat}
        uniqueValues={resolveUniqueValues}
        showRemoveButton={false}
        showColumnSelector={false}
        defaultExpanded={false}
        collapseSignal={collapseSignal}
      />
    </div>
  );
};

export default InlineFilterCard;
