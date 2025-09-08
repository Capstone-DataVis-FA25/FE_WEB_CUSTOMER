import DataViewer from '@/components/dataset/DataViewer';
import FileUpload from '@/components/dataset/FileUpload';
import SampleDataUpload from '@/components/dataset/SampleDataUpload';
import TextUpload from '@/components/dataset/TextUpload';
import UploadMethodNavigation from '@/components/dataset/UploadMethodNavigation';
import { useToastContext } from '@/components/providers/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DatasetProvider, useDataset } from '@/contexts/DatasetContext';
import { axiosPrivate } from '@/services/axios';
import { SlideInUp } from '@/theme/animation';
import { DATASET_DESCRIPTION_MAX_LENGTH, DATASET_NAME_MAX_LENGTH } from '@/utils/Consts';
import {
  getFileDelimiter,
  detectDelimiter,
  isValidFileType,
  isExcelFile,
  isJsonFormat as checkIsJsonFormat,
  MAX_FILE_SIZE,
  parseJsonDirectly,
  parseTabularContent,
  processFileContent,
  readExcelAsText,
  validateFileSize,
} from '@/utils/fileProcessors';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ViewMode = 'upload' | 'textUpload' | 'sampleData' | 'view';

// Inner component that uses the context
function CreateDatasetPageContent() {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToastContext();

  // Get states from context
  const {
    originalTextContent,
    setOriginalTextContent,
    parsedData,
    setParsedData,
    setOriginalHeaders,
    isJsonFormat,
    setIsJsonFormat,
    setIsUploading,
    setSelectedDelimiter,
    resetState,
    datasetName,
    description,
  } = useDataset();

  // Local state management (non-shareable states)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [previousViewMode, setPreviousViewMode] = useState<ViewMode>('upload');

  // Handle switching between upload methods; clear transient inputs
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      if (mode !== 'view') {
        setOriginalTextContent('');
        setParsedData(null);
        setSelectedFile(null);
      }
      setViewMode(mode);
    },
    [setOriginalTextContent]
  );

  // Process file content and switch to view mode
  const processAndViewFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        // Read the original text content first - handle Excel files differently
        let textContent: string;
        if (isExcelFile(file)) {
          textContent = await readExcelAsText(file);
        } else {
          textContent = await file.text();
        }
        setOriginalTextContent(textContent);

        // Set the detected delimiter for this file
        const detectedDelimiter = getFileDelimiter(file);
        setSelectedDelimiter(detectedDelimiter);

        // Then process it
        const result = await processFileContent(file, { delimiter: detectedDelimiter });
        await new Promise(resolve => setTimeout(resolve, 1000));
        setParsedData(result);
        setOriginalHeaders(result[0] || []);
        console.log(result);
        setPreviousViewMode(viewMode);
        setViewMode('view');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('dataset_fileReadErrorMessage');
        showError(t('dataset_fileReadError'), t(errorMessage));
      } finally {
        setIsProcessing(false);
      }
    },
    [showError, t, viewMode, setSelectedDelimiter]
  );

  // Handle file selection and validation
  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      if (!isValidFileType(file)) {
        showError(
          t('dataset_fileReadError'),
          t('dataset_unsupportedFileType', { fileType: file.type || 'unknown' })
        );
        return;
      }

      // Validate file size
      if (!validateFileSize(file, MAX_FILE_SIZE)) {
        showError(t('dataset_fileTooLarge'), t('dataset_fileTooLargeMessage'));
        return;
      }

      setSelectedFile(file);
      // If file is valid, automatically process it and switch to view mode
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
  const handleFileUpload = useCallback(async () => {
    if (!parsedData) {
      showWarning('No Data Available', 'Please select a file or enter text data first');
      return;
    }

    if (!datasetName.trim()) {
      showWarning('Dataset Name Required', 'Please enter a name for your dataset');
      return;
    }

    if (datasetName.length > DATASET_NAME_MAX_LENGTH) {
      showWarning(
        t('dataset_nameTooLong'),
        t('dataset_nameTooLongMessage', { maxLength: DATASET_NAME_MAX_LENGTH })
      );
      return;
    }

    if (description && description.length > DATASET_DESCRIPTION_MAX_LENGTH) {
      showWarning(
        t('dataset_descriptionTooLong'),
        t('dataset_descriptionTooLongMessage', { maxLength: DATASET_DESCRIPTION_MAX_LENGTH })
      );
      return;
    }

    setIsUploading(true);

    try {
      // Prepare the data to send
      const requestBody = {
        name: datasetName.trim(),
        data: parsedData || [],
        ...(description && { description: description.trim() }),
      };

      // Send POST request to create dataset using axios
      const response = await axiosPrivate.post('/datasets', requestBody);

      showSuccess('Dataset Created Successfully', 'Your dataset has been created and saved');

      // Reset state after successful upload
      setSelectedFile(null);
      setParsedData(null);
      setViewMode('upload');
    } catch (error: any) {
      // Check for unique constraint violation
      if (error.response?.status === 409) {
        showError(
          t('dataset_nameExists'),
          t('dataset_nameExistsMessage', { name: datasetName.trim() })
        );
      } else {
        showError(
          t('dataset_uploadFailed'),
          error.response?.data?.message || error.message || t('dataset_uploadFailedMessage')
        );
      }
    } finally {
      setIsUploading(false);
    }
  }, [parsedData, showWarning, showSuccess, showError]);

  // Handle change data (go back to previous upload method and reset shared state)
  const handleChangeData = useCallback(() => {
    const prevText = originalTextContent;
    // Reset all shared dataset state back to initial
    resetState();
    // Clear local file selection
    setSelectedFile(null);

    // Restore user text only if returning to text upload
    if (previousViewMode === 'textUpload') {
      setOriginalTextContent(prevText);
    }

    setViewMode(previousViewMode);
  }, [originalTextContent, previousViewMode, resetState, setOriginalTextContent]);

  // Handle text processing
  const handleTextProcess = useCallback(
    (content: string) => {
      setOriginalTextContent(content);

      try {
        // Check if content is JSON format first
        const isJson = checkIsJsonFormat(content);
        setIsJsonFormat(isJson);

        if (isJson) {
          // Parse JSON directly - no delimiter needed
          const result = parseJsonDirectly(content);
          setSelectedDelimiter(','); // Set a default delimiter for display purposes
          setParsedData(result);
          setOriginalHeaders(result[0] || []);
        } else {
          // Parse as regular CSV/text data
          const detectedDelimiter = detectDelimiter(content);
          setSelectedDelimiter(detectedDelimiter);
          const result = parseTabularContent(content, { delimiter: detectedDelimiter });
          setParsedData(result);
          setOriginalHeaders(result[0] || []);
        }

        setPreviousViewMode(viewMode);
        setViewMode('view');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'dataset_parseErrorMessage';

        // Check if it's a translation key with parameters (format: key:param)
        if (errorMessage.includes(':')) {
          const [key, param] = errorMessage.split(':', 2);
          if (key.startsWith('dataset_')) {
            showError(t('dataset_parseError'), t(key, { error: param }));
            return;
          }
        }

        // Check if it's a simple translation key
        if (errorMessage.startsWith('dataset_')) {
          showError(t('dataset_parseError'), t(errorMessage));
          return;
        }

        // Fallback for other errors
        showError(t('dataset_parseError'), errorMessage);
      }
    },
    [showError, t, viewMode, setOriginalHeaders, setIsJsonFormat]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {isProcessing ? (
        <LoadingSpinner />
      ) : viewMode === 'view' ? (
        // Data Viewer - Full Width
        <div className="py-8">
          <SlideInUp delay={0.2}>
            <DataViewer onUpload={handleFileUpload} onChangeData={handleChangeData} />
          </SlideInUp>
        </div>
      ) : (
        // Upload Modes - With Sidebar
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6 items-start">
            {/* Left Navigation Component */}
            <UploadMethodNavigation viewMode={viewMode} onViewModeChange={handleViewModeChange} />

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
              ) : viewMode === 'textUpload' ? (
                <SlideInUp key="text-upload" delay={0.2}>
                  <TextUpload onTextProcess={handleTextProcess} isProcessing={isProcessing} />
                </SlideInUp>
              ) : (
                <SlideInUp key="sample-data" delay={0.2}>
                  <SampleDataUpload onSampleSelect={handleTextProcess} />
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
    <DatasetProvider>
      <CreateDatasetPageContent />
    </DatasetProvider>
  );
}

export default CreateDatasetPage;
