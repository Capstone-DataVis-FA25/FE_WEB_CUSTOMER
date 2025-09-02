import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { numberToExcelColumn } from '@/utils/excelUtils';


interface ExcelHeaderProps {
  columnIndex: number;
  originalName?: string;  // Tên column gốc
  isSelected?: boolean;
  onSelect?: (columnIndex: number) => void;
  onRename?: (columnIndex: number) => void;
  onResize?: (columnIndex: number, width: number) => void;
  isDarkMode?: boolean;
}

export const ExcelHeader: React.FC<ExcelHeaderProps> = ({
  columnIndex,
  originalName,
  isSelected = false,
  onSelect,
  onRename,
  onResize,
  isDarkMode = false
}) => {
  const excelColumnName = numberToExcelColumn(columnIndex);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(columnIndex);
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRename?.(columnIndex);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Context menu will be handled by parent component
  };

  return (
    <div
      className={`
        relative flex items-center justify-between h-full px-2 border-r border-b cursor-pointer select-none
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
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      title={`Column ${excelColumnName}${originalName ? ` - ${originalName}` : ''}`}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <div className="text-xs font-bold text-center text-blue-600 dark:text-blue-400">
          {excelColumnName}
        </div>
        {originalName && (
          <div className="text-xs font-medium text-center truncate max-w-full px-1">
            {originalName}
          </div>
        )}
      </div>
      
      {isSelected && (
        <div className="flex items-center">
          <MoreHorizontal 
            size={14} 
            className={`
              ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              hover:${isDarkMode ? 'text-gray-100' : 'text-gray-800'}
            `} 
          />
        </div>
      )}
      
      {/* Resize handle */}
      <div
        className={`
          absolute right-0 top-0 bottom-0 w-1 cursor-col-resize
          ${isDarkMode ? 'hover:bg-blue-500' : 'hover:bg-blue-400'}
          opacity-0 hover:opacity-100 transition-opacity
        `}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const startX = e.clientX;
          const startWidth = e.currentTarget.parentElement?.offsetWidth || 100;
          
          const handleMouseMove = (moveE: MouseEvent) => {
            const newWidth = Math.max(50, startWidth + (moveE.clientX - startX));
            onResize?.(columnIndex, newWidth);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
    </div>
  );
};

export default ExcelHeader;
