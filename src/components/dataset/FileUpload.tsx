import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  isValidFileType: (file: File) => boolean;
  isProcessing: boolean;
}

function FileUpload({
  onFileSelect,
  onFileRemove: _onFileRemove,
  selectedFile: _selectedFile,
  isProcessing,
}: FileUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
          <Upload className="w-6 h-6 text-blue-600" />
          {t('dataset_fileUploadTitle')}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {t('dataset_fileUploadDescription')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {isProcessing ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* File Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
                ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.txt,.json,.tsv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {isDragOver ? t('dataset_dropFileHere') : t('dataset_clickToUpload')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('dataset_supportedFormats')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t('dataset_maxFileSize')}
                  </p>
                </div>
              </div>
            </div>

            {/* File Format Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {t('dataset_supportedFileFormatsTitle')}
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>
                      • <strong>{t('dataset_excelFiles')}:</strong> {t('dataset_excelFormats')}
                    </li>
                    <li>
                      • <strong>{t('dataset_csvFiles')}:</strong> {t('dataset_csvFormats')}
                    </li>
                    <li>
                      • <strong>{t('dataset_textFiles')}:</strong> {t('dataset_textFormats')}
                    </li>
                    <li>
                      • <strong>{t('dataset_jsonFiles')}:</strong> {t('dataset_jsonFormats')}
                    </li>
                    <li>
                      • <strong>{t('dataset_fileSize')}:</strong> {t('dataset_maxFileSizeDetail')}
                    </li>
                    <li>
                      • <strong>{t('dataset_dataStructure')}:</strong>{' '}
                      {t('dataset_dataStructureDetail')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default FileUpload;
