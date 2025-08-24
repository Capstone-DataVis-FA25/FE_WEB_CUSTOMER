import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeIn, SlideInUp } from '@/theme/animation';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToastContext } from '@/components/providers/ToastProvider';

function CreateDatasetPage() {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Validate file type (Excel or CSV)
  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv', // .csv
    ];
    const validExtensions = ['.xls', '.xlsx', '.csv'];

    return (
      validTypes.includes(file.type) ||
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );
  };

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

    setSelectedFile(file);
    showSuccess(
      t('dataset_fileSelected'),
      t('dataset_fileSelectedMessage', { fileName: file.name })
    );
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

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showWarning(t('dataset_noFileSelected'), t('dataset_noFileSelectedMessage'));
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload process (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      showSuccess(
        t('dataset_uploadSuccessful'),
        t('dataset_uploadSuccessfulMessage', { fileName: selectedFile.name })
      );

      // Reset form
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (_error) {
      showError(t('dataset_uploadFailed'), t('dataset_uploadFailedMessage'));
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <FadeIn className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-2xl shadow-2xl mb-6">
            <FileSpreadsheet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t('dataset_createTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('dataset_createSubtitle')}
          </p>
        </FadeIn>

        <SlideInUp delay={0.2}>
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
                  accept=".xlsx,.xls,.csv"
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

              {/* Selected File Display */}
              {selectedFile && (
                <SlideInUp>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatFileSize(selectedFile.size)} •{' '}
                            {selectedFile.type || t('dataset_unknownType')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </SlideInUp>
              )}

              {/* Upload Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {t('dataset_creatingDataset')}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {t('dataset_createDatasetButton')}
                    </>
                  )}
                </Button>
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
            </CardContent>
          </Card>
        </SlideInUp>
      </div>
    </div>
  );
}

export default CreateDatasetPage;
