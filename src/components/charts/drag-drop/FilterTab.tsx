import React, { useMemo, useRef, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DatasetFilterColumn, DatasetColumnType } from '@/types/chart';
import type { NumberFormat } from '@/contexts/DatasetContext';
import InlineFilterCard from './InlineFilterCard';
import { FilterSummaryButton } from '@/pages/chart-creator/operations/filters/FilterSummaryButton';

interface FilterTabProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  filters: DatasetFilterColumn[];
  numberFormat?: NumberFormat;
  uniqueValuesByColumn: Record<string, string[]>;
  onFilterChange: (cols: DatasetFilterColumn[]) => void;
}

const FilterTab: React.FC<FilterTabProps> = ({
  availableColumns,
  filters,
  numberFormat,
  uniqueValuesByColumn,
  onFilterChange,
}) => {
  const dragRegionRef = useRef<HTMLDivElement | null>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: 'filter-drop-zone',
    data: { zone: 'filter' },
  });
  const assignDropZoneRef = useCallback(
    (node: HTMLDivElement | null) => {
      dragRegionRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  const handleFilterUpdate = useCallback(
    (index: number, next: DatasetFilterColumn) => {
      const nextFilters = [...filters];
      nextFilters[index] = next;
      onFilterChange(nextFilters);
    },
    [filters, onFilterChange]
  );

  const handleFilterRemove = useCallback(
    (index: number) => {
      const nextFilters = filters.filter((_, i) => i !== index);
      onFilterChange(nextFilters);
    },
    [filters, onFilterChange]
  );

  const handleFilterDragStart = useCallback(
    (_filterId: string, event: React.DragEvent<HTMLDivElement>) => {
      const element = event.currentTarget as HTMLElement | null;
      if (!element) return;

      // Prefer to use the compact header area for the drag image so it matches collapsed size
      const header = element.querySelector('[data-filter-header="true"]') as HTMLElement | null;
      const source = header || element;

      const clone = source.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.width = `${source.clientWidth}px`;
      clone.style.pointerEvents = 'none';
      clone.style.opacity = '0.7';
      document.body.appendChild(clone);
      event.dataTransfer.setDragImage(clone, source.clientWidth / 2, source.clientHeight / 2 || 20);
      requestAnimationFrame(() => {
        if (clone && clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      });
    },
    []
  );

  const handleFilterDragEnd = useCallback(
    (filterId: string, event: React.DragEvent<HTMLDivElement>) => {
      const bounds = dragRegionRef.current?.getBoundingClientRect();
      const { clientX, clientY } = event;
      const droppedInside =
        bounds &&
        clientX >= bounds.left &&
        clientX <= bounds.right &&
        clientY >= bounds.top &&
        clientY <= bounds.bottom;

      if (!droppedInside) {
        const index = filters.findIndex(f => f.id === filterId);
        if (index !== -1) {
          handleFilterRemove(index);
        }
      }
    },
    [filters, handleFilterRemove]
  );

  const filtersExist = filters.length > 0;

  return (
    <motion.div
      key="filter"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col"
    >
      <div className="mb-3">
        <FilterSummaryButton
          availableColumns={availableColumns}
          initialColumns={filters}
          numberFormat={numberFormat}
          uniqueValuesByColumn={uniqueValuesByColumn}
          onFilterChange={onFilterChange}
        />
      </div>

      {!filtersExist ? (
        <div
          ref={assignDropZoneRef}
          className={cn(
            'relative rounded-xl border-2 border-dashed transition-all duration-300 w-full h-[200px] flex items-center justify-center mb-4 overflow-hidden',
            isOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
              : 'border-blue-500/40 dark:border-blue-500/40 bg-gray-50/50 dark:bg-gray-800/50'
          )}
        >
          {isOver ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2 justify-center text-lg">
                <Plus className="w-6 h-6" />
                Drop column here to add filter
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500">
              <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Drop column here to add filter</p>
              <p className="text-xs mt-1 opacity-75">Drag a column from above into this area</p>
            </div>
          )}
        </div>
      ) : (
        <div
          ref={assignDropZoneRef}
          className={cn(
            'relative rounded-xl border border-blue-500/40 dark:border-blue-500/40 bg-gray-50/70 dark:bg-gray-900/40 p-3 -mx-2 shadow-inner shadow-black/5 transition-colors',
            isOver ? 'ring-2 ring-blue-400/60' : ''
          )}
        >
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium mb-2 px-1">
            <span className="text-gray-700 dark:text-gray-200 normal-case font-semibold">
              {filters.length} active {filters.length === 1 ? 'filter' : 'filters'}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              Drop columns to add
            </span>
          </div>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 preview-scrollbar pb-1">
            {filters.map((filter, index) => (
              <InlineFilterCard
                key={filter.id || `${filter.columnId}-${index}`}
                filter={filter}
                index={index}
                filters={filters}
                availableColumns={availableColumns}
                uniqueValuesByColumn={uniqueValuesByColumn}
                numberFormat={numberFormat}
                onUpdate={next => handleFilterUpdate(index, next)}
                onRemove={() => handleFilterRemove(index)}
                onDragStart={handleFilterDragStart}
                onDragEnd={handleFilterDragEnd}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FilterTab;
