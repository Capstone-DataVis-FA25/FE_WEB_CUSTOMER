'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDataset } from '@/contexts/DatasetContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedRow,
  setSelectedColumn,
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
  selectTouchedCells,
  selectInfoMessage,
  selectSortConfig,
  selectDuplicateColumns,
  selectParseErrors,
} from '@/features/excelUI';
import ExcelRow from './ExcelRow';
import ExcelColumnHeader from './ExcelColumnHeader';
import DeleteRowButton from './DeleteRowButton';
import ValidationDisplay from './ValidationDisplay';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import {
  Undo,
  Redo,
  Plus,
  Copy,
  FileText,
  FileDigit,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  FileDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// =============== Types & Helpers =================
import type { DataHeader } from '@/utils/dataProcessors';
interface CustomExcelProps {
  initialData?: string[][];
  initialColumns?: DataHeader[];
  onDataChange?: (d: string[][], c: DataHeader[]) => void;
  className?: string;
  mode?: 'edit' | 'view';
}
interface HistoryEntry {
  data: string[][];
  columns: DataHeader[];
}
// Safer clone (JSON stringify can crash large datasets). For large arrays we shallow copy.
const deepClone = <T,>(v: T, shallow = false): T => {
  if (shallow) return v;
  return JSON.parse(JSON.stringify(v));
};
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
}) => {
  // Core state
  const [columns, setColumns] = useState<DataHeader[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [filters, setFilters] = useState<string[]>([]);
  // Track one-time initialization so prop identity changes (triggered by onDataChange upstream) do not reset edited state
  const initializedRef = useRef(false);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  // Redux dispatch and selectors
  const dispatch = useAppDispatch();
  // Only subscribe to selectors that CustomExcel actually needs for its own rendering
  const selectedColumn = useAppSelector(selectSelectedColumn);
  const infoMessage = useAppSelector(selectInfoMessage);
  const sortConfig = useAppSelector(selectSortConfig);
  const duplicateColumns = useAppSelector(selectDuplicateColumns);
  // Removed parseErrors - individual cells handle their own validation
  // Removed touchedCells - not used in CustomExcel rendering
  const { tryConvert, tryConvertColumn, validateDuplicateColumns, dateFormat, numberFormat } =
    useDataset();

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
  const LARGE_ROW_THRESHOLD = 2000;
  const LARGE_CELL_THRESHOLD = 50000; // rows * cols
  const isLarge =
    data.length > LARGE_ROW_THRESHOLD || data.length * columns.length > LARGE_CELL_THRESHOLD;
  const historyEnabled = !isLarge;

  // Virtualization states
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const ROW_HEIGHT = 40; // approximate row height incl. borders

  // Always reset state when initialData, initialColumns, or mode changes
  useEffect(() => {
    console.log('🔄 CustomExcel useEffect - props changed:', {
      initialDataLength: initialData.length,
      initialColumnsLength: initialColumns.length,
      mode,
      initialized: initializedRef.current,
    });

    const initCols = (initialColumns.length ? initialColumns : DEFAULT_COLS).map(c => ({
      ...c,
      width: c.width || DEFAULT_WIDTH,
    }));
    const initData = initialData.length
      ? initialData
      : DEFAULT_ROWS.map(() => Array(initCols.length).fill(''));
    setColumns(initCols);
    setData(initData);
    setFilters(Array(initCols.length).fill(''));

    // Initialize history immediately to prevent extra re-render
    if (historyEnabled) {
      const first: HistoryEntry = { data: deepClone(initData), columns: deepClone(initCols) };
      setHistory([first]);
      setHistoryIndex(0);
    }

    // Validate columns immediately and update Redux
    if (initCols.length > 0) {
      const validationResult = validateDuplicateColumns(initCols);
      dispatch(
        setDuplicateColumns({
          duplicateNames: validationResult.duplicateNames,
          duplicateColumnIndices: validationResult.duplicateColumnIndices,
        })
      );
      dispatch(setEmptyColumns(validationResult.emptyColumnIndices));

      // Validate all cells on initial load
      const parseErrors: Record<number, number[]> = {};
      initData.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
          const colType = initCols[colIndex]?.type ?? 'text';
          const conv = tryConvert(
            colType,
            colIndex,
            rowIndex,
            cellValue,
            undefined,
            colType === 'date' ? dateFormat : undefined
          );

          if (!conv.ok) {
            if (!parseErrors[rowIndex]) {
              parseErrors[rowIndex] = [];
            }
            parseErrors[rowIndex].push(colIndex);
          }
        });
      });
      dispatch(setParseErrors(parseErrors));
    }

    initializedRef.current = true;
  }, [
    initialColumns,
    initialData,
    mode,
    historyEnabled,
    validateDuplicateColumns,
    dispatch,
    tryConvert,
    dateFormat,
  ]);

  // History initialization moved to main useEffect to prevent extra re-renders

  // Duplicate column validation moved to main useEffect to prevent extra re-renders

  const commit = useCallback(
    (
      nextData: string[][],
      nextCols: DataHeader[],
      skipHistory = false,
      changes: {
        dataChanged?: boolean;
        columnsChanged?: boolean;
        validationOnly?: boolean;
      } = { dataChanged: true, columnsChanged: true }
    ) => {
      console.log('📝 Commit called:', {
        dataChanged: changes.dataChanged,
        columnsChanged: changes.columnsChanged,
        validationOnly: changes.validationOnly,
        dataLength: nextData.length,
        columnsLength: nextCols.length,
        skipHistory,
      });

      // Only update data if it actually changed
      if (changes.dataChanged) {
        console.log('📊 Updating data state');
        setData(nextData);
      }

      // Only update columns if they actually changed
      if (changes.columnsChanged) {
        console.log('📋 Updating columns state');
        setColumns(nextCols);
      }

      // Only update history if data or columns changed (not for validation-only changes)
      if (historyEnabled && !skipHistory && (changes.dataChanged || changes.columnsChanged)) {
        const entry: HistoryEntry = { data: deepClone(nextData), columns: deepClone(nextCols) };
        setHistory(prev => [...prev.slice(0, historyIndex + 1), entry]);
        setHistoryIndex(i => i + 1);
      }

      // Only notify parent if data or columns actually changed
      if (onDataChange && (changes.dataChanged || changes.columnsChanged)) {
        console.log('📤 Notifying parent (onDataChange):', {
          dataChanged: changes.dataChanged,
          columnsChanged: changes.columnsChanged,
          isLarge,
          dataLength: nextData.length,
          columnsLength: nextCols.length,
        });
        if (isLarge) {
          // Debounce using requestAnimationFrame + timeout
          const fn = onDataChange as unknown as { _timer?: NodeJS.Timeout };
          if (fn._timer) clearTimeout(fn._timer);
          fn._timer = setTimeout(() => onDataChange(nextData, nextCols), 150);
        } else {
          onDataChange(nextData, nextCols);
        }
      }
    },
    [historyIndex, onDataChange, historyEnabled, isLarge]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      const st = history[idx];
      setHistoryIndex(idx);
      setData(deepClone(st.data));
      setColumns(deepClone(st.columns));
      setFilters(Array(st.columns.length).fill(''));
      dispatch(setSelectedRow(null));
      dispatch(setSelectedColumn(null));
      dispatch(setSortConfig(null));
      if (onDataChange) onDataChange(st.data, st.columns);
    }
  }, [historyIndex, history, onDataChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      const st = history[idx];
      setHistoryIndex(idx);
      setData(deepClone(st.data));
      setColumns(deepClone(st.columns));
      setFilters(Array(st.columns.length).fill(''));
      dispatch(setSelectedRow(null));
      dispatch(setSelectedColumn(null));
      dispatch(setSortConfig(null));
      if (onDataChange) onDataChange(st.data, st.columns);
    }
  }, [historyIndex, history, onDataChange]);

  useEffect(() => {
    if (mode === 'edit') {
      const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;

        // Skip if user is typing in input fields
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }

        // Handle Ctrl+Z (Undo)
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          undo();
          return;
        }

        // Handle Ctrl+Y or Ctrl+Shift+Z (Redo)
        if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
          e.preventDefault();
          e.stopPropagation();
          redo();
          return;
        }
      };

      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [undo, redo, mode]);

  // Generic mutation helpers
  // setCell no longer used with temp editing; keep minimal helper if needed in future
  const setHeader = useCallback(
    (c: number, val: string) => {
      console.log('📝 setHeader called:', {
        column: c,
        newName: val,
        currentName: columns[c]?.name,
      });

      // Skip if the name hasn't actually changed
      if (columns[c]?.name === val) {
        console.log('📝 setHeader skipped - no change');
        return;
      }

      const nc = deepClone(columns, true).map((col, i) => (i === c ? { ...col, name: val } : col));
      nc[c].name = val;

      // Validate columns after name change
      const validationResult = validateDuplicateColumns(nc);
      dispatch(
        setDuplicateColumns({
          duplicateNames: validationResult.duplicateNames,
          duplicateColumnIndices: validationResult.duplicateColumnIndices,
        })
      );
      dispatch(setEmptyColumns(validationResult.emptyColumnIndices));

      // For header changes, only update columns (no data re-render)
      commit(data, nc, false, {
        dataChanged: false, // Don't re-render data cells
        columnsChanged: true, // Only update column headers
      });
    },
    [columns, validateDuplicateColumns, dispatch, commit]
  );

  const setType = (c: number, val: 'text' | 'number' | 'date') => {
    console.log('🔧 setType called:', { column: c, newType: val, currentType: columns[c]?.type });
    if (columns[c].type === val) return;
    dispatch(setInfoMessage(null));

    const { nextData, nextColumns } = tryConvertColumn(c, val);

    // For column type changes, only update columns initially (no data re-render)
    // The validation will run separately and only update data if needed
    commit(nextData, nextColumns, false, {
      dataChanged: false, // Don't re-render data cells
      columnsChanged: true, // Only update column headers
    });

    dispatch(setTouchedCells([]));
  };

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
        console.log('✏️ handleCellChange skipped - no change:', {
          row: rowIndex,
          col: columnIndex,
          value: finalVal,
        });
        return;
      }

      console.log('✏️ handleCellChange called:', {
        row: rowIndex,
        col: columnIndex,
        value: finalVal,
      });

      // Commit trimmed value to data only (no normalization)
      const nextData = [...data];
      const rowCopy = [...nextData[rowIndex]];
      rowCopy[columnIndex] = finalVal;
      nextData[rowIndex] = rowCopy;
      commit(nextData, columns);

      // Validate against current column type and update Redux parseErrors
      const colType = columns[columnIndex]?.type ?? 'text';
      const conv = tryConvert(
        colType,
        columnIndex,
        rowIndex,
        finalVal,
        undefined,
        colType === 'date' ? dateFormat : undefined
      );

      // Update Redux with individual cell validation result
      dispatch(
        updateParseError({
          row: rowIndex,
          column: columnIndex,
          hasError: !conv.ok,
        })
      );
    },
    [data, columns, commit, tryConvert, dateFormat, dispatch]
  );

  // Add/remove
  const addRow = () => {
    if (mode === 'view') return;
    const nd = [...data, Array(columns.length).fill('')];
    // Adding row changes both data and columns (new row added)
    commit(nd, columns, false, {
      dataChanged: true, // Update data cells
      columnsChanged: true, // Update column headers (for row count)
    });
  };
  const addColumn = () => {
    if (mode === 'view') return;
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
    // Adding column changes both data and columns
    commit(nd, nc, false, {
      dataChanged: true, // Update data cells (new column added)
      columnsChanged: true, // Update column headers
    });
    setFilters(f => [...f, '']);
  };

  const removeRow = (r: number) => {
    if (mode === 'view' || data.length <= 1) return;
    const nd = data.filter((_, i) => i !== r);
    setSelectedRow(null);
    // Removing row changes both data and columns
    commit(nd, columns, false, {
      dataChanged: true, // Update data cells
      columnsChanged: true, // Update column headers (for row count)
    });
  };

  const removeColumn = (c: number) => {
    if (mode === 'view' || columns.length <= 1) return;
    const nc = columns.filter((_, i) => i !== c);
    const nd = data.map(r => r.filter((_, i) => i !== c));
    dispatch(setSelectedColumn(null));
    setSortConfig(null);
    // Removing column changes both data and columns
    commit(nd, nc, false, {
      dataChanged: true, // Update data cells
      columnsChanged: true, // Update column headers
    });
    setFilters(f => f.filter((_, i) => i !== c));
  };

  const deleteSelectedRow = (rowIndex: number) => {
    removeRow(rowIndex);
  };
  const deleteSelectedColumn = () => {
    if (selectedColumn !== null) {
      removeColumn(selectedColumn);
    }
  };

  const handleSort = (columnIndex: number) => {
    if (mode === 'view') return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.column === columnIndex && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    dispatch(setSortConfig({ column: columnIndex, direction }));

    const nd = [...data];
    const columnType = columns[columnIndex].type;

    nd.sort((a, b) => {
      const aVal = a[columnIndex] || '';
      const bVal = b[columnIndex] || '';

      // Handle empty values - put them at the end
      if (!aVal && !bVal) return 0;
      if (!aVal) return direction === 'asc' ? 1 : -1;
      if (!bVal) return direction === 'asc' ? -1 : 1;

      if (columnType === 'number') {
        const aNum = Number.parseFloat(aVal) || 0;
        const bNum = Number.parseFloat(bVal) || 0;
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      } else if (columnType === 'date') {
        // Parse dates and compare
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);

        // Handle invalid dates - put them at the end
        if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
        if (isNaN(aDate.getTime())) return direction === 'asc' ? 1 : -1;
        if (isNaN(bDate.getTime())) return direction === 'asc' ? -1 : 1;

        return direction === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      } else {
        // Text sorting (case-insensitive)
        return direction === 'asc'
          ? aVal.toLowerCase().localeCompare(bVal.toLowerCase())
          : bVal.toLowerCase().localeCompare(aVal.toLowerCase());
      }
    });

    // Sorting changes data order but not columns
    commit(nd, columns, false, {
      dataChanged: true, // Update data cells (reordered)
      columnsChanged: false, // Don't re-render column headers
    });
  };

  // Filters
  const changeFilter = (c: number, v: string) =>
    setFilters(fs => {
      const nf = [...fs];
      nf[c] = v;
      return nf;
    });

  const filteredData = useMemo(() => {
    if (!filters.some(f => f)) return data.map((row, i) => ({ row, i }));
    return data
      .map((row, i) => ({ row, i }))
      .filter(({ row }) =>
        row.every((cell, ci) =>
          filters[ci] ? String(cell).toLowerCase().includes(filters[ci].toLowerCase()) : true
        )
      );
  }, [data, filters]);

  // Virtualization calculations
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const resize = () => setViewportHeight(el.clientHeight);
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      // Cleanup animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

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

  const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + 5;
  const startIndex = isLarge ? Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2) : 0;
  const endIndex = isLarge
    ? Math.min(filteredData.length, startIndex + visibleCount)
    : filteredData.length;
  const rowsToRender = filteredData.slice(startIndex, endIndex);
  const topSpacer = startIndex * ROW_HEIGHT;
  const bottomSpacer = (filteredData.length - endIndex) * ROW_HEIGHT;

  const totalWidth = Math.max(
    columns.reduce((s, c) => s + (c.width || DEFAULT_WIDTH), 0),
    600
  );

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
        if (colsNeeded > columns.length) {
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
            setColumns(newCols);
          }
        }
        // Apply pasted cells
        rows.forEach((prow, ri) => {
          const tr = next[baseRow + ri];
          prow.forEach((val, ci) => {
            if (baseCol + ci < tr.length) {
              tr[baseCol + ci] = val;
            }
          });
          next[baseRow + ri] = [...tr];
        });
        // Commit via helper (columns state may have been updated asynchronously if columns grew)
        commit(next, columns);
        return next;
      });
    },
    [mode, columns, commit]
  );

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
            <Button size="sm" onClick={addColumn} className="gap-1">
              <Plus size={14} /> Col
            </Button>
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            <DeleteRowButton onDelete={deleteSelectedRow} dataLength={data.length} />
            <Button
              size="sm"
              variant="destructive"
              onClick={deleteSelectedColumn}
              disabled={selectedColumn === null || columns.length <= 1}
              className="gap-1"
            >
              Delete Col {selectedColumn !== null ? `"${columns[selectedColumn]?.name}"` : ''}
            </Button>
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            <Button
              size="sm"
              variant="ghost"
              onClick={e => {
                e.preventDefault();
                undo();
              }}
              disabled={!historyEnabled || historyIndex <= 0}
              title={historyEnabled ? 'Undo (Ctrl+Z)' : 'Undo disabled for large dataset'}
            >
              <Undo size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={e => {
                e.preventDefault();
                redo();
              }}
              disabled={!historyEnabled || historyIndex >= history.length - 1}
              title={historyEnabled ? 'Redo (Ctrl+Y)' : 'Redo disabled for large dataset'}
            >
              <Redo size={16} />
            </Button>
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
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-30 select-none">
              <tr>
                <th className="sticky left-0 z-40 bg-gray-100 dark:bg-gray-700 border-r border-b border-gray-300 dark:border-gray-600 w-12 text-center font-semibold">
                  #
                </th>
                {columns.map((col, ci) => (
                  <ExcelColumnHeader
                    key={ci}
                    columnIndex={ci}
                    column={col}
                    mode={mode}
                    filterValue={filters[ci] || ''}
                    onHeaderChange={setHeader}
                    onTypeChange={setType}
                    onSort={handleSort}
                    onFilterChange={changeFilter}
                    sortConfig={sortConfig}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {isLarge && topSpacer > 0 && (
                <tr style={{ height: topSpacer }}>
                  <td colSpan={columns.length + 1} />
                </tr>
              )}
              {rowsToRender.map(({ row, i }) => (
                <ExcelRow
                  key={i}
                  rowIndex={i}
                  rowData={row}
                  columns={columns}
                  mode={mode}
                  onCellChange={handleCellChange}
                  onCellFocus={handleCellFocus}
                  onDataChange={onDataChange}
                />
              ))}
              {isLarge && bottomSpacer > 0 && (
                <tr style={{ height: bottomSpacer }}>
                  <td colSpan={columns.length + 1} />
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
                  <span>
                    Lỗi: Các cột có tên trùng lặp: {duplicateNames}. Vui lòng đổi tên để tránh xung
                    đột.
                  </span>
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
            {historyEnabled ? (
              <>
                History: {historyIndex + 1}/{history.length} states available
              </>
            ) : (
              <>History disabled (large dataset)</>
            )}
            {sortConfig &&
              ` | Sorted by "${columns[sortConfig.column]?.name}" (${sortConfig.direction})`}
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomExcel;
