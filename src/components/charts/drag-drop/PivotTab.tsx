import React, { useCallback, /* useMemo, */ useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Filter, Columns3, Rows3, Sigma, ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PivotSummaryButton } from '@/pages/chart-creator/operations/pivot/PivotSummaryButton';
import type { PivotDimension, PivotValue, DatasetColumnType } from '@/types/chart';
import InlinePivotDimensionCard from './InlinePivotDimensionCard';
import InlinePivotValueCard from './InlinePivotValueCard';

interface PivotTabProps {
  availableColumns: { id: string; name: string; type: DatasetColumnType; dateFormat?: string }[];
  rows: PivotDimension[];
  columns: PivotDimension[];
  values: PivotValue[];
  filters: PivotDimension[];
  onPivotChange: (
    rows: PivotDimension[],
    columns: PivotDimension[],
    values: PivotValue[],
    filters: PivotDimension[]
  ) => void;
  onError?: (message: string) => void;
  autoSelectEnabled?: boolean;
  onAutoSelectToggle?: (enabled: boolean) => void;
}

const PivotTab: React.FC<PivotTabProps> = ({
  availableColumns,
  rows,
  columns,
  values,
  filters,
  onPivotChange,
  onError,
  autoSelectEnabled = true,
  onAutoSelectToggle,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const rowsDragRegionRef = useRef<HTMLDivElement | null>(null);
  const columnsDragRegionRef = useRef<HTMLDivElement | null>(null);
  const valuesDragRegionRef = useRef<HTMLDivElement | null>(null);
  // const filtersDragRegionRef = useRef<HTMLDivElement | null>(null);
  const [cardDragOver, setCardDragOver] = useState<string | null>(null);
  const handledDropIdRef = useRef<string | null>(null);

  const { setNodeRef: setRowsDropRef, isOver: isRowsOver } = useDroppable({
    id: 'pivot-rows-zone',
    data: { zone: 'pivot-rows' },
  });
  const { setNodeRef: setColumnsDropRef, isOver: isColumnsOver } = useDroppable({
    id: 'pivot-columns-zone',
    data: { zone: 'pivot-columns' },
  });
  const { setNodeRef: setValuesDropRef, isOver: isValuesOver } = useDroppable({
    id: 'pivot-values-zone',
    data: { zone: 'pivot-values' },
  });
  const { setNodeRef: _setFiltersDropRef /* , isOver: isFiltersOver */ } = useDroppable({
    id: 'pivot-filters-zone',
    data: { zone: 'pivot-filters' },
  });

  const assignRowsDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      rowsDragRegionRef.current = node;
      setRowsDropRef(node);
    },
    [setRowsDropRef]
  );

  const assignColumnsDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      columnsDragRegionRef.current = node;
      setColumnsDropRef(node);
    },
    [setColumnsDropRef]
  );

  const assignValuesDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      valuesDragRegionRef.current = node;
      setValuesDropRef(node);
    },
    [setValuesDropRef]
  );

  // const assignFiltersDropRef = useCallback(
  //   (node: HTMLDivElement | null) => {
  //     filtersDragRegionRef.current = node;
  //     setFiltersDropRef(node);
  //   },
  //   [setFiltersDropRef]
  // );

  const handleRowsUpdate = useCallback(
    (index: number, next: PivotDimension) => {
      const updated = [...rows];
      updated[index] = next;
      onPivotChange(updated, columns, values, filters);
    },
    [rows, columns, values, filters, onPivotChange]
  );

  const handleColumnsUpdate = useCallback(
    (index: number, next: PivotDimension) => {
      const updated = [...columns];
      updated[index] = next;
      onPivotChange(rows, updated, values, filters);
    },
    [rows, columns, values, filters, onPivotChange]
  );

  const handleValuesUpdate = useCallback(
    (index: number, next: PivotValue) => {
      // Check for duplicate operation on the same column
      const existing = values.find(
        (v, idx) =>
          idx !== index &&
          v.columnId === next.columnId &&
          v.aggregationType === next.aggregationType
      );
      if (existing) {
        // Don't allow duplicate operation on same column
        return;
      }
      const updated = [...values];
      updated[index] = next;
      onPivotChange(rows, columns, updated, filters);
    },
    [rows, columns, values, filters, onPivotChange]
  );

  // const handleFiltersUpdate = useCallback(
  //   (index: number, next: PivotDimension) => {
  //     const updated = [...filters];
  //     updated[index] = next;
  //     onPivotChange(rows, columns, values, updated);
  //   },
  //   [rows, columns, values, filters, onPivotChange]
  // );

  const handleRowsRemove = useCallback(
    (index: number) => {
      const updated = rows.filter((_, idx) => idx !== index);
      onPivotChange(updated, columns, values, filters);
    },
    [rows, columns, values, filters, onPivotChange]
  );

  const handleColumnsRemove = useCallback(
    (index: number) => {
      const updated = columns.filter((_, idx) => idx !== index);
      onPivotChange(rows, updated, values, filters);
    },
    [rows, columns, values, filters, onPivotChange]
  );

  const handleValuesRemove = useCallback(
    (index: number) => {
      const updated = values.filter((_, idx) => idx !== index);
      onPivotChange(rows, columns, updated, filters);
    },
    [rows, columns, values, filters, onPivotChange]
  );

  // const handleFiltersRemove = useCallback(
  //   (index: number) => {
  //     const updated = filters.filter((_, idx) => idx !== index);
  //     onPivotChange(rows, columns, values, updated);
  //   },
  //   [rows, columns, values, filters, onPivotChange]
  // );

  const handleDragStart = useCallback((_id: string, event: React.DragEvent<HTMLDivElement>) => {
    const source = event.currentTarget;
    const clone = source.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = `${source.clientWidth}px`;
    clone.style.pointerEvents = 'none';
    clone.style.opacity = '0.75';
    document.body.appendChild(clone);
    event.dataTransfer.setDragImage(clone, source.clientWidth / 2, 20);
    requestAnimationFrame(() => {
      clone.remove();
    });
  }, []);

  const handleDragRemoval = (
    regionRef: React.RefObject<HTMLDivElement | null>,
    callback: () => void,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    const bounds = regionRef.current?.getBoundingClientRect();
    const { clientX, clientY } = event;
    const inside =
      bounds &&
      clientX >= bounds.left &&
      clientX <= bounds.right &&
      clientY >= bounds.top &&
      clientY <= bounds.bottom;
    if (!inside) callback();
  };

  const handleRowsDragEnd = useCallback(
    (dimensionId: string, event: React.DragEvent<HTMLDivElement>) => {
      // If the drop was handled by handleCardDrop, don't remove the dimension
      if (handledDropIdRef.current === dimensionId) {
        console.log('✅ Drop was handled, skipping removal for row:', dimensionId);
        return;
      }
      const index = rows.findIndex(d => d.id === dimensionId);
      if (index === -1) return;
      handleDragRemoval(rowsDragRegionRef, () => handleRowsRemove(index), event);
    },
    [rows, handleRowsRemove]
  );

  const handleColumnsDragEnd = useCallback(
    (dimensionId: string, event: React.DragEvent<HTMLDivElement>) => {
      // If the drop was handled by handleCardDrop, don't remove the dimension
      if (handledDropIdRef.current === dimensionId) {
        console.log('✅ Drop was handled, skipping removal for column:', dimensionId);
        return;
      }
      const index = columns.findIndex(d => d.id === dimensionId);
      if (index === -1) return;
      handleDragRemoval(columnsDragRegionRef, () => handleColumnsRemove(index), event);
    },
    [columns, handleColumnsRemove]
  );

  const handleValuesDragEnd = useCallback(
    (valueId: string, event: React.DragEvent<HTMLDivElement>) => {
      // If the drop was handled by handleCardDrop, don't remove the value
      if (handledDropIdRef.current === valueId) {
        console.log('✅ Drop was handled, skipping removal for value:', valueId);
        return;
      }
      const index = values.findIndex(v => v.id === valueId);
      if (index === -1) return;
      handleDragRemoval(valuesDragRegionRef, () => handleValuesRemove(index), event);
    },
    [values, handleValuesRemove]
  );

  // const _handleFiltersDragEnd = useCallback(
  //   (dimensionId: string, event: React.DragEvent<HTMLDivElement>) => {
  //     const index = filters.findIndex(d => d.id === dimensionId);
  //     if (index === -1) return;
  //     handleDragRemoval(filtersDragRegionRef, () => handleFiltersRemove(index), event);
  //   },
  //   [filters, handleFiltersRemove]
  // );

  const handleCardDragEnter = useCallback(
    (zoneId: string, event: React.DragEvent<HTMLDivElement>) => {
      // Check if it's a card being dragged by checking dataTransfer types
      // Cards set 'text/plain' type, columns from palette use dnd-kit which doesn't set this
      const types = Array.from(event.dataTransfer.types);
      if (types.includes('text/plain')) {
        setCardDragOver(zoneId);
      }
    },
    []
  );

  const handleCardDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    // Only clear if we're actually leaving the drop zone (not just moving to a child element)
    const relatedTarget = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    if (!currentTarget.contains(relatedTarget)) {
      setCardDragOver(null);
    }
  }, []);

  const handleCardDrop = useCallback(
    (
      targetZone: 'rows' | 'columns' | 'values' | 'filters',
      event: React.DragEvent<HTMLDivElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();
      setCardDragOver(null);

      try {
        const dataStr = event.dataTransfer.getData('text/plain');
        if (!dataStr) return;

        const data = JSON.parse(dataStr);

        // Handle pivot dimension cards
        if (data.type === 'pivot-dimension') {
          const sourceId = data.id;

          // Check which zone the card is currently in
          const rowIndex = rows.findIndex(d => d.id === sourceId);
          const colIndex = columns.findIndex(d => d.id === sourceId);
          const filterIndex = filters.findIndex(d => d.id === sourceId);

          // Determine source zone
          let sourceZone: 'rows' | 'columns' | 'filters' | null = null;
          if (rowIndex !== -1) sourceZone = 'rows';
          else if (colIndex !== -1) sourceZone = 'columns';
          else if (filterIndex !== -1) sourceZone = 'filters';

          // If dropped back into the same zone, do nothing (prevent re-order)
          if (sourceZone === targetZone) {
            return;
          }

          // Find and remove from source
          let newRows = [...rows];
          let newColumns = [...columns];
          let newFilters = [...filters];

          let dimension: PivotDimension | null = null;

          if (rowIndex !== -1) {
            dimension = newRows[rowIndex];
            newRows = newRows.filter((_, idx) => idx !== rowIndex);
          } else if (colIndex !== -1) {
            dimension = newColumns[colIndex];
            newColumns = newColumns.filter((_, idx) => idx !== colIndex);
          } else if (filterIndex !== -1) {
            dimension = newFilters[filterIndex];
            newFilters = newFilters.filter((_, idx) => idx !== filterIndex);
          }

          if (!dimension) return;

          // Handle dropping dimension into values zone
          if (targetZone === 'values') {
            // Check if this column already has a value operation
            const columnMeta = availableColumns.find(c => c.id === dimension.columnId);
            if (!columnMeta) return;

            // Determine available operations based on column type
            const allOperations: PivotValue['aggregationType'][] = [
              'sum',
              'average',
              'min',
              'max',
              'count',
            ];
            const availableOperations = columnMeta.type === 'number' ? allOperations : ['count']; // Only count for text/date columns

            // Find used operation types for this column
            const usedTypes = new Set<PivotValue['aggregationType']>(
              values.filter(v => v.columnId === dimension.columnId).map(v => v.aggregationType)
            );

            // Find first available operation type
            const availableType = availableOperations.find(type => {
              const typedType = type as PivotValue['aggregationType'];
              return !usedTypes.has(typedType);
            }) as PivotValue['aggregationType'] | undefined;

            // If all available operations are used, show error
            if (!availableType) {
              const columnName = columnMeta.name;
              // Mark this drop as handled to prevent removal
              handledDropIdRef.current = dimension.id;
              setTimeout(() => {
                handledDropIdRef.current = null;
              }, 100);
              onError?.(
                `All available operations for column "${columnName}" are already used in Values`
              );
              return;
            }

            // Create a new value from the dimension's column
            const newValue: PivotValue = {
              id: `pivot-val_${Date.now()}`,
              columnId: dimension.columnId,
              name: columnMeta.name,
              aggregationType: availableType,
            };

            // Mark successful drop to prevent removal
            handledDropIdRef.current = dimension.id;
            setTimeout(() => {
              handledDropIdRef.current = null;
            }, 100);

            // Remove dimension from source and add value
            onPivotChange(newRows, newColumns, [...values, newValue], newFilters);
            return;
          }

          // Add to target zone (only if different from source)
          if (targetZone === 'rows' && !newRows.find(d => d.id === dimension!.id)) {
            newRows.push(dimension);
          } else if (targetZone === 'columns' && !newColumns.find(d => d.id === dimension!.id)) {
            newColumns.push(dimension);
          } else if (targetZone === 'filters' && !newFilters.find(d => d.id === dimension!.id)) {
            newFilters.push(dimension);
          }

          onPivotChange(newRows, newColumns, values, newFilters);
        }

        // Handle pivot value cards
        if (data.type === 'pivot-value') {
          // Values can only go to values zone, so if dropped in values zone, do nothing (prevent re-order)
          if (targetZone === 'values') {
            return;
          }

          // Allow dropping value cards into rows or columns zones
          if (targetZone === 'rows' || targetZone === 'columns') {
            const valueId = data.id;
            const value = values.find(v => v.id === valueId);
            if (!value) {
              console.warn('Value not found:', valueId);
              return;
            }

            // Find the column metadata
            const columnMeta = availableColumns.find(c => c.id === value.columnId);
            if (!columnMeta) {
              console.warn('Column metadata not found:', value.columnId);
              return;
            }

            // Check if this column already exists in the target zone
            const targetZoneItems = targetZone === 'rows' ? rows : columns;
            const alreadyExists = targetZoneItems.some(d => d.columnId === value.columnId);

            console.log('🔍 Checking if column exists:', {
              valueColumnId: value.columnId,
              targetZone,
              targetZoneItems: targetZoneItems.map(d => ({
                id: d.id,
                columnId: d.columnId,
                name: d.name,
              })),
              alreadyExists,
            });

            if (alreadyExists) {
              // Show error toast and return early - don't remove the value
              const columnName = columnMeta.name;
              const zoneName = targetZone === 'rows' ? 'Rows' : 'Columns';

              console.log('🚫 Column already exists - showing error and returning early');

              // Mark this drop as handled to prevent removal in onDragEnd
              handledDropIdRef.current = valueId;
              setTimeout(() => {
                handledDropIdRef.current = null;
              }, 100);

              // Always call onError if provided
              if (onError) {
                onError(`Column "${columnName}" already exists in ${zoneName}`);
              } else {
                console.error('❌ onError callback not provided!');
              }

              // CRITICAL: Return early to prevent any changes
              return;
            }

            // Mark successful drop to prevent removal
            handledDropIdRef.current = valueId;
            setTimeout(() => {
              handledDropIdRef.current = null;
            }, 100);

            // Column doesn't exist in target zone - proceed with move
            // Create a new dimension from the value's column
            const newDimension: PivotDimension = {
              id: `pivot-${targetZone}_${Date.now()}`,
              columnId: value.columnId,
              name: columnMeta.name,
              columnType: columnMeta.type,
              timeUnit: columnMeta.type === 'date' ? 'day' : undefined,
            };

            // Remove the value from values
            const newValues = values.filter(v => v.id !== valueId);

            // Add to target zone
            if (targetZone === 'rows') {
              onPivotChange([...rows, newDimension], columns, newValues, filters);
            } else {
              onPivotChange(rows, [...columns, newDimension], newValues, filters);
            }
          }
        }
      } catch (e) {
        console.error('Error handling card drop:', e);
      }
    },
    [rows, columns, values, filters, availableColumns, onPivotChange, onError]
  );

  const renderZone = (
    title: string,
    icon: React.ReactNode,
    items: (PivotDimension | PivotValue)[],
    isEmpty: boolean,
    dropRef: (node: HTMLDivElement | null) => void,
    isOver: boolean,
    renderItem: (item: PivotDimension | PivotValue, index: number) => React.ReactNode,
    zoneType: 'rows' | 'columns' | 'values' | 'filters'
  ) => {
    return (
      <div className="flex flex-col h-full">
        {/* Label with icon */}
        <div className="flex items-center gap-2 mb-2 px-1">
          {icon}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
        </div>

        {/* Content area */}
        <div
          ref={dropRef}
          onDrop={e => handleCardDrop(zoneType, e)}
          onDragOver={e => {
            e.preventDefault();
            e.stopPropagation();
            // Check if it's a card being dragged by checking dataTransfer types
            const types = Array.from(e.dataTransfer.types);
            if (types.includes('text/plain')) {
              setCardDragOver(zoneType);
            }
          }}
          onDragEnter={e => handleCardDragEnter(zoneType, e)}
          onDragLeave={handleCardDragLeave}
          className={cn(
            'flex-1 min-h-[120px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded',
            'transition-all duration-200',
            (isOver || cardDragOver === zoneType) &&
              'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 ring-2 ring-blue-400/20'
          )}
        >
          {isEmpty ? (
            <div className="h-full flex items-center justify-center p-4">
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
              {items.map((item, index) => renderItem(item, index))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      key="pivot"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col"
    >
      {/* Auto-select toggle */}
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="text-sm text-gray-700 dark:text-gray-300">Auto-select chart series</span>
        <button
          type="button"
          role="switch"
          aria-checked={autoSelectEnabled}
          onClick={() => onAutoSelectToggle?.(!autoSelectEnabled)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer',
            autoSelectEnabled ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              autoSelectEnabled ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
        <div className="relative">
          <Info
            className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="absolute left-0 bottom-full mb-2 z-[9999] w-72 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl border border-gray-700 pointer-events-none">
              <p className="leading-relaxed">
                When enabled, chart series are automatically selected based on pivot configuration.
                When disabled, you must manually select columns. If selected columns don't exist
                after pivot changes, they will be cleared.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <PivotSummaryButton
          availableColumns={availableColumns}
          initialRows={rows}
          initialColumns={columns}
          initialValues={values}
          initialFilters={filters}
          onPivotChange={onPivotChange}
        />
      </div>

      {/* Excel-style prompt */}

      {/* 2x2 Grid Layout - Excel style */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top-left: Rows */}
        <section>
          {renderZone(
            'Rows',
            <Rows3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />,
            rows,
            rows.length === 0,
            assignRowsDropRef,
            isRowsOver,
            (item, index) => (
              <InlinePivotDimensionCard
                key={item.id}
                dimension={item as PivotDimension}
                availableColumns={availableColumns}
                onUpdate={next => handleRowsUpdate(index, next)}
                onDragStart={handleDragStart}
                onDragEnd={handleRowsDragEnd}
                color="blue"
                excelStyle
              />
            ),
            'rows'
          )}
        </section>

        {/* Top-right: Columns */}
        <section>
          {renderZone(
            'Columns',
            <Columns3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />,
            columns,
            columns.length === 0,
            assignColumnsDropRef,
            isColumnsOver,
            (item, index) => (
              <InlinePivotDimensionCard
                key={item.id}
                dimension={item as PivotDimension}
                availableColumns={availableColumns}
                onUpdate={next => handleColumnsUpdate(index, next)}
                onDragStart={handleDragStart}
                onDragEnd={handleColumnsDragEnd}
                color="green"
                excelStyle
              />
            ),
            'columns'
          )}
        </section>

        {/* Bottom: Values (spans full width) */}
        <section className="col-span-2">
          {renderZone(
            'Values',
            <Sigma className="w-4 h-4 text-gray-600 dark:text-gray-400" />,
            values,
            values.length === 0,
            assignValuesDropRef,
            isValuesOver,
            (item, index) => (
              <InlinePivotValueCard
                key={item.id}
                value={item as PivotValue}
                availableColumns={availableColumns}
                allValues={values}
                onUpdate={next => handleValuesUpdate(index, next)}
                onDragStart={handleDragStart}
                onDragEnd={handleValuesDragEnd}
                excelStyle
              />
            ),
            'values'
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default PivotTab;
