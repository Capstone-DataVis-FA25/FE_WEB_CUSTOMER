import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SlideInUp } from '@/theme/animation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToastContext } from '@/components/providers/ToastProvider';
import FileUpload from '@/components/dataset/FileUpload';
import DataViewer from '@/components/dataset/DataViewer';
import TextUpload from '@/components/dataset/TextUpload';
import UploadMethodNavigation from '@/components/dataset/UploadMethodNavigation';
import { DatasetUploadProvider, useDatasetUpload } from '@/contexts/DatasetUploadContext';
import {
  processFileContent,
  parseTabularContent,
  validateFileSize,
  isValidFileType,
  MAX_FILE_SIZE,
} from '@/utils/fileProcessors';
import type Papa from 'papaparse';
import { axiosPrivate } from '@/services/axios';

type ViewMode = 'upload' | 'textUpload' | 'view';

// Inner component that uses the context
function CreateDatasetPageContent() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToastContext();

  // Get states from context
  const {
    originalTextContent,
    setOriginalTextContent,
    parsedData,
    setParsedData,
    isUploading,
    setIsUploading,
  } = useDatasetUpload();

  // Local state management (non-shareable states)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [numberFormat, setNumberFormat] = useState({ thousands: ',', decimal: '.' });

  // Process file content and switch to view mode
  const processAndViewFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        // Read the original text content first
        const textContent = await file.text();
        setOriginalTextContent(textContent);

        // Then process it
        const result = await processFileContent(file);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setParsedData(result);
        console.log(result);
        setViewMode('view');
      } catch (error) {
        console.error('File processing error:', error);
        showError(
          t('dataset_fileReadError', 'File Processing Error'),
          error instanceof Error 
            ? error.message 
            : t('dataset_fileReadErrorMessage', 'Unable to read the selected file. Please check the file format.')
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
        showError(
          t('dataset_fileTooLarge', 'File Too Large'), 
          t('dataset_fileTooLargeMessage', `File size exceeds the maximum limit of ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`)
        );
        return;
      }

      // Validate file type
      if (!isValidFileType(file)) {
        showError(
          t('dataset_invalidFileType', 'Invalid File Type'),
          t('dataset_invalidFileTypeMessage', 'Please select a valid file type (CSV, TXT, TSV, JSON)')
        );
        return;
      }

      setSelectedFile(file);
      // Process the valid file and switch to view mode
      await processAndViewFile(file);
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
    async (name: string, description?: string) => {
      if (!parsedData) {
        return;
      }

      if (!name.trim()) {
        return;
      }

      setIsUploading(true);

      try {
        // Prepare the data to send
        const requestBody = {
          name: name.trim(),
          data: parsedData.data || [],
          ...(description && { description: description.trim() }),
        };

        // Send POST request to create dataset using axios
        await axiosPrivate.post('/datasets', requestBody);

        console.log('Dataset creation success');
        showSuccess(
          t('dataset_createSuccess', 'Dataset Created Successfully'),
          t('dataset_createSuccessMessage', 'Your dataset has been created and saved successfully')
        );

        // Reset state after successful upload with delay to show toast
        setTimeout(() => {
          setSelectedFile(null);
          setParsedData(null);
          setOriginalTextContent('');
          setViewMode('upload');
        }, 1500);

      } catch (error: any) {
        console.error('Dataset creation error:', error);
        
        // Check for specific error types
        if (error.response?.status === 409) {
          showError(
            t('dataset_nameExists', 'Dataset Name Already Exists'),
            t('dataset_nameExistsMessage', `A dataset with the name "${name.trim()}" already exists. Please choose a different name.`)
          );
        } else if (error.response?.status === 400) {
          showError(
            t('dataset_validationError', 'Validation Error'),
            error.response?.data?.message || t('dataset_invalidData', 'The data format is invalid')
          );
        } else if (error.response?.status >= 500) {
          showError(
            t('dataset_serverError', 'Server Error'),
            t('dataset_serverErrorMessage', 'Server is temporarily unavailable. Please try again later.')
          );
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          showError(
            t('dataset_networkError', 'Network Error'),
            t('dataset_networkErrorMessage', 'Unable to connect to server. Please check your internet connection.')
          );
        } else {
          showError(
            t('dataset_uploadFailed', 'Upload Failed'),
            error.response?.data?.message || error.message || t('dataset_uploadFailedMessage', 'Failed to create dataset')
          );
        }
      } finally {
        setIsUploading(false);
      }
    },
    [parsedData, showSuccess, showError, t, setOriginalTextContent]
  );

  // Handle change data (go back to upload and clear file)
  const handleChangeData = useCallback(() => {
    setSelectedFile(null);
    setParsedData(null);
    setOriginalTextContent('');
    setViewMode('upload');
  }, []);

  // Handle text processing
  const handleTextProcess = useCallback(
    (content: string) => {
      setOriginalTextContent(content);
      // Parse the text content as CSV data
      try {
        const result = parseTabularContent(
          content,
          new File([content], 'text.csv', { type: 'text/csv' })
        );
        setParsedData(result);
        setViewMode('view');
      } catch (error) {
        console.error('Text parse error:', error);
        showError(
          t('dataset_parseError', 'Parse Error'), 
          t('dataset_parseErrorMessage', 'Failed to parse the text content. Please check your data format.')
        );
      }
    },
    [showError, t]
  );

  // Handle delimiter change - reparse the original content with new delimiter
  const handleDelimiterChange = useCallback(
    (delimiter: string) => {
      if (!originalTextContent) return;

      try {
        const result = parseTabularContent(
          originalTextContent,
          new File([originalTextContent], 'data.csv', { type: 'text/csv' }),
          { delimiter }
        );
        setParsedData(result);
      } catch (error) {
        console.error('Delimiter change error:', error);
        showError(
          t('dataset_parseError', 'Parse Error'), 
          t('dataset_delimiterError', 'Failed to parse with the selected delimiter. Please try a different delimiter.')
        );
      }
    },
    [originalTextContent, showError, t]
  );

  // Handle number format change
  const handleNumberFormatChange = useCallback(
    (thousandsSeparator: string, decimalSeparator: string) => {
      setNumberFormat({ thousands: thousandsSeparator, decimal: decimalSeparator });
      // You can add logic here to reformat numbers in the table if needed
    },
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {isProcessing ? (
        <LoadingSpinner />
      ) : viewMode === 'view' ? (
        // Data Viewer - Full Width
        <div className="py-8">
          <SlideInUp delay={0.2}>
            <DataViewer
              onUpload={handleFileUpload}
              onChangeData={handleChangeData}
              onDelimiterChange={handleDelimiterChange}
              onNumberFormatChange={handleNumberFormatChange}
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

// Main component with provider wrapper
function CreateDatasetPage() {
  return (
    <DatasetUploadProvider>
      <CreateDatasetPageContent />
    </DatasetUploadProvider>
  );
}

export default CreateDatasetPage;
