import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, AlertCircle } from 'lucide-react';
import { useToastContext } from '@/components/providers/ToastProvider';

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
  isValidFileType,
  isProcessing,
}: FileUploadProps) {
  const { t } = useTranslation();
  const { showError } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Math-inspired spinner component
  const MathSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <div className="relative">
        {/* Outer rotating ring with mathematical symbols */}
        <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin">
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-b-green-500 border-l-orange-500 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '2s' }}
          ></div>
        </div>

        {/* Inner mathematical symbols */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 flex items-center justify-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            ∫
          </div>
        </div>

        {/* Floating mathematical symbols */}
        <div
          className="absolute -top-2 -left-2 w-4 h-4 text-blue-500 animate-bounce"
          style={{ animationDelay: '0s' }}
        >
          π
        </div>
        <div
          className="absolute -top-2 -right-2 w-4 h-4 text-purple-500 animate-bounce"
          style={{ animationDelay: '0.5s' }}
        >
          Σ
        </div>
        <div
          className="absolute -bottom-2 -left-2 w-4 h-4 text-green-500 animate-bounce"
          style={{ animationDelay: '1s' }}
        >
          α
        </div>
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 text-orange-500 animate-bounce"
          style={{ animationDelay: '1.5s' }}
        >
          β
        </div>
      </div>

      {/* Processing text */}
      <div className="ml-6 text-center">
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('dataset_readingFile')}...
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Parsing mathematical structures
        </div>
        <div className="flex justify-center mt-3 space-x-1">
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>
    </div>
  );

  const handleFileSelect = (file: File) => {
    if (!isValidFileType(file)) {
      showError(t('dataset_invalidFileType'), t('dataset_invalidFileTypeMessage'));
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      showError(t('dataset_fileTooLarge'), t('dataset_fileTooLargeMessage'));
      return;
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
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
      handleFileSelect(file);
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
          <MathSpinner />
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
