import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ErrorPanelProps {
  title: string;
  subtitle?: string;
  bordered?: boolean;
}

const ErrorPanel: React.FC<ErrorPanelProps> = ({ title, subtitle, bordered = false }) => {
  return (
    <div
      className={`flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg ${
        bordered ? 'border-2 border-dashed border-gray-300 dark:border-gray-600' : ''
      }`}
    >
      <div className="text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-2">{title}</p>
        {subtitle && <p className="text-sm text-gray-400 dark:text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
};

export default ErrorPanel;
