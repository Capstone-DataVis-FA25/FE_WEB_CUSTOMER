import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { FileText, FileDigit, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ColumnMeta {
  name: string;
  type?: 'text' | 'number' | 'date';
}
interface DatasetViewerTableProps {
  // Can pass simple array of names or array of objects with name + type
  columns: (string | ColumnMeta)[];
  rows: (string | number | null)[][]; // body rows only
  height?: number | string; // container height (default 60vh)
  className?: string;
  /** Approximate row height in px (for virtualization). */
  rowHeight?: number;
  /** Extra rows rendered above & below viewport for smoother scroll. */
  overscan?: number;
  /** Disable virtualization entirely (for very small datasets). */
  disableVirtualization?: boolean;
  /** Zebra stripe rows */
  striped?: boolean;
  /** Show type icons in header (default true) */
  showTypeIcons?: boolean;
}

// Helper to normalize columns
const normalizeColumns = (cols: (string | ColumnMeta)[]): Required<ColumnMeta>[] =>
  cols.map(c =>
    typeof c === 'string' ? { name: c, type: 'text' } : { name: c.name, type: c.type || 'text' }
  );

const typeIcon = (type: ColumnMeta['type']) => {
  switch (type) {
    case 'number':
      return <FileDigit size={14} />;
    case 'date':
      return <Calendar size={14} />;
    default:
      return <FileText size={14} />;
  }
};

const COLUMN_TYPES = [
  { label: 'Text', value: 'text', icon: <FileText size={14} /> },
  { label: 'Number', value: 'number', icon: <FileDigit size={14} /> },
  { label: 'Date', value: 'date', icon: <Calendar size={14} /> },
];

/**
 * Lightweight read‑only dataset viewer (no context, no editing).
 * - Sticky header
 * - Optional simple virtualization for large datasets
 */
const DatasetViewerTable: React.FC<DatasetViewerTableProps> = ({
  columns,
  rows,
  height = '60vh',
  className = '',
  rowHeight = 36,
  overscan = 8,
  disableVirtualization,
  striped = true,
  showTypeIcons = true,
}) => {
  const colMeta = useMemo(() => normalizeColumns(columns), [columns]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const totalRows = rows.length;
  const useVirtual = !disableVirtualization && totalRows > 400; // heuristic

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!useVirtual) return;
      setScrollTop(e.currentTarget.scrollTop);
    },
    [useVirtual]
  );

  const viewportHeight = useMemo(() => {
    if (!useVirtual) return totalRows * rowHeight;
    if (!scrollRef.current) return 0;
    return scrollRef.current.clientHeight;
  }, [useVirtual, totalRows, rowHeight]);

  const startIndex = useVirtual ? Math.max(0, Math.floor(scrollTop / rowHeight) - overscan) : 0;
  const visibleCount = useVirtual
    ? Math.ceil(viewportHeight / rowHeight) + overscan * 2
    : totalRows;
  const endIndex = useVirtual ? Math.min(totalRows, startIndex + visibleCount) : totalRows;
  const slice = rows.slice(startIndex, endIndex);
  const topSpacer = useVirtual ? startIndex * rowHeight : 0;
  const bottomSpacer = useVirtual ? (totalRows - endIndex) * rowHeight : 0;

  // Auto adjust if rows shrink drastically (e.g. dataset change)
  useEffect(() => {
    if (startIndex > totalRows) {
      setScrollTop(0);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [startIndex, totalRows]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className={`w-full max-w-full p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg ${className}`}
      style={{ height }}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full rounded-md bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div
          ref={scrollRef}
          className="dataset-viewer-scroll w-full h-full overflow-auto"
          onScroll={onScroll}
          style={{ scrollbarWidth: 'auto', scrollbarColor: '#94a3b8 #f1f5f9' }}
        >
          <table
            className="text-sm min-w-full border-separate"
            style={{ tableLayout: 'fixed', borderSpacing: 0 }}
          >
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-20 select-none">
              <tr>
                <th className="sticky left-0 z-30 bg-gray-100 dark:bg-gray-700 border-r border-b border-gray-200 dark:border-gray-600 w-12 text-center font-semibold rounded-tl-md text-xs text-gray-600 dark:text-gray-300">
                  #
                </th>
                {colMeta.map((col, idx) => (
                  <th
                    key={idx}
                    className={`border-b border-r px-3 py-2 font-semibold text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 text-left truncate text-xs tracking-wide ${idx === colMeta.length - 1 ? 'rounded-tr-md' : ''}`}
                    style={{ minWidth: 140 }}
                    title={`${col.name} (${col.type})`}
                  >
                    <div className="flex items-center gap-2">
                      {showTypeIcons && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="w-6 h-6 flex-shrink-0 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Column data type"
                              tabIndex={-1}
                            >
                              {typeIcon(col.type)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {COLUMN_TYPES.map(t => {
                              return (
                                <DropdownMenuItem
                                  key={t.value}
                                  // make it non-interactive but styleable
                                  onSelect={(e: Event) => e.preventDefault()}
                                  className={`gap-2 cursor-default text-gray-700 dark:text-gray-200 pointer-events-none`}
                                >
                                  {t.icon} {t.label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <span
                        className="truncate"
                        style={{ maxWidth: showTypeIcons ? 'calc(100% - 28px)' : '100%' }}
                      >
                        {col.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {useVirtual && topSpacer > 0 && (
                <tr style={{ height: topSpacer }}>
                  <td colSpan={colMeta.length + 1} />
                </tr>
              )}
              {slice.length === 0 && (
                <tr>
                  <td
                    colSpan={colMeta.length + 1}
                    className="text-center text-sm text-gray-500 dark:text-gray-400 py-8"
                  >
                    No data
                  </td>
                </tr>
              )}
              {slice.map((row, i) => {
                const realIndex = startIndex + i;
                const even = realIndex % 2 === 0;
                const rowBg = striped
                  ? even
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-gray-50 dark:bg-gray-900/40'
                  : 'bg-white dark:bg-gray-800';
                return (
                  <tr
                    key={realIndex}
                    className={`${rowBg} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                    style={useVirtual ? { height: rowHeight } : undefined}
                  >
                    <td
                      className={`sticky left-0 z-10 border-r border-b border-gray-200 dark:border-gray-600 text-center text-gray-500 dark:text-gray-400 px-2 text-xs ${rowBg}`}
                    >
                      {realIndex + 1}
                    </td>
                    {colMeta.map((_, ci) => (
                      <td
                        key={ci}
                        className="border-b border-r border-gray-200 dark:border-gray-600 px-3 py-1.5 align-top text-xs text-gray-700 dark:text-gray-200 truncate"
                        title={row[ci] == null ? '' : String(row[ci])}
                      >
                        {row[ci] == null ? '' : String(row[ci])}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {useVirtual && bottomSpacer > 0 && (
                <tr style={{ height: bottomSpacer }}>
                  <td colSpan={colMeta.length + 1} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {useVirtual && (
          <div className="absolute bottom-1 right-2 text-[10px] text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/70 backdrop-blur px-2 py-0.5 rounded shadow">
            Showing {slice.length} / {totalRows} rows
          </div>
        )}
        <style>{`
        .dataset-viewer-scroll::-webkit-scrollbar {width: 12px;height: 12px;}
        .dataset-viewer-scroll::-webkit-scrollbar-track {background: #f1f5f9;border-radius: 6px;}
        .dataset-viewer-scroll::-webkit-scrollbar-thumb {background: #94a3b8;border-radius: 6px;border: 2px solid #f1f5f9;}
        .dataset-viewer-scroll::-webkit-scrollbar-thumb:hover {background: #64748b;}
        .dataset-viewer-scroll::-webkit-scrollbar-corner {background: #f1f5f9;}
      `}</style>
      </div>
    </div>
  );
};

export default DatasetViewerTable;
