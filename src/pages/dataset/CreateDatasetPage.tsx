import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FadeIn, SlideInUp } from '@/theme/animation';
import { FileSpreadsheet, FileUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToastContext } from '@/components/providers/ToastProvider';
import FileUpload from '@/components/dataset/FileUpload';
import DataViewer from '@/components/dataset/DataViewer';
import TextUpload from '@/components/dataset/TextUpload';
import {
  processFileContent,
  isReadableTextFile,
  validateFileSize,
  isValidFileType,
  MAX_FILE_SIZE,
  type ParsedContent,
} from '@/utils/fileProcessors';
import { axiosPrivate } from '@/services/axios';

type ViewMode = 'upload' | 'textUpload' | 'view';

function CreateDatasetPage() {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToastContext();

  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [parsedData, setParsedData] = useState<ParsedContent | null>(null);
  const [_textContent, setTextContent] = useState<string>('');

  // Process file content and switch to view mode
  const processAndViewFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const result = await processFileContent(file);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setParsedData(result);
        setViewMode('view');
      } catch (error) {
        showError(
          t('dataset_fileReadError'),
          error instanceof Error ? error.message : t('dataset_fileReadErrorMessage')
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [showError, t]
  );

  // Handle file selection and validation
  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file size
      if (!validateFileSize(file, MAX_FILE_SIZE)) {
        showError(t('dataset_fileTooLarge'), t('dataset_fileTooLargeMessage'));
        return;
      }

      setSelectedFile(file);
      // If file is readable, automatically process it and switch to view mode
      if (isReadableTextFile(file)) {
        await processAndViewFile(file);
      }
    },
    [showError, t, processAndViewFile]
  );

  // Handle file removal
  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setParsedData(null);
    setViewMode('upload');
  }, []);

  // Handle file upload (create dataset)
  const handleFileUpload = useCallback(async (name: string) => {
    if (!parsedData) {
      showWarning('No Data Available', 'Please select a file or enter text data first');
      return;
    }

    if (!name.trim()) {
      showWarning('Dataset Name Required', 'Please enter a name for your dataset');
      return;
    }

    setIsUploading(true);

    try {
      // Prepare the data to send
      const requestBody = {
        name: name.trim(),
        data: parsedData.tabularData || [],
      };

      // Send POST request to create dataset using axios
      const response = await axiosPrivate.post('/datasets', requestBody);

      showSuccess('Dataset Created Successfully', 'Your dataset has been created and saved');

      // Reset state after successful upload
      setSelectedFile(null);
      setParsedData(null);
      setViewMode('upload');
    } catch (error) {
      showError(
        'Upload Failed',
        error instanceof Error ? error.message : 'Failed to create dataset'
      );
    } finally {
      setIsUploading(false);
    }
  }, [parsedData, showWarning, showSuccess, showError]);

  // Handle change data (go back to upload and clear file)
  const handleChangeData = useCallback(() => {
    setSelectedFile(null);
    setParsedData(null);
    setTextContent('');
    setViewMode('upload');
  }, []);

  // Handle text processing
  const handleTextProcess = useCallback((content: string) => {
    setTextContent(content);
    const parsedContent: ParsedContent = {
      content,
    };
    setParsedData(parsedContent);
    setViewMode('view');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {isProcessing ? (
        <LoadingSpinner />
      ) : viewMode === 'view' ? (
        // Data Viewer - Full Screen
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SlideInUp delay={0.2}>
            <DataViewer
              parsedData={parsedData}
              isUploading={isUploading}
              onUpload={handleFileUpload}
              onChangeData={handleChangeData}
            />
          </SlideInUp>
        </div>
      ) : (
        // Upload Modes - With Sidebar
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6 items-start">
            {/* Left Navigation Component */}
            <FadeIn>
              <div className="flex flex-col space-y-4 w-72">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    Upload Method
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-12 text-left ${
                        viewMode === 'upload'
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => setViewMode('upload')}
                    >
                      <FileUp className="h-5 w-5" />
                      <span>Upload your data</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-12 text-left ${
                        viewMode === 'textUpload'
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => setViewMode('textUpload')}
                    >
                      <FileText className="h-5 w-5" />
                      <span>Paste your data</span>
                    </Button>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Main Content */}
            <div className="flex-1">
              {viewMode === 'upload' ? (
                <SlideInUp key="file-upload" delay={0.2}>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    selectedFile={selectedFile}
                    isValidFileType={isValidFileType}
                    isProcessing={false}
                  />
                </SlideInUp>
              ) : (
                <SlideInUp key="text-upload" delay={0.2}>
                  <TextUpload onTextProcess={handleTextProcess} isProcessing={false} />
                </SlideInUp>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateDatasetPage;
