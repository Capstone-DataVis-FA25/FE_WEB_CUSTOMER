import React from 'react';
import { FileSpreadsheet, FileUp, FileText, Database, Sparkles, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from 'i18next';

type ViewMode = 'upload' | 'textUpload' | 'sampleData' | 'view' | 'cleanDataset';

interface UploadMethodNavigationProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onStartTour?: () => void;
}

const UploadMethodNavigation: React.FC<UploadMethodNavigationProps> = ({
  viewMode,
  onViewModeChange,
  onStartTour,
}) => {
  const navigationItems = [
    {
      mode: 'upload' as ViewMode,
      icon: FileUp,
      label: t('upload_method_upload'),
      id: 'nav-btn-upload',
    },
    {
      mode: 'textUpload' as ViewMode,
      icon: FileText,
      label: t('upload_method_paste'),
      id: 'nav-btn-textUpload',
    },
    {
      mode: 'sampleData' as ViewMode,
      icon: Database,
      label: t('upload_method_sampleData'),
      id: 'nav-btn-sampleData',
    },
    {
      mode: 'cleanDataset' as ViewMode,
      icon: Sparkles,
      label: t('upload_method_cleanDataset'),
      id: 'nav-btn-cleanDataset',
    },
  ];

  return (
    <div id="upload-method-nav" className="flex flex-col space-y-4 w-72">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
          {t('upload_method')}
        </h3>
        <div className="space-y-3">
          {navigationItems.map(({ mode, icon: Icon, label, id }) => (
            <Button
              key={mode}
              id={id}
              variant="ghost"
              className={`w-full justify-start gap-3 h-12 text-left focus-visible:ring-0 focus-visible:ring-offset-0 ${
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

        {onStartTour && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={onStartTour}
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-left border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            >
              <HelpCircle className="h-5 w-5" />
              <span>{t('chart_list_start_tour')}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMethodNavigation;
