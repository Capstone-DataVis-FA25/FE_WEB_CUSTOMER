import React from 'react';
import { FileSpreadsheet, FileUp, FileText, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/theme/animation';

type ViewMode = 'upload' | 'textUpload' | 'sampleData' | 'view';

interface UploadMethodNavigationProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const UploadMethodNavigation: React.FC<UploadMethodNavigationProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  const navigationItems = [
    {
      mode: 'upload' as ViewMode,
      icon: FileUp,
      label: 'Upload your data',
    },
    {
      mode: 'textUpload' as ViewMode,
      icon: FileText,
      label: 'Paste your data',
    },
    {
      mode: 'sampleData' as ViewMode,
      icon: Database,
      label: 'Try sample data',
    },
  ];

  return (
    <FadeIn>
      <div className="flex flex-col space-y-4 w-72">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            Upload Method
          </h3>
          <div className="space-y-3">
            {navigationItems.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant="ghost"
                className={`w-full justify-start gap-3 h-12 text-left ${
                  viewMode === mode
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => onViewModeChange(mode)}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default UploadMethodNavigation;
