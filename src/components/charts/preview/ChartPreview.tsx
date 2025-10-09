import React from 'react';
import ChartIcon from '../icons/ChartIcon';

export interface ChartPreviewProps {
  type: string;
  className?: string;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({ type, className = '' }) => {
  return (
    <div
      className={`w-full h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center ${className}`}
    >
      <ChartIcon type={type} className="text-gray-600 dark:text-gray-300 p-2" size={350} />
    </div>
  );
};

export default ChartPreview;
