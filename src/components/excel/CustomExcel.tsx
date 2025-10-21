'use client';

import type React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDataset, type DateFormat, type NumberFormat } from '@/contexts/DatasetContext';
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
const COLUMN_TYPES = [
  { label: 'Text', value: 'text', icon: <FileText size={14} /> },
  { label: 'Number', value: 'number', icon: <FileDigit size={14} /> },
  { label: 'Date', value: 'date', icon: <Calendar size={14} /> },
];

// Value validators (non-blocking)
const isValidValue = (type: DataHeader['type'], v: string): boolean => {
  if (v === '' || v == null) return true;
  if (type === 'number') return /^[-+]?\d+$/.test(v.trim());
  if (type === 'date') return /^\d{4}-\d{2}-\d{2}$/.test(v.trim());
  return true;
};

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

  const [sortConfig, setSortConfig] = useState<{
    column: number;
    direction: 'asc' | 'desc';
  } | null>(null);

  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  // New states for validation UX
  const [touchedCells, setTouchedCells] = useState<Set<string>>(new Set());
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const {
    setExcelErrors,
    validationErrors,
    tryConvert,
    tryConvertColumn,
    validateDuplicateColumns,
    dateFormat,
  } = useDataset();
  // Temporary edits per cell; applied on blur/enter only
  const [tempEdits, setTempEdits] = useState<Record<string, string>>({});

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
    initializedRef.current = true;
  }, [initialColumns, initialData, mode]);

  useEffect(() => {
    if (historyEnabled && history.length === 0 && columns.length > 0 && data.length > 0) {
      const first: HistoryEntry = { data: deepClone(data), columns: deepClone(columns) };
      setHistory([first]);
      setHistoryIndex(0);
    }
  }, [columns, data, history.length, historyEnabled]);

  // Validate duplicate columns whenever columns change
  useEffect(() => {
    if (columns.length > 0) {
      validateDuplicateColumns(columns);
    }
  }, [columns, validateDuplicateColumns]);

  const commit = useCallback(
    (nextData: string[][], nextCols: DataHeader[], skipHistory = false) => {
      setData(nextData);
      setColumns(nextCols);
      if (historyEnabled && !skipHistory) {
        const entry: HistoryEntry = { data: deepClone(nextData), columns: deepClone(nextCols) };
        setHistory(prev => [...prev.slice(0, historyIndex + 1), entry]);
        setHistoryIndex(i => i + 1);
      }
      // Always notify parent (debounced for large data)
      if (onDataChange) {
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
      setSelectedRow(null);
      setSelectedColumn(null);
      setSortConfig(null);
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
      setSelectedRow(null);
      setSelectedColumn(null);
      setSortConfig(null);
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
  const setHeader = (c: number, val: string) => {
    const nc = deepClone(columns, true).map((col, i) => (i === c ? { ...col, name: val } : col));
    nc[c].name = val;
    commit(data, nc);
  };

  const setType = (c: number, val: 'text' | 'number' | 'date') => {
    if (columns[c].type === val) return;
    setInfoMessage(null);

    const { nextData, nextColumns } = tryConvertColumn(c, val);

    commit(nextData, nextColumns);

    setTouchedCells(prev => new Set([...prev]));
  };

  // Apply a pending edit for a single cell (trim and commit), then validate
  const applyCellEdit = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const pending = Object.prototype.hasOwnProperty.call(tempEdits, key)
      ? tempEdits[key]
      : (data[r][c] ?? '');
    const finalVal = (pending ?? '').trim();

    // Commit trimmed value to data only (no normalization)
    const nextData = [...data];
    const rowCopy = [...nextData[r]];
    rowCopy[c] = finalVal;
    nextData[r] = rowCopy;
    commit(nextData, columns);

    // Validate against current column type and update parseErrors map
    const colType = columns[c]?.type ?? 'text';
    // Use the same date format as the context for consistent validation
    const conv = tryConvert(
      colType,
      c,
      r,
      finalVal,
      undefined,
      colType === 'date' ? dateFormat : undefined
    );
    const existing = validationErrors.excelErrors?.parseErrors || {};
    const next: Record<number, number[]> = { ...existing };
    const r1 = r + 1;
    if (conv.ok) {
      if (next[r1]?.includes(c)) {
        const remaining = (next[r1] || []).filter(idx => idx !== c);
        if (remaining.length) next[r1] = remaining;
        else delete next[r1];
      }
    } else {
      const cols = next[r1] ? [...next[r1]] : [];
      if (!cols.includes(c)) cols.push(c);
      next[r1] = cols;
    }
    setExcelErrors({ parseErrors: next });

    // Clear temp edit for this cell after applying
    setTempEdits(prev => {
      if (!Object.prototype.hasOwnProperty.call(prev, key)) return prev;
      const nextMap = { ...prev } as Record<string, string>;
      delete nextMap[key];
      return nextMap;
    });
  };

  // Add/remove
  const addRow = () => {
    if (mode === 'view') return;
    const nd = [...data, Array(columns.length).fill('')];
    commit(nd, columns);
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
    commit(nd, nc);
    setFilters(f => [...f, '']);
  };

  const removeRow = (r: number) => {
    if (mode === 'view' || data.length <= 1) return;
    const nd = data.filter((_, i) => i !== r);
    setSelectedRow(null);
    commit(nd, columns);
  };

  const removeColumn = (c: number) => {
    if (mode === 'view' || columns.length <= 1) return;
    const nc = columns.filter((_, i) => i !== c);
    const nd = data.map(r => r.filter((_, i) => i !== c));
    setSelectedColumn(null);
    setSortConfig(null);
    commit(nd, nc);
    setFilters(f => f.filter((_, i) => i !== c));
  };

  const deleteSelectedRow = () => {
    if (selectedRow !== null) {
      removeRow(selectedRow);
    }
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

    setSortConfig({ column: columnIndex, direction });

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

    commit(nd, columns);
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

  // Map of parse error cells from centralized validation state
  const parseErrorsMap = useMemo(() => {
    return validationErrors.excelErrors?.parseErrors || {};
  }, [validationErrors.excelErrors]);

  // Virtualization calculations
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const resize = () => setViewportHeight(el.clientHeight);
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

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
            <Button
              size="sm"
              variant="destructive"
              onClick={deleteSelectedRow}
              disabled={selectedRow === null || data.length <= 1}
              className="gap-1"
            >
              Delete Row {selectedRow !== null ? `#${selectedRow + 1}` : ''}
            </Button>
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
                {columns.map((col, ci) => {
                  const isDuplicate =
                    validationErrors.duplicateColumns?.duplicateColumnIndices.includes(ci) || false;
                  return (
                    <th
                      key={ci}
                      className={`relative group border-b border-r p-2 align-top font-semibold text-gray-700 dark:text-gray-200 cursor-pointer ${
                        isDuplicate
                          ? 'bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-800/50'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                      } ${selectedColumn === ci ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                      style={{ width: col.width || DEFAULT_WIDTH, minWidth: 150 }}
                      onClick={() => setSelectedColumn(selectedColumn === ci ? null : ci)}
                    >
                      <div className="flex items-center gap-1">
                        {mode === 'edit' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="w-6 h-6 flex-shrink-0">
                                {COLUMN_TYPES.find(t => t.value === col.type)?.icon}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {COLUMN_TYPES.map(t => (
                                <DropdownMenuItem
                                  key={t.value}
                                  onClick={() => setType(ci, t.value as DataHeader['type'])}
                                  className="gap-2"
                                >
                                  {t.icon} {t.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <input
                          value={col.name}
                          readOnly={mode === 'view'}
                          onChange={e => setHeader(ci, e.target.value)}
                          className={`flex-grow bg-transparent font-bold text-sm px-2 py-1 rounded-md min-w-0 ${mode === 'edit' ? 'focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600' : 'cursor-default'}`}
                          style={{ maxWidth: '140px' }}
                        />
                        {mode === 'edit' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={e => {
                              e.stopPropagation();
                              handleSort(ci);
                            }}
                            className="w-6 h-6 flex-shrink-0 ml-auto"
                            title="Sort column"
                          >
                            {sortConfig?.column === ci ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp size={12} />
                              ) : (
                                <ArrowDown size={12} />
                              )
                            ) : (
                              <ArrowUpDown size={12} />
                            )}
                          </Button>
                        )}
                        {selectedColumn === ci && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedColumn(null);
                            }}
                            className="w-6 h-6 flex-shrink-0"
                          >
                            <X size={12} className="text-blue-500" />
                          </Button>
                        )}
                      </div>
                      {mode === 'edit' && (
                        <input
                          value={filters[ci] || ''}
                          onChange={e => changeFilter(ci, e.target.value)}
                          placeholder="Filter..."
                          className="w-full text-xs border rounded px-2 py-1 mt-1 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {isLarge && topSpacer > 0 && (
                <tr style={{ height: topSpacer }}>
                  <td colSpan={columns.length + 1} />
                </tr>
              )}
              {rowsToRender.map(({ row, i }) => (
                <tr
                  key={i}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    selectedRow === i ? 'bg-blue-100 dark:bg-blue-900/50' : ''
                  }`}
                  onClick={() => setSelectedRow(selectedRow === i ? null : i)}
                >
                  <td className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-700 border-r border-b border-gray-300 dark:border-gray-600 text-center text-gray-600 dark:text-gray-300 px-2 text-xs">
                    {i + 1}
                    {selectedRow === i && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedRow(null);
                        }}
                        className="w-4 h-4 ml-1"
                      >
                        <X size={10} className="text-blue-500" />
                      </Button>
                    )}
                  </td>
                  {columns.map((col, ci) => (
                    <td
                      key={ci}
                      className="border-b border-r border-gray-200 dark:border-gray-600"
                      style={{ width: col.width || DEFAULT_WIDTH, minWidth: 150 }}
                    >
                      <input
                        data-cell={`${i}-${ci}`}
                        value={
                          Object.prototype.hasOwnProperty.call(tempEdits, `${i}-${ci}`)
                            ? tempEdits[`${i}-${ci}`]
                            : row[ci] || ''
                        }
                        readOnly={mode === 'view'}
                        onChange={e => {
                          const key = `${i}-${ci}`;
                          const val = e.target.value;
                          setTempEdits(prev => ({ ...prev, [key]: val }));
                        }}
                        onBlur={() => {
                          setTouchedCells(s => new Set(s).add(`${i}-${ci}`));
                          applyCellEdit(i, ci);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        type="text"
                        placeholder={col.type === 'date' ? 'YYYY-MM-DD' : ''}
                        className={`w-full h-full p-2 bg-transparent border-none text-sm ${mode === 'edit' ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-blue-900/40' : 'cursor-default'} ${
                          // Highlight strictly based on centralized parse errors
                          (parseErrorsMap[i + 1]?.includes(ci) ?? false)
                            ? 'bg-red-50 dark:bg-red-900/30 ring-1 ring-red-400'
                            : ''
                        }`}
                        title={
                          (parseErrorsMap[i + 1]?.includes(ci) ?? false)
                            ? 'Ô này có lỗi phân tích cú pháp'
                            : ''
                        }
                      />
                    </td>
                  ))}
                </tr>
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
            const duplicateColumns = validationErrors.duplicateColumns;
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
          {(() => {
            const parseMap = validationErrors.excelErrors?.parseErrors || {};
            const rows = Object.keys(parseMap)
              .map(n => Number(n))
              .filter(n => !Number.isNaN(n))
              .sort((a, b) => a - b);
            if (rows.length === 0) return null;
            const firstRow = rows[0];
            const firstColIdx = (parseMap[firstRow] || [])[0] ?? 0;
            const colName = columns[firstColIdx]?.name ?? '';
            const remaining = Math.max(0, rows.length - 1);
            const base = `Opps, vui lòng kiểm tra hàng ${firstRow} tại cột "${colName}"`;
            const msg =
              remaining > 0 ? `${base}. Còn ${remaining} hàng khác gặp vấn đề.` : `${base}.`;
            return (
              <div className="text-red-600 dark:text-red-400 flex items-start gap-2">
                <span>{msg}</span>
              </div>
            );
          })()}
          {infoMessage && (
            <div className="text-blue-600 dark:text-blue-400 flex items-start gap-2">
              <span>{infoMessage}</span>
              <button
                onClick={() => setInfoMessage(null)}
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
