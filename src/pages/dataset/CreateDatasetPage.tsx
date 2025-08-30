import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SlideInUp } from '@/theme/animation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToastContext } from '@/components/providers/ToastProvider';
import FileUpload from '@/components/dataset/FileUpload';
import DataViewer from '@/components/dataset/DataViewer';
import TextUpload from '@/components/dataset/TextUpload';
import UploadMethodNavigation from '@/components/dataset/UploadMethodNavigation';
import {
  processFileContent,
  isReadableTextFile,
  validateFileSize,
  isValidFileType,
  MAX_FILE_SIZE,
} from '@/utils/fileProcessors';
import type Papa from 'papaparse';
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
  const [parsedData, setParsedData] = useState<Papa.ParseResult<string[]> | null>(null);
  const [_textContent, setTextContent] = useState<string>('');

  // Process file content and switch to view mode
  const processAndViewFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const result = await processFileContent(file);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setParsedData(result);
        console.log(result);
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
  const handleFileUpload = useCallback(
    async (name: string) => {
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
          data: parsedData.data || [],
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
    },
    [parsedData, showWarning, showSuccess, showError]
  );

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
              data={parsedData?.data || null}
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
            <UploadMethodNavigation viewMode={viewMode} onViewModeChange={setViewMode} />

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
