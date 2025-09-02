import React from 'react';
import { numberToExcelColumn } from '@/utils/excelUtils';

interface ExcelColumnHeaderProps {
  columnIndex: number;
  isSelected?: boolean;
  onSelect?: (columnIndex: number) => void;
  isDarkMode?: boolean;
}

export const ExcelColumnHeader: React.FC<ExcelColumnHeaderProps> = ({
  columnIndex,
  isSelected = false,
  onSelect,
  isDarkMode = false
}) => {
  const excelColumnName = numberToExcelColumn(columnIndex);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(columnIndex);
  };

  return (
    <div
      className={`
        flex items-center justify-center h-8 px-2 border-r border-b cursor-pointer select-none
        transition-colors duration-200 font-bold text-sm
        ${isSelected 
          ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300' 
          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
        }
        ${isDarkMode 
          ? 'border-gray-600 text-gray-200' 
          : 'border-gray-300 text-gray-700'
        }
      `}
      onClick={handleClick}
      title={`Column ${excelColumnName}`}
    >
      {excelColumnName}
    </div>
  );
};

export default ExcelColumnHeader;
