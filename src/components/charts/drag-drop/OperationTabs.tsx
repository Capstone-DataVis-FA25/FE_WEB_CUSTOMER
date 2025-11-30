import React from 'react';
import { Filter, ArrowUpDown, Layers, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OperationTab = 'filter' | 'sort' | 'aggregation' | 'pivot';

interface OperationTabsProps {
  activeTab: OperationTab;
  onTabChange: (tab: OperationTab) => void;
  disabledTabs?: OperationTab[];
}

const OperationTabs: React.FC<OperationTabsProps> = ({
  activeTab,
  onTabChange,
  disabledTabs = [],
}) => {
  const tabs = [
    { id: 'filter' as OperationTab, label: 'Filter', icon: Filter, color: 'blue' },
    { id: 'sort' as OperationTab, label: 'Sort', icon: ArrowUpDown, color: 'green' },
    // { id: 'aggregation' as OperationTab, label: 'Aggregation', icon: Layers, color: 'purple' }, // Hidden - pivot handles everything
    { id: 'pivot' as OperationTab, label: 'Pivot Table', icon: Table2, color: 'amber' },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const classes = {
      blue: isActive
        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
      green: isActive
        ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
        : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400',
      purple: isActive
        ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
        : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400',
      amber: isActive
        ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
        : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400',
    };
    return classes[color as keyof typeof classes] || classes.blue;
  };

  return (
    <div className="relative border-b border-gray-200 dark:border-gray-700">
      <div className="flex gap-2 overflow-x-auto horizontal-tabs-scrollbar">
        <style>{`
          .horizontal-tabs-scrollbar::-webkit-scrollbar {
            height: 4px;
          }
          .horizontal-tabs-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 2px;
          }
          .horizontal-tabs-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(90deg, rgba(156, 163, 175, 0.3), rgba(156, 163, 175, 0.5));
            border-radius: 2px;
          }
          .horizontal-tabs-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(90deg, rgba(156, 163, 175, 0.5), rgba(156, 163, 175, 0.7));
          }
          .dark .horizontal-tabs-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(90deg, rgba(75, 85, 99, 0.4), rgba(75, 85, 99, 0.6));
          }
          .dark .horizontal-tabs-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(90deg, rgba(75, 85, 99, 0.6), rgba(75, 85, 99, 0.8));
          }
          .horizontal-tabs-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
          }
          .dark .horizontal-tabs-scrollbar {
            scrollbar-color: rgba(75, 85, 99, 0.6) transparent;
          }
        `}</style>
        {tabs.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeTab === id;
          const isDisabled = disabledTabs.includes(id);
          return (
            <button
              key={id}
              onClick={() => !isDisabled && onTabChange(id)}
              disabled={isDisabled}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 flex-1',
                isDisabled
                  ? 'opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
                  : 'cursor-pointer',
                !isDisabled && getColorClasses(color, isActive)
              )}
              title={
                isDisabled
                  ? id === 'aggregation'
                    ? 'Pivot Table is active. Clear pivot to use aggregation.'
                    : id === 'pivot'
                      ? 'Aggregation is active. Clear aggregation to use pivot table.'
                      : 'This tab is disabled'
                  : undefined
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OperationTabs;
