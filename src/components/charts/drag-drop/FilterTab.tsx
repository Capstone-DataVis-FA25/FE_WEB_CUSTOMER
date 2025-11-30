import React, { useRef, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
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

      <div className="flex flex-col">
        {/* Label with icon */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
        </div>

        {/* Content area */}
        <div
          ref={assignDropZoneRef}
          className={cn(
            'min-h-[120px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded',
            'transition-all duration-200',
            isOver && 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 ring-2 ring-blue-400/20'
          )}
        >
          {!filtersExist ? (
            <div className="h-[120px] flex items-center justify-center p-4">
              <div className="text-center text-gray-400 dark:text-gray-500 text-xs">
                {isOver ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-blue-600 dark:text-blue-400 font-medium"
                  >
                    Drop field here
                  </motion.div>
                ) : (
                  <span>Drop field here</span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-2">
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
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FilterTab;
