'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo, useDeferredValue } from 'react';
import { useDataset } from '@/contexts/DatasetContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedColumn,
  setSelectedRow,
  setTouchedCells,
  setInfoMessage,
  setSortConfig,
  setDuplicateColumns,
  setEmptyColumns,
  setParseErrors,
  updateParseError,
  setDateFormat,
  setNumberFormat,
  selectSelectedColumn,
  selectInfoMessage,
  selectSortConfig,
  selectDuplicateColumns,
  selectParseErrors,
  clearUIState,
  setColumns as setColumnsRedux,
  selectColumns,
  selectFilters,
  setFilters,
} from '@/features/excelUI';
import ExcelRow from './ExcelRow';
import ExcelHeaderRow from './ExcelHeaderRow';
import DeleteRowButton from './DeleteRowButton';
import ValidationDisplay from './ValidationDisplay';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import { Plus, Copy, FileDown } from 'lucide-react';
// removed unused dropdown menu imports

// =============== Types & Helpers =================
import type { DataHeader } from '@/utils/dataProcessors';
import { t } from 'i18next';
interface CustomExcelProps {
  initialData?: string[][];
  initialColumns?: DataHeader[];
  onDataChange?: (d: string[][], c: DataHeader[]) => void;
  className?: string;
  mode?: 'edit' | 'view';
  allowHeaderEdit?: boolean;
  allowColumnEdit?: boolean;
  onSorting?: (s: { column: number; direction: 'asc' | 'desc' } | null) => void;
  highlightHeaderIds?: string[];
}
const DEFAULT_WIDTH = 180;

// removed unused isValidValue

// Normalization / conversion when changing type

// =============== Component =================
const DEFAULT_COLS: DataHeader[] = [
  { name: 'Column 1', type: 'text', width: 200, index: 0 },
  { name: 'Column 2', type: 'text', width: 200, index: 1 },
];
const DEFAULT_ROWS: string[][] = Array.from({ length: 8 }, () =>
  Array(DEFAULT_COLS.length).fill('')
);

