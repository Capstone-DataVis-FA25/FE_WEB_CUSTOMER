import React from 'react';
import { Database } from 'lucide-react';

interface OperationsBannerProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
}

const OperationsBanner: React.FC<OperationsBannerProps> = ({ title, message, action }) => {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-500 dark:text-gray-400">
          <Database className="w-4 h-4" />
        </div>
        <div className="flex-1">
          {title && (
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</div>
          )}
          <div className="text-gray-600 dark:text-gray-300">{message}</div>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
};

export default OperationsBanner;
