import React from 'react';
import { MoreVertical } from 'lucide-react';

interface ExcelRowHeaderProps {
  rowIndex: number;
  isSelected?: boolean;
  onSelect?: (rowIndex: number) => void;
  onInsert?: (rowIndex: number) => void;
  onDelete?: (rowIndex: number) => void;
  isDarkMode?: boolean;
}

export const ExcelRowHeader: React.FC<ExcelRowHeaderProps> = ({
  rowIndex,
  isSelected = false,
  onSelect,
  onInsert,
  onDelete,
  isDarkMode = false
}) => {
  const rowNumber = rowIndex + 1; // Display 1-based row numbers
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(rowIndex);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Context menu will be handled by parent component
  };

  return (
    <div
      className={`
        relative flex items-center justify-center w-12 h-full border-r border-b cursor-pointer select-none
        transition-colors duration-200
        ${isSelected 
          ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-600' 
          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        ${isDarkMode 
          ? 'border-gray-600 text-gray-200' 
          : 'border-gray-300 text-gray-700'
        }
      `}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={`Row ${rowNumber}`}
    >
      <div className="text-center font-medium text-sm">
        {rowNumber}
      </div>
      
      {isSelected && (
        <div className="absolute right-1">
          <MoreVertical 
            size={12} 
            className={`
              ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              hover:${isDarkMode ? 'text-gray-100' : 'text-gray-800'}
            `} 
          />
        </div>
      )}
    </div>
  );
};

export default ExcelRowHeader;