const CustomExcel: React.FC<CustomExcelProps> = ({
  initialData = DEFAULT_ROWS,
  initialColumns = DEFAULT_COLS,
  onDataChange,
  className = '',
  mode = 'edit',
  allowHeaderEdit = true,
  allowColumnEdit = true,
  onSorting,
  highlightHeaderIds,
}) => {
  // Core state
  const columns = useAppSelector(selectColumns);
  // Keep a ref of columns to avoid function identity churn in callbacks that shouldn't care about header name changes
  const columnsRef = useRef(columns);
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);
  const [data, setData] = useState<string[][]>([]);
  const dataRef = useRef<string[][]>([]);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  // Filters moved to Redux; use selector below
  // Track one-time initialization so prop identity changes (triggered by onDataChange upstream) do not reset edited state
  const initializedRef = useRef(false);

  const [ready, setReady] = useState(false);
  // Flag and timestamp to indicate an internal structure change (add/remove row/column)
  const pendingStructureChangeRef = useRef(false);
  const lastStructureChangeAtRef = useRef<number>(0);
  // Track last initialized dimensions to detect real Change Data
  const lastInitRowsRef = useRef<number>(0);
  const lastInitColsRef = useRef<number>(0);
  // Redux dispatch and selectors
  const dispatch = useAppDispatch();
  // Only subscribe to selectors that CustomExcel actually needs for its own rendering
  const selectedColumn = useAppSelector(selectSelectedColumn);
  const infoMessage = useAppSelector(selectInfoMessage);
  const sortConfig = useAppSelector(selectSortConfig);
  const filters = useAppSelector(selectFilters);
  const duplicateColumns = useAppSelector(selectDuplicateColumns);
  // const currentEmptyColumns = useAppSelector(selectEmptyColumns); // unused
  // Removed parseErrors - individual cells handle their own validation
  // Removed touchedCells - not used in CustomExcel rendering
  const {
    tryConvert,
    tryConvertColumn,
    validateDuplicateColumns,
    dateFormat,
    numberFormat,
    clearExcelErrors,
    setExcelErrors,
  } = useDataset();

  // Debounce timer for propagating onDataChange upstream
  const onChangeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync dateFormat to Redux when it changes
  useEffect(() => {
    dispatch(setDateFormat(dateFormat));
  }, [dateFormat, dispatch]);

  // Sync numberFormat to Redux when it changes
  useEffect(() => {
    dispatch(setNumberFormat(numberFormat));
  }, [numberFormat, dispatch]);
  // Temporary edits are now managed by ExcelUIContext

  // Large dataset heuristics
  const LARGE_ROW_THRESHOLD = 300; // enable virtualization earlier for smoother UX
  const LARGE_CELL_THRESHOLD = 20000; // rows * cols
  const isLarge =
    data.length > LARGE_ROW_THRESHOLD || data.length * columns.length > LARGE_CELL_THRESHOLD;
  // history removed

  // Virtualization states
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const ROW_HEIGHT = 40; // approximate row height incl. borders

  // Shared initializer used on first mount and on Change Data
  const initializeFromProps = useCallback(() => {
    // init from incoming props
    const initCols = (initialColumns.length ? initialColumns : DEFAULT_COLS).map(c => ({
      ...c,
      id: (c as any).id ?? (c as any).headerId ?? undefined,
      width: c.width || DEFAULT_WIDTH,
    }));
    const initData = initialData.length
      ? initialData
      : DEFAULT_ROWS.map(() => Array(initCols.length).fill(''));
    // Sync formats to Redux immediately to ensure error messages show correct expected format
    dispatch(setDateFormat(dateFormat));
    dispatch(setNumberFormat(numberFormat));
    dispatch(setColumnsRedux(initCols));
    setData(initData);
    dispatch(setFilters(Array(initCols.length).fill('')));

    if (initCols.length > 0) {
      const validationResult = validateDuplicateColumns(initCols);
      dispatch(
        setDuplicateColumns({
          duplicateNames: validationResult.duplicateNames,
          duplicateColumnIndices: validationResult.duplicateColumnIndices,
        })
      );
      dispatch(setEmptyColumns(validationResult.emptyColumnIndices));

      const parseErrors: Record<number, number[]> = {};
      initData.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
          const colType = initCols[colIndex]?.type ?? 'text';
          const conv = tryConvert(
            colType,
            colIndex,
            rowIndex,
            cellValue,
            colType === 'number' ? numberFormat : undefined,
            colType === 'date' ? dateFormat : undefined
          );
          if (!conv.ok) {
            if (!parseErrors[rowIndex]) parseErrors[rowIndex] = [];
            parseErrors[rowIndex].push(colIndex);
          }
        });
      });
      dispatch(setParseErrors(parseErrors));
    }

    initializedRef.current = true;
    setReady(true);
    lastInitRowsRef.current = initData.length;
    lastInitColsRef.current = initCols.length;
  }, [
    initialColumns,
    initialData,
    mode,
    validateDuplicateColumns,
    dispatch,
    tryConvert,
    dateFormat,
    numberFormat,
  ]);

  // Initialize once from initialData/initialColumns
  useEffect(() => {
    if (!initializedRef.current) {
      initializeFromProps();
    }
  }, [initializeFromProps]);

  // Hard reset when upstream data/columns truly change (e.g., Change Data flow)
  useEffect(() => {
    if (!initializedRef.current) return; // already in init path
    // Only treat as Change Data if dataset dimensions changed
    const incomingRows = initialData?.length || 0;
    const incomingCols = initialColumns?.length || 0;
    const rowsChanged = incomingRows !== lastInitRowsRef.current;
    const colsChanged = incomingCols !== lastInitColsRef.current;
    if (!rowsChanged && !colsChanged) return;
    // If the dimension change originated from this component (add/remove),
    // skip the heavy hard reset to preserve scroll and focus.
    const now = Date.now();
    // Skip if flagged or very recent internal change (within 400ms)
    if (pendingStructureChangeRef.current || now - lastStructureChangeAtRef.current < 400) {
      pendingStructureChangeRef.current = false;
      // Update the last known dimensions so we don't loop
      lastInitRowsRef.current = incomingRows;
      lastInitColsRef.current = incomingCols;
      return;
    }
    // hard reset due to dataset dimensions change
    // Allow init effect to run again
    clearExcelErrors();
    dispatch(clearUIState());
    initializedRef.current = false;
    setReady(false);
    // Wipe local state so init can repopulate
    setData([]);
    // Now re-initialize from new props after this tick to avoid race with Redux clear
    setTimeout(() => {
      initializeFromProps();
    }, 0);
  }, [initialData, initialColumns, dispatch, clearExcelErrors]);

  // Removed internal header metadata sync; parent controls remount via key

  // Keep DatasetContext excelErrors map in sync with Redux parseErrors for Create button validation
  const reduxParseErrors = useAppSelector(selectParseErrors);
  useEffect(() => {
    setExcelErrors({ parseErrors: reduxParseErrors || {} });
  }, [reduxParseErrors, setExcelErrors]);

  // Expose sorting changes to parent for chart synchronization
  useEffect(() => {
    if (onSorting) {
      onSorting(sortConfig);
    }
  }, [sortConfig, onSorting]);

  // Recompute parseErrors when number/date formats or typed column sets change (quiet on name-only changes)
  const prevNumberColsRef = useRef<number[] | null>(null);
  const prevDateColsRef = useRef<number[] | null>(null);
  const prevFormatsRef = useRef<{ dec: string; thou: string; date: string } | null>(null);
  useEffect(() => {
    if (!columns || columns.length === 0) return;
    const numberCols = columns.map((c, i) => (c.type === 'number' ? i : -1)).filter(i => i >= 0);
    const dateCols = columns.map((c, i) => (c.type === 'date' ? i : -1)).filter(i => i >= 0);
    const formats = {
      dec: numberFormat.decimalSeparator,
      thou: numberFormat.thousandsSeparator,
      date: dateFormat,
    };

    const sameNumbers =
      prevNumberColsRef.current &&
      prevNumberColsRef.current.length === numberCols.length &&
      prevNumberColsRef.current.every((v, i) => v === numberCols[i]);
    const sameDates =
      prevDateColsRef.current &&
      prevDateColsRef.current.length === dateCols.length &&
      prevDateColsRef.current.every((v, i) => v === dateCols[i]);
    const sameFormats =
      prevFormatsRef.current &&
      prevFormatsRef.current.dec === formats.dec &&
      prevFormatsRef.current.thou === formats.thou &&
      prevFormatsRef.current.date === formats.date;

    if (sameNumbers && sameDates && sameFormats) return;

    // Update refs
    prevNumberColsRef.current = numberCols;
    prevDateColsRef.current = dateCols;
    prevFormatsRef.current = formats;

    if (numberCols.length === 0 && dateCols.length === 0) return;

    const nextErrors: Record<number, number[]> = {};
    for (let ri = 0; ri < data.length; ri++) {
      for (const ci of numberCols) {
        const v = data[ri]?.[ci] ?? '';
        const conv = tryConvert('number', ci, ri, v, numberFormat, undefined);
        if (!conv.ok) {
          if (!nextErrors[ri]) nextErrors[ri] = [];
          nextErrors[ri].push(ci);
        }
      }
      for (const ci of dateCols) {
        const v = data[ri]?.[ci] ?? '';
        const conv = tryConvert('date', ci, ri, v, undefined, dateFormat);
        if (!conv.ok) {
          if (!nextErrors[ri]) nextErrors[ri] = [];
          nextErrors[ri].push(ci);
        }
      }
    }
    dispatch(setParseErrors(nextErrors));
  }, [numberFormat, dateFormat, columns, data, tryConvert, dispatch]);

  // Recompute duplicate/empty column errors whenever column names or count change
  const prevColSigRef = useRef<string | null>(null);
  useEffect(() => {
    if (!columns || columns.length === 0) return;
    const signature = columns.map(c => `${c.name}|${c.type}`).join('||');
    if (prevColSigRef.current === signature) return;
    prevColSigRef.current = signature;
    const { duplicateNames, duplicateColumnIndices, emptyColumnIndices } =
      validateDuplicateColumns(columns);
    dispatch(setDuplicateColumns({ duplicateNames, duplicateColumnIndices }));
    dispatch(setEmptyColumns(emptyColumnIndices));
  }, [columns, dispatch, validateDuplicateColumns]);

  // Unified commit (no history). Backward-compatible with previous call shapes.
  const commit = useCallback(
    (
      nextData: string[][],
      nextCols: DataHeader[],
      arg3?:
        | boolean
        | {
            dataChanged?: boolean;
            columnsChanged?: boolean;
            validationOnly?: boolean;
            removedRowIndex?: number;
            scheduleRevalidate?: boolean;
          },
      arg4?: {
        dataChanged?: boolean;
        columnsChanged?: boolean;
        validationOnly?: boolean;
        removedRowIndex?: number;
        scheduleRevalidate?: boolean;
      }
    ) => {
      let changes: {
        dataChanged?: boolean;
        columnsChanged?: boolean;
        validationOnly?: boolean;
        removedRowIndex?: number;
        scheduleRevalidate?: boolean;
      } = {
        dataChanged: true,
        columnsChanged: false,
      };
      if (typeof arg3 === 'boolean') {
        // skipHistory ignored, keep compatibility
        changes = { ...changes, ...(arg4 || {}) };
      } else if (typeof arg3 === 'object') {
        changes = { ...changes, ...arg3 };
      }

      // Update data
      if (changes.dataChanged) {
        const prev = dataRef.current;
        const rowsEqual = (a?: string[], b?: string[]) => {
          if (!a || !b) return false;
          if (a.length !== b.length) return false;
          for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
          return true;
        };
        let optimized: string[][];
        if (typeof changes.removedRowIndex === 'number') {
          const removed = changes.removedRowIndex;
          optimized = nextData.map((row, i) => {
            // Before removed index, compare against same index
            if (i < removed) return rowsEqual(row, prev[i]) ? prev[i] : row;
            // After removed index, compare against prev[i+1] to preserve references
            return rowsEqual(row, prev[i + 1]) ? (prev[i + 1] as string[]) : row;
          });
        } else {
          optimized = nextData.map((row, i) => (rowsEqual(row, prev[i]) ? prev[i] : row));
        }
        setData(optimized);
      }

      // Update columns only when changed
      if (changes.columnsChanged) {
        dispatch(setColumnsRedux(nextCols));
      }

      // Notify parent on any data or column changes so working dataset stays in sync (debounced)
      if (onDataChange && (changes.dataChanged || changes.columnsChanged)) {
        if (onChangeDebounceRef.current) clearTimeout(onChangeDebounceRef.current);
        onChangeDebounceRef.current = setTimeout(
          () => {
            onDataChange(nextData, nextCols);
          },
          isLarge ? 150 : 100
        );
      }

      // Revalidate entire sheet for non-keystroke commits
      const doRevalidate = () => {
        const numberCols = nextCols
          .map((c, i) => (c.type === 'number' ? i : -1))
          .filter(i => i >= 0);
        const dateCols = nextCols.map((c, i) => (c.type === 'date' ? i : -1)).filter(i => i >= 0);
        const nextErrors: Record<number, number[]> = {};
        for (let ri = 0; ri < nextData.length; ri++) {
          for (const ci of numberCols) {
            const v = nextData[ri]?.[ci] ?? '';
            const conv = tryConvert('number', ci, ri, v, numberFormat, undefined);
            if (!conv.ok) {
              if (!nextErrors[ri]) nextErrors[ri] = [];
              nextErrors[ri].push(ci);
            }
          }
          for (const ci of dateCols) {
            const v = nextData[ri]?.[ci] ?? '';
            const conv = tryConvert('date', ci, ri, v, undefined, dateFormat);
            if (!conv.ok) {
              if (!nextErrors[ri]) nextErrors[ri] = [];
              nextErrors[ri].push(ci);
            }
          }
        }
        dispatch(setParseErrors(nextErrors));
      };
      if (!changes.validationOnly && (changes.dataChanged || changes.columnsChanged)) {
        if (changes.scheduleRevalidate) {
          // Defer heavy revalidation to keep UI smooth
          setTimeout(doRevalidate, 0);
        } else {
          doRevalidate();
        }
      }
    },
    [onDataChange, isLarge, numberFormat, dateFormat, tryConvert, dispatch]
  );

  // Generic mutation helpers
  // setCell no longer used with temp editing; setHeader removed (name edits now dispatch from header)

  // Internal type change logic (mutates columns/data/history)
  const setTypeInternal = useCallback(
    (c: number, val: 'text' | 'number' | 'date') => {
      console.log('🔧 setType called:', { column: c, newType: val });
      dispatch(setInfoMessage(null));

      const { nextData, nextColumns } = tryConvertColumn(c, val);

      // For column type changes, only update columns initially (no data re-render)
      // The validation will run separately and only update data if needed
      commit(nextData, nextColumns, false, {
        dataChanged: false, // Don't re-render data cells
        columnsChanged: true, // Only update column headers
      });

      // Recompute Redux parseErrors for this column based on new type
      const colType = nextColumns[c]?.type ?? 'text';
      for (let ri = 0; ri < nextData.length; ri++) {
        const v = nextData[ri]?.[c] ?? '';
        const conv = tryConvert(
          colType,
          c,
          ri,
          v,
          colType === 'number' ? numberFormat : undefined,
          colType === 'date' ? dateFormat : undefined
        );
        dispatch(updateParseError({ row: ri, column: c, hasError: !conv.ok }));
      }

      dispatch(setTouchedCells([]));
    },
    [dispatch, tryConvertColumn, commit, tryConvert, dateFormat]
  );

  // Expose a stable callback to children to prevent prop identity churn
  const setTypeRef = useRef(setTypeInternal);
  useEffect(() => {
    setTypeRef.current = setTypeInternal;
  }, [setTypeInternal]);
  const setType = useCallback(
    (c: number, val: 'text' | 'number' | 'date') => setTypeRef.current(c, val),
    []
  );

  // Handle cell focus to select column
  const handleCellFocus = useCallback(
    (rowIndex: number, columnIndex: number) => {
      // Select the column when a cell is focused
      dispatch(setSelectedColumn(columnIndex));
    },
    [dispatch]
  );

  // Handle cell changes from individual ExcelCell components
  const handleCellChange = useCallback(
    (rowIndex: number, columnIndex: number, newValue: string) => {
      const finalVal = newValue.trim();
      const currentValue = data[rowIndex]?.[columnIndex] || '';

      // Skip if value hasn't actually changed
      if (finalVal === currentValue) {
        return;
      }

      // Commit trimmed value to data only (no normalization)
      const nextData = [...data];
      const rowCopy = [...nextData[rowIndex]];
      rowCopy[columnIndex] = finalVal;
      nextData[rowIndex] = rowCopy;
      // Use latest columns via ref; mark as validationOnly so we don't recompute the whole sheet here
      commit(nextData, columnsRef.current, false, {
        dataChanged: true,
        columnsChanged: false,
        validationOnly: true,
      });
    },
    [data, commit]
  );

  // Add/remove
  const addRow = () => {
    if (mode === 'view') return;
    pendingStructureChangeRef.current = true;
    lastStructureChangeAtRef.current = Date.now();
    const nd = [...data, Array(columns.length).fill('')];
    // Adding row changes both data and columns (new row added)
    commit(nd, columns, {
      dataChanged: true, // Update data cells
      columnsChanged: false, // Do not notify parent; columns unchanged
      scheduleRevalidate: true,
    });
    // Scroll to the new row (do not auto-select to avoid flashing in delete controls)
    const newIndex = nd.length - 1;
    // Scroll after layout so virtualization has updated
    setTimeout(() => {
      const el = scrollRef.current;
      const tryScroll = (attempt: number) => {
        if (!el) return;
        const targetInput = el.querySelector(
          `input[data-cell='${newIndex}-0']`
        ) as HTMLElement | null;
        if (targetInput) {
          // Scroll only the container, not the whole page
          const containerRect = el.getBoundingClientRect();
          const targetRect = targetInput.getBoundingClientRect();
          const thead = el.querySelector('thead') as HTMLElement | null;
          const headerH = thead ? thead.getBoundingClientRect().height : 0;
          const current = el.scrollTop;
          const offsetWithin = targetRect.top - containerRect.top;
          // Aim to place the row a little below the header
          const desiredTop = Math.max(0, current + offsetWithin - headerH - 8);
          el.scrollTo({ top: desiredTop, behavior: 'smooth' });
          return;
        }
        // Nudge to bottom to force virtualization to render last rows
        el.scrollTop = el.scrollHeight;
        if (attempt < 5) {
          requestAnimationFrame(() => tryScroll(attempt + 1));
        }
      };
      tryScroll(0);
    }, 0);
  };
  const addColumn = () => {
    if (mode === 'view') return;
    pendingStructureChangeRef.current = true;
    lastStructureChangeAtRef.current = Date.now();
    const nc: DataHeader[] = [
      ...columns,
      {
        name: `Column ${columns.length + 1}`,
        type: 'text' as const,
        width: DEFAULT_WIDTH,
        index: columns.length,
      },
    ];
    const nd = data.map(r => [...r, '']) as string[][];
    // Update columns locally without notifying parent
    dispatch(setColumnsRedux(nc));
    commit(nd, nc, {
      dataChanged: true, // Update data cells (new column added)
      columnsChanged: false, // columns already updated locally; avoid parent notify
      scheduleRevalidate: true,
    });
    dispatch(setFilters([...(filters || []), '']));
    // Select and scroll to the new column
    const newColIndex = nc.length - 1;
    dispatch(setSelectedColumn(newColIndex));
    setTimeout(() => {
      const el = scrollRef.current;
      if (el) {
        // Wait one frame to ensure layout has updated widths
        requestAnimationFrame(() => {
          el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
        });
      }
    }, 0);
  };

  const removeRow = (r: number) => {
    if (mode === 'view' || data.length <= 1) return;
    pendingStructureChangeRef.current = true;
    lastStructureChangeAtRef.current = Date.now();
    // Measure the pre-delete visual offset of the row so we can preserve it post-delete
    let anchorOffset = 0;
    const containerBefore = scrollRef.current;
    if (containerBefore) {
      const beforeEl = containerBefore.querySelector(
        `input[data-cell='${r}-0']`
      ) as HTMLElement | null;
      if (beforeEl) {
        const containerRect = containerBefore.getBoundingClientRect();
        const targetRect = beforeEl.getBoundingClientRect();
        anchorOffset = targetRect.top - containerRect.top;
      }
    }
    const nd = data.filter((_, i) => i !== r);
    // Removing row changes both data and columns
    commit(nd, columns, {
      dataChanged: true, // Update data cells
      columnsChanged: false, // Do not notify parent; columns unchanged
      removedRowIndex: r,
      scheduleRevalidate: true,
    });
    // Keep selection at the same visual position: select the row that shifted up (same index),
    // or the last row if we deleted the last one.
    const nextIndex = Math.min(r, nd.length - 1);
    if (nextIndex >= 0) {
      dispatch(setSelectedRow(nextIndex));
      // Scroll into view after layout updates
      setTimeout(() => {
        const el = scrollRef.current;
        if (!el) return;
        const target = el.querySelector(`input[data-cell='${nextIndex}-0']`) as HTMLElement | null;
        if (target) {
          const containerRect = el.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const current = el.scrollTop;
          const offsetWithin = targetRect.top - containerRect.top;
          // Preserve the pre-delete visual offset by applying the delta
          const desiredTop = Math.max(0, current + (offsetWithin - anchorOffset));
          el.scrollTo({ top: desiredTop, behavior: 'auto' });
        }
      }, 0);
    } else {
      dispatch(setSelectedRow(null));
    }
  };

  const removeColumn = (c: number) => {
    if (mode === 'view' || columns.length <= 1) return;
    pendingStructureChangeRef.current = true;
    lastStructureChangeAtRef.current = Date.now();
    const nc = columns.filter((_, i) => i !== c);
    const nd = data.map(r => r.filter((_, i) => i !== c));
    // Determine next convenient selection before state updates
    const nextColIndex = Math.min(c, nc.length - 1);
    // Clear selection momentarily to avoid stale highlights during update
    dispatch(setSelectedColumn(null));
    setSortConfig(null);
    // Update columns locally without notifying parent
    dispatch(setColumnsRedux(nc));
    // If current sorting references this column, clear it; if it was after, shift left
    if (sortConfig) {
      if (sortConfig.column === c) {
        dispatch(setSortConfig(null));
      } else if (sortConfig.column > c) {
        dispatch(setSortConfig({ column: sortConfig.column - 1, direction: sortConfig.direction }));
      }
    }
    commit(nd, nc, {
      dataChanged: true, // Update data cells
      columnsChanged: false, // columns already updated locally; avoid parent notify
      scheduleRevalidate: true,
    });
    dispatch(setFilters((filters || []).filter((_, i) => i !== c)));
    // Reselect and scroll into view similar to row deletion behavior
    if (nextColIndex >= 0 && nc.length > 0) {
      dispatch(setSelectedColumn(nextColIndex));
      setTimeout(() => {
        const el = scrollRef.current;
        if (!el) return;
        // Try to find a cell in the first row for the target column
        const target = el.querySelector(
          `input[data-cell='0-${nextColIndex}']`
        ) as HTMLElement | null;
        if (target) {
          const containerRect = el.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const currentLeft = el.scrollLeft;
          const offsetWithin = targetRect.left - containerRect.left;
          const desiredLeft = Math.max(0, currentLeft + offsetWithin - 16);
          el.scrollTo({ left: desiredLeft, behavior: 'auto' });
        }
      }, 0);
    }
  };

  const deleteSelectedRow = (rowIndex: number) => {
    removeRow(rowIndex);
  };
  const deleteSelectedColumn = () => {
    if (selectedColumn !== null) {
      removeColumn(selectedColumn);
    }
  };

  // Sorting handled in header via Redux; CustomExcel derives sorted view by sortConfig

  // Filters now handled in Redux in column header

  const filteredData = useMemo(() => {
    const indexed = data.map((row, i) => ({ row, i }));
    if (!filters.some(f => f)) return indexed;
    return indexed.filter(({ row }) =>
      row.every((cell, ci) =>
        filters[ci] ? String(cell).toLowerCase().includes(filters[ci].toLowerCase()) : true
      )
    );
  }, [data, filters]);

  // Defer heavy filtered data propagation to keep typing/editing responsive
  const deferredFilteredData = useDeferredValue(filteredData);

  // Apply sorting to the filtered view only; do not mutate base data
  const sortedFilteredData = useMemo(() => {
    if (!sortConfig) return deferredFilteredData;
    const { column, direction } = sortConfig;
    const type = columns[column]?.type ?? 'text';
    const out = [...deferredFilteredData];
    out.sort((a, b) => {
      const aVal = a.row[column] || '';
      const bVal = b.row[column] || '';
      if (!aVal && !bVal) return 0;
      if (!aVal) return direction === 'asc' ? 1 : -1;
      if (!bVal) return direction === 'asc' ? -1 : 1;
      if (type === 'number') {
        const aNum = Number.parseFloat(aVal) || 0;
        const bNum = Number.parseFloat(bVal) || 0;
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      if (type === 'date') {
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        const aT = aDate.getTime();
        const bT = bDate.getTime();
        if (Number.isNaN(aT) && Number.isNaN(bT)) return 0;
        if (Number.isNaN(aT)) return direction === 'asc' ? 1 : -1;
        if (Number.isNaN(bT)) return direction === 'asc' ? -1 : 1;
        return direction === 'asc' ? aT - bT : bT - aT;
      }
      return direction === 'asc'
        ? aVal.toLowerCase().localeCompare(bVal.toLowerCase())
        : bVal.toLowerCase().localeCompare(aVal.toLowerCase());
    });
    return out;
  }, [deferredFilteredData, sortConfig, columns]);

  // In view mode, also persist sorting to the base dataset so charts use the same order
  useEffect(() => {
    if (mode !== 'view') return;
    if (!sortConfig) return;
    const { column, direction } = sortConfig;
    const type = columns[column]?.type ?? 'text';
    // Build sorted copy of the entire base data (not filtered)
    const baseIndexed = data.map((row, i) => ({ row, i }));
    const sorted = [...baseIndexed].sort((a, b) => {
      const aVal = a.row[column] || '';
      const bVal = b.row[column] || '';
      if (!aVal && !bVal) return 0;
      if (!aVal) return direction === 'asc' ? 1 : -1;
      if (!bVal) return direction === 'asc' ? -1 : 1;
      if (type === 'number') {
        const aNum = Number.parseFloat(aVal) || 0;
        const bNum = Number.parseFloat(bVal) || 0;
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      if (type === 'date') {
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        const aT = aDate.getTime();
        const bT = bDate.getTime();
        if (Number.isNaN(aT) && Number.isNaN(bT)) return 0;
        if (Number.isNaN(aT)) return direction === 'asc' ? 1 : -1;
        if (Number.isNaN(bT)) return direction === 'asc' ? -1 : 1;
        return direction === 'asc' ? aT - bT : bT - aT;
      }
      return direction === 'asc'
        ? String(aVal).toLowerCase().localeCompare(String(bVal).toLowerCase())
        : String(bVal).toLowerCase().localeCompare(String(aVal).toLowerCase());
    });
    const nextData = sorted.map(s => s.row);
    // Skip commit if order is unchanged
    let changed = false;
    for (let i = 0; i < nextData.length; i++) {
      if (nextData[i] !== data[i]) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    commit(nextData, columns, {
      dataChanged: true,
      columnsChanged: false,
      scheduleRevalidate: false,
    });
  }, [mode, sortConfig, columns, data, commit]);

  // Virtualization calculations: robustly measure visible height
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const measure = () => {
      const containerH = el.clientHeight || el.getBoundingClientRect().height;
      const thead = el.querySelector('thead') as HTMLElement | null;
      const headerH = thead ? thead.getBoundingClientRect().height : 0;
      const bodyH = Math.max(0, containerH - headerH);
      if (bodyH > 0) setViewportHeight(bodyH);
    };

    // Initial measure (in case effect runs before layout stabilizes)
    measure();
    // Retry once on next frame if zero height
    if (el.getBoundingClientRect().height === 0) {
      requestAnimationFrame(measure);
    }

    // Observe size changes of the scroll container
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(el);

    const onWinResize = () => measure();
    window.addEventListener('resize', onWinResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
  }, [ready]);

  // Use useRef to track scroll position without causing re-renders
  const scrollTopRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      scrollTopRef.current = newScrollTop;

      // Cancel previous animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        // Only update state if we need to recalculate visible rows
        if (isLarge) {
          const newStartIndex = Math.max(0, Math.floor(newScrollTop / ROW_HEIGHT) - 2);
          const currentStartIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2);

          // Only update if the visible range actually changed
          if (newStartIndex !== currentStartIndex) {
            setScrollTop(newScrollTop);
          }
        }
      });
    },
    [isLarge, scrollTop, ROW_HEIGHT]
  );

  const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + 8;
  const rawStart = isLarge ? Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2) : 0;
  const maxStart = Math.max(0, sortedFilteredData.length - visibleCount);
  const startIndex = Math.min(rawStart, maxStart);
  const endIndex = isLarge
    ? Math.min(sortedFilteredData.length, startIndex + visibleCount)
    : sortedFilteredData.length;
  const rowsToRender = sortedFilteredData.slice(startIndex, endIndex);
  const totalRowsCount = sortedFilteredData.length;
  const topSpacerHeight = isLarge ? startIndex * ROW_HEIGHT : 0;
  const bottomSpacerHeight = isLarge ? Math.max(0, (totalRowsCount - endIndex) * ROW_HEIGHT) : 0;
  useEffect(() => {
    // console.log('[CustomExcel] rows debug', {
    //   dataLength: data.length,
    //   filteredLength: filteredData.length,
    //   rowsToRender: rowsToRender.length,
    //   isLarge,
    // });
  }, [data.length, filteredData.length, rowsToRender.length, isLarge]);

  // If data length shrinks while scrolled far, clamp scrollTop to keep viewport filled
  useEffect(() => {
    if (!isLarge) return;
    const desiredMaxStart = Math.max(0, sortedFilteredData.length - visibleCount);
    const currentStart = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2);
    if (currentStart > desiredMaxStart) {
      const clampedScroll = (desiredMaxStart + 2) * ROW_HEIGHT; // +2 to keep buffer logic
      setScrollTop(clampedScroll);
      scrollTopRef.current = clampedScroll;
    }
  }, [isLarge, sortedFilteredData.length, visibleCount, ROW_HEIGHT]);

  const totalWidth = Math.max(
    columns.reduce((s, c) => s + (c.width || DEFAULT_WIDTH), 0),
    600
  );

  // Compute highlighted columns by matching current column ids, fallback to names when needed
  const highlightedColumns = useMemo(() => {
    const out = new Set<number>();
    if (highlightHeaderIds && highlightHeaderIds.length) {
      const idSet = new Set<string>(highlightHeaderIds);
      columns.forEach((c, i) => {
        if (c?.id && idSet.has(c.id)) out.add(i);
      });
    }
    return out;
  }, [columns, highlightHeaderIds]);

  // Version string to force shallow-prop change when highlight set changes
  const highlightVersion = useMemo(() => {
    return Array.from(highlightedColumns.values())
      .sort((a, b) => a - b)
      .join(',');
  }, [highlightedColumns]);

  // Debug: log highlight resolution details
  useEffect(() => {
    console.log('[HighlightDebug][CustomExcel] resolve', {
      incomingIds: highlightHeaderIds || [],
      columnIds: columns.map(c => (c as any)?.id ?? (c as any)?.headerId ?? null),
      highlightedIndices: Array.from(highlightedColumns.values()),
    });
  }, [columns, highlightHeaderIds, highlightedColumns]);

  // Read highlightVersion to satisfy lints about unused var in rows; keeps stable prop churn minimal
  useEffect(() => {
    void highlightVersion;
  }, [highlightVersion]);

  // ===== Clipboard & Export Helpers =====
  const copyAll = useCallback(() => {
    try {
      const header = columns.map(c => c.name);
      const body = data.map(r => r.map(v => v ?? ''));
      const text = [header, ...body].map(row => row.join('\t')).join('\n');
      void navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }, [columns, data]);

  const exportXlsx = useCallback(() => {
    try {
      const sheetData: (string | number)[][] = [columns.map(c => c.name), ...data];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `dataset-${ts}.xlsx`);
    } catch (e) {
      console.error('Export failed', e);
    }
  }, [columns, data]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTableElement>) => {
      if (mode === 'view') return;
      const target = e.target as HTMLElement;
      const coord = target.getAttribute('data-cell');
      if (!coord) return;
      const raw = e.clipboardData.getData('text/plain');
      if (!raw) return;

      const [rStr, cStr] = coord.split('-');
      const baseRow = Number.parseInt(rStr, 10);
      const baseCol = Number.parseInt(cStr, 10);
      if (Number.isNaN(baseRow) || Number.isNaN(baseCol)) return;

      const rows = raw
        .replace(/\r/g, '')
        .split(/\n/)
        .filter(ln => ln.length > 0)
        .map(ln => ln.split(/\t/));

      if (!rows.length) return;
      e.preventDefault();

      setData(prev => {
        let next = [...prev];
        // Grow rows if needed
        const requiredRows = baseRow + rows.length;
        while (next.length < requiredRows) {
          next.push(Array(columns.length).fill(''));
        }
        // (Optional) grow columns if needed
        const colsNeeded = baseCol + Math.max(...rows.map(r => r.length));
        if (allowColumnEdit && colsNeeded > columns.length) {
          // Add new columns automatically (text type) if paste exceeds width
          const added: DataHeader[] = [];
          for (let ci = columns.length; ci < colsNeeded; ci++) {
            added.push({ name: `Column ${ci + 1}`, type: 'text', width: DEFAULT_WIDTH, index: ci });
          }
          if (added.length) {
            const newCols = [...columns, ...added];
            // update existing rows with blank cells for new columns
            next = next.map(r => {
              if (r.length < newCols.length) {
                return [...r, ...Array(newCols.length - r.length).fill('')];
              }
              return r;
            });
            dispatch(setColumnsRedux(newCols));
          }
        }
        // Apply pasted cells
        rows.forEach((prow, ri) => {
          // Clone the target row before mutating to avoid writing into a frozen array
          const original = next[baseRow + ri] ?? Array(columns.length).fill('');
          const tr = Array.isArray(original) ? [...original] : Array(columns.length).fill('');
          prow.forEach((val, ci) => {
            // When column edits are disabled, do not write beyond current width
            if (baseCol + ci < tr.length) {
              tr[baseCol + ci] = val;
            }
          });
          next[baseRow + ri] = tr;
        });
        // Commit via helper (columns state may have been updated asynchronously if columns grew)
        commit(next, columns);
        return next;
      });
    },
    [mode, columns, commit]
  );

  if (!ready) {
    return (
      <div
        className={`w-full max-w-full p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
      >
        <div className="border rounded-md bg-white dark:bg-gray-800 h-[60vh] relative overflow-hidden flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-full p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3 p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm">
        {mode === 'edit' && (
          <>
            <Button size="sm" onClick={addRow} className="gap-1">
              <Plus size={14} /> Row
            </Button>
            {allowColumnEdit && (
              <Button size="sm" onClick={addColumn} className="gap-1">
                <Plus size={14} /> Col
              </Button>
            )}
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            <DeleteRowButton onDelete={deleteSelectedRow} dataLength={data.length} />
            {allowColumnEdit && (
              <Button
                size="sm"
                variant="destructive"
                onClick={deleteSelectedColumn}
                disabled={selectedColumn === null || columns.length <= 1}
                className="gap-1"
              >
                Delete Col {selectedColumn !== null ? `"${columns[selectedColumn]?.name}"` : ''}
              </Button>
            )}
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            <Button size="sm" variant="outline" onClick={copyAll} className="gap-1 bg-transparent">
              <Copy size={14} /> Copy
            </Button>
          </>
        )}
        <Button size="sm" variant="outline" onClick={exportXlsx} className="gap-1 bg-transparent">
          <FileDown size={14} /> Export
        </Button>
        <div className="flex-grow text-xs text-gray-500 dark:text-gray-400">
          {isLarge && (
            <span>
              Virtualized view: showing {rowsToRender.length} of {filteredData.length} rows
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs">
          <span className="text-gray-600 dark:text-gray-300">Thousand separator:</span>
          {numberFormat.thousandsSeparator === '' ? (
            <span
              className="inline-block w-5 h-5 rounded-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
              title="Empty (no thousands separator)"
            />
          ) : (
            <span className="px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-mono">
              {numberFormat.thousandsSeparator}
            </span>
          )}
          <span className="text-gray-600 dark:text-gray-300">Decimal separator:</span>
          <span className="px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-mono">
            {numberFormat.decimalSeparator}
          </span>
          <span className="text-gray-600 dark:text-gray-300">Date format:</span>
          <span className="px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-mono">
            {dateFormat}
          </span>
        </div>
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800 h-[60vh] relative overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="w-full h-full overflow-auto"
          style={{
            scrollbarWidth: 'auto',
            scrollbarColor: '#94a3b8 #f1f5f9',
          }}
        >
          <table
            className="text-sm border-collapse min-w-full"
            style={{
              tableLayout: 'fixed',
              width: totalWidth,
            }}
            onPaste={handlePaste}
          >
            <ExcelHeaderRow
              mode={mode}
              onTypeChange={setType}
              allowHeaderEdit={allowHeaderEdit}
              highlightedColumns={highlightedColumns}
              showColumnDeselect={allowColumnEdit}
            />
            <tbody>
              {isLarge && topSpacerHeight > 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ padding: 0, border: 'none' }}>
                    <div style={{ height: topSpacerHeight }} />
                  </td>
                </tr>
              )}
              {rowsToRender.map(({ row, i }) => (
                <ExcelRow
                  key={i}
                  rowIndex={i}
                  rowData={row}
                  columnsLength={columns.length}
                  mode={mode}
                  onCellChange={handleCellChange}
                  onCellFocus={handleCellFocus}
                  highlightedColumns={highlightedColumns}
                  highlightVersion={highlightVersion}
                />
              ))}
              {isLarge && bottomSpacerHeight > 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ padding: 0, border: 'none' }}>
                    <div style={{ height: bottomSpacerHeight }} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <style>{`
          div::-webkit-scrollbar {width: 12px;height: 12px;}
          div::-webkit-scrollbar-track {background: #f1f5f9;border-radius: 6px;}
          div::-webkit-scrollbar-thumb {background: #94a3b8;border-radius: 6px;border: 2px solid #f1f5f9;}
          div::-webkit-scrollbar-thumb:hover {background: #64748b;}
          div::-webkit-scrollbar-corner {background: #f1f5f9;}
        `}</style>
      </div>

      {mode === 'edit' && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          {(() => {
            // Duplicate column errors
            if (duplicateColumns && duplicateColumns.duplicateNames.length > 0) {
              const duplicateNames = duplicateColumns.duplicateNames.join(', ');
              return (
                <div className="text-red-600 dark:text-red-400 flex items-start gap-2">
                  <span>{t('excelErrors.duplicateColumns', { names: duplicateNames })}</span>
                </div>
              );
            }
            return null;
          })()}
          <ValidationDisplay columns={columns} />
          {infoMessage && (
            <div className="text-blue-600 dark:text-blue-400 flex items-start gap-2">
              <span>{infoMessage}</span>
              <button
                onClick={() => dispatch(setInfoMessage(null))}
                className="ml-auto text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
              >
                ×
              </button>
            </div>
          )}
          <p>
            {sortConfig &&
              `Sorted by "${columns[sortConfig.column]?.name}" (${sortConfig.direction})`}
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomExcel;
