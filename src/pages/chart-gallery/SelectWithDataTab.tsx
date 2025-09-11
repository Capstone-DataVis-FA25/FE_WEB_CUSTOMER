import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Database, Play } from 'lucide-react';
import { useToastContext } from '@/components/providers/ToastProvider';

export default function SelectWithDataTab() {
  const { t } = useTranslation();
  const { showSuccess } = useToastContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate loading
    setIsLoading(false);
  }, []);

  const handleFileUpload = () => {
    showSuccess(t('chart_gallery_file_upload_success'));
  };

  const handleSampleData = () => {
    showSuccess(t('chart_gallery_sample_data_loaded'));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Coming Soon Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-4">
            <span>🚧</span>
            <span>{t('chart_gallery_beta_feature')}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('chart_gallery_start_with_data')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{t('chart_gallery_data_description')}</p>
        </div>

        {/* Upload Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Upload File */}
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('chart_gallery_upload_file')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                {t('chart_gallery_upload_description')}
              </p>
              <Button onClick={handleFileUpload} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {t('chart_gallery_choose_file')}
              </Button>
            </div>
          </Card>

          {/* Sample Data */}
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('chart_gallery_sample_data')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                {t('chart_gallery_sample_description')}
              </p>
              <Button onClick={handleSampleData} variant="outline" className="w-full">
                <Database className="w-4 h-4 mr-2" />
                {t('chart_gallery_load_sample')}
              </Button>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('chart_gallery_coming_soon')}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {t('chart_gallery_auto_detect')}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  {t('chart_gallery_auto_detect_desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {t('chart_gallery_ai_suggestions')}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  {t(
                    'chart_gallery_ai_suggestions_desc',
                    'Get intelligent chart type recommendations'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {t('chart_gallery_data_preview')}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  {t('chart_gallery_data_preview_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t(
              'chart_gallery_beta_notice',
              'This feature is currently in development. Try our template gallery for now!'
            )}
          </p>
          <Button variant="outline">
            {t('chart_gallery_notify_when_ready', 'Notify When Ready')}
          </Button>
        </div>
      </div>
    </div>
  );
}
