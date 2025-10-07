import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';

interface DatasetViewerTableProps {
  columns: string[];
  rows: (string | number | null)[][]; // body rows only
  columnTypes?: ('text' | 'number' | 'date')[]; // type for each column
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
}

/**
 * Lightweight read‑only dataset viewer (no context, no editing).
 * - Sticky header
 * - Optional simple virtualization for large datasets
 */
const DatasetViewerTable: React.FC<DatasetViewerTableProps> = ({
  columns,
  rows,
  columnTypes,
  height = '60vh',
  className = '',
  rowHeight = 36,
  overscan = 8,
  disableVirtualization,
  striped = true,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const totalRows = rows.length;
  const useVirtual = !disableVirtualization && totalRows > 400; // heuristic

  // Type badge helper
  const getTypeBadge = (type: 'text' | 'number' | 'date') => {
    const badges = {
      text: {
        label: 'Text',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      },
      number: {
        label: 'Num',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      },
      date: {
        label: 'Date',
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      },
    };
    const badge = badges[type];
    return (
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

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

  return (
    <div
      className={`border rounded-md bg-white dark:bg-gray-800 relative overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        ref={scrollRef}
        className="w-full h-full overflow-auto"
        onScroll={onScroll}
        style={{ scrollbarWidth: 'auto', scrollbarColor: '#94a3b8 #f1f5f9' }}
      >
        <table className="text-sm border-collapse min-w-full" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-20 select-none">
            <tr>
              <th className="sticky left-0 z-30 bg-gray-100 dark:bg-gray-700 border-r border-b border-gray-300 dark:border-gray-600 w-12 text-center font-semibold">
                #
              </th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="border-b border-r p-2 font-semibold text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 text-left"
                  style={{ minWidth: 120 }}
                  title={`${col} (${columnTypes?.[idx] || 'text'})`}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate flex-1">{col}</span>
                    {columnTypes && columnTypes[idx] && getTypeBadge(columnTypes[idx])}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {useVirtual && topSpacer > 0 && (
              <tr style={{ height: topSpacer }}>
                <td colSpan={columns.length + 1} />
              </tr>
            )}
            {slice.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
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
                  : 'bg-gray-50 dark:bg-gray-900/50'
                : 'bg-white dark:bg-gray-800';
              return (
                <tr
                  key={realIndex}
                  className={`${rowBg} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                  style={useVirtual ? { height: rowHeight } : undefined}
                >
                  <td
                    className={`sticky left-0 z-10 border-r border-b border-gray-300 dark:border-gray-600 text-center text-gray-600 dark:text-gray-300 px-2 text-xs ${rowBg}`}
                  >
                    {realIndex + 1}
                  </td>
                  {columns.map((_, ci) => (
                    <td
                      key={ci}
                      className="border-b border-r border-gray-200 dark:border-gray-600 px-2 py-1 align-top text-xs text-gray-700 dark:text-gray-200 truncate"
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
                <td colSpan={columns.length + 1} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {useVirtual && (
        <div className="absolute bottom-1 right-2 text-[10px] text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 px-2 py-0.5 rounded shadow">
          Showing {slice.length} / {totalRows} rows
        </div>
      )}
      <style>{`
        div::-webkit-scrollbar {width: 12px;height: 12px;}
        div::-webkit-scrollbar-track {background: #f1f5f9;border-radius: 6px;}
        div::-webkit-scrollbar-thumb {background: #94a3b8;border-radius: 6px;border: 2px solid #f1f5f9;}
        div::-webkit-scrollbar-thumb:hover {background: #64748b;}
        div::-webkit-scrollbar-corner {background: #f1f5f9;}
      `}</style>
    </div>
  );
};

export default DatasetViewerTable;
