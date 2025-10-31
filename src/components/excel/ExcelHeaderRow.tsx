import React, { memo } from 'react';
import ExcelColumnHeader from './ExcelColumnHeader';
import { useAppSelector } from '@/store/hooks';
import { selectColumns } from '@/features/excelUI';

interface ExcelHeaderRowProps {
  mode: 'edit' | 'view';
  onTypeChange: (columnIndex: number, newType: 'text' | 'number' | 'date') => void;
  allowHeaderEdit?: boolean;
  highlightedColumns?: Set<number>;
  showColumnDeselect?: boolean;
}

const ExcelHeaderRow: React.FC<ExcelHeaderRowProps> = memo(function ExcelHeaderRow({
  mode,
  onTypeChange,
  allowHeaderEdit = true,
  highlightedColumns,
  showColumnDeselect = true,
}) {
  const columns = useAppSelector(selectColumns);

  return (
    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-30 select-none">
      <tr>
        <th className="sticky left-0 z-50 relative bg-gray-100 dark:bg-gray-700 border-r border-b border-gray-300 dark:border-gray-600 w-12 text-center font-semibold">
          #
        </th>
        {columns.map((_, ci) => (
          <ExcelColumnHeader
            key={ci}
            columnIndex={ci}
            mode={mode}
            onTypeChange={onTypeChange}
            allowHeaderEdit={allowHeaderEdit}
            isHighlighted={highlightedColumns?.has(ci)}
            showDeselect={showColumnDeselect}
          />
        ))}
      </tr>
    </thead>
  );
});

export default ExcelHeaderRow;
