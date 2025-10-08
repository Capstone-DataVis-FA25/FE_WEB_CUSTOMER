import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { FileText, FileDigit, Calendar, X as Close } from 'lucide-react';

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
  if (type === 'number') return <FileDigit size={14} />;
  if (type === 'date') return <Calendar size={14} />; // Different icon for date
  return <FileText size={14} />; // text
};

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

  const [legendOpen, setLegendOpen] = useState(false);
  const legendRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [legendPos, setLegendPos] = useState<{ top: number; left: number }>({ top: 12, left: 12 });

  // Close on outside click
  useEffect(() => {
    if (!legendOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (legendRef.current && !legendRef.current.contains(e.target as Node)) {
        setLegendOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [legendOpen]);

  // Reposition if container resizes while open
  useEffect(() => {
    if (!legendOpen) return; // simple responsive safeguard
    const handleResize = () => {
      if (!legendRef.current) return;
      const w = legendRef.current.offsetWidth;
      const contW = containerRef.current?.offsetWidth || 0;
      setLegendPos(p => ({
        top: p.top,
        left: Math.min(p.left, Math.max(8, contW - w - 8)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [legendOpen]);

  return (
    <div
      className={`w-full max-w-full p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg ${className}`}
      style={{ height }}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full rounded-md bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Legend Popover (anchored to clicked icon) */}
        {legendOpen && (
          <div
            ref={legendRef}
            style={{ top: legendPos.top, left: legendPos.left, maxWidth: 240 }}
            className="absolute z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-xl p-3 w-56 text-xs space-y-2"
          >
            <div className="flex items-center justify-between font-semibold text-gray-700 dark:text-gray-200">
              <span>Data Type Legend</span>
              <button
                onClick={() => setLegendOpen(false)}
                aria-label="Close legend"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Close size={14} />
              </button>
            </div>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <FileText size={14} />
                </span>
                Text (string)
              </li>
              <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <FileDigit size={14} />
                </span>
                Number (integer)
              </li>
              <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <Calendar size={14} />
                </span>
                Date (YYYY-MM-DD)
              </li>
            </ul>
          </div>
        )}
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
                        <button
                          type="button"
                          onClick={e => {
                            const btn = e.currentTarget.getBoundingClientRect();
                            const cont = containerRef.current?.getBoundingClientRect();
                            if (cont) {
                              const top = btn.bottom - cont.top + 6; // below icon
                              const left = btn.left - cont.left; // align left edges
                              setLegendPos({ top, left });
                            }
                            setLegendOpen(o => !o);
                          }}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${legendOpen ? 'bg-blue-100 dark:bg-blue-600/40 ring-1 ring-blue-400' : 'bg-gray-200 dark:bg-gray-600 hover:ring-1 ring-blue-400'}`}
                          title="Click to view data type legend"
                          aria-pressed={legendOpen}
                        >
                          {typeIcon(col.type)}
                        </button>
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
