import React, { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FileText, FileDigit, Calendar, Sparkles, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DatasetColumnType } from '@/types/chart';

export interface Column {
  id: string;
  name: string;
  type: DatasetColumnType;
  dateFormat?: string;
}

interface ColumnPaletteProps {
  columns: Column[];
}

const getColumnIcon = (type: DatasetColumnType) => {
  switch (type) {
    case 'number':
      return <FileDigit className="w-4 h-4" />;
    case 'date':
      return <Calendar className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getColumnColor = () =>
  'bg-[#1f2a39] text-gray-100 border border-gray-500/40 dark:bg-gray-800 dark:border-gray-600';

const ColumnChipBase: React.FC<{ column: Column; className?: string }> = ({
  column,
  className,
}) => (
  <div
    className={cn(
      `flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed transition-all duration-200 flex-shrink-0 relative
       ${getColumnColor()}
       hover:shadow-lg hover:border-solid hover:-translate-y-0.5`,
      className
    )}
  >
    <GripVertical className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
    {getColumnIcon(column.type)}
    <span className="text-xs font-medium truncate max-w-[8rem]">{column.name}</span>
  </div>
);

const ColumnChip: React.FC<{ column: Column }> = ({ column }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `column-${column.id}`,
    data: { type: 'column', column },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'touch-none cursor-grab active:cursor-grabbing',
        isDragging ? 'opacity-0 invisible' : 'opacity-100 visible'
      )}
    >
      <ColumnChipBase column={column} />
    </div>
  );
};

export const ColumnChipOverlay: React.FC<{
  column: Column;
  accent?: 'filter' | 'sort' | 'aggregation' | 'groupby' | 'metric' | null;
}> = ({ column, accent = null }) => {
  const accentClasses =
    accent === 'filter'
      ? 'ring-2 ring-blue-400/80'
      : accent === 'sort'
        ? 'ring-2 ring-emerald-400/80'
        : accent === 'aggregation'
          ? 'ring-2 ring-amber-400/80'
          : accent === 'groupby'
            ? 'ring-2 ring-indigo-400/80'
            : accent === 'metric'
              ? 'ring-2 ring-purple-400/80'
              : 'shadow-md shadow-black/25';

  return (
    <ColumnChipBase
      column={column}
      className={cn(
        'cursor-grabbing bg-[#1f2a39] text-gray-100 !border-0 shadow-none',
        accentClasses
      )}
    />
  );
};

const ColumnPalette: React.FC<ColumnPaletteProps> = ({ columns }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) {
      return columns;
    }
    const query = searchQuery.toLowerCase().trim();
    return columns.filter(column => column.name.toLowerCase().includes(query));
  }, [columns, searchQuery]);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
        <Sparkles className="w-3 h-3" />
        Available Columns - Drag to operations below
      </h4>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search columns..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 max-h-[230px] overflow-y-auto preview-scrollbar relative pt-1 pl-1 pr-1">
        <style>{`
          .preview-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .preview-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 4px;
          }
          .preview-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(79, 70, 229, 0.45), rgba(99, 102, 241, 0.65));
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.12);
          }
          .preview-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(79, 70, 229, 0.65), rgba(99, 102, 241, 0.85));
          }
          .dark .preview-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(75, 85, 99, 0.5), rgba(75, 85, 99, 0.7));
            border: 1px solid rgba(0, 0, 0, 0.2);
          }
          .dark .preview-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(75, 85, 99, 0.7), rgba(75, 85, 99, 0.9));
          }
          .preview-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.6) transparent;
          }
          .dark .preview-scrollbar {
            scrollbar-color: rgba(75, 85, 99, 0.7) transparent;
          }
        `}</style>
        {filteredColumns.map(column => (
          <ColumnChip key={column.id} column={column} />
        ))}
        {filteredColumns.length === 0 && (
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-4 w-full">
            {searchQuery ? `No columns found matching "${searchQuery}"` : 'No columns available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnPalette;
