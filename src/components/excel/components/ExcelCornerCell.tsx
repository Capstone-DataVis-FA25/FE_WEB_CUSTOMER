import React from 'react';

interface ExcelCornerCellProps {
  onSelectAll?: () => void;
  isDarkMode?: boolean;
}

export const ExcelCornerCell: React.FC<ExcelCornerCellProps> = ({
  onSelectAll,
  isDarkMode = false
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectAll?.();
  };

  return (
    <div
      className={`
        w-12 h-10 border-r border-b cursor-pointer select-none
        flex items-center justify-center
        transition-colors duration-200
        ${isDarkMode 
          ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' 
          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
        }
      `}
      onClick={handleClick}
      title="Select All"
    >
      <div 
        className={`
          w-3 h-3 border-2 
          ${isDarkMode ? 'border-gray-400' : 'border-gray-500'}
        `}
      />
    </div>
  );
};

export default ExcelCornerCell;
