import DataViewer from '@/components/dataset/DataViewer';
import FileUpload from '@/components/dataset/FileUpload';
import SampleDataUpload from '@/components/dataset/SampleDataUpload';
import TextUpload from '@/components/dataset/TextUpload';
import UploadMethodNavigation from '@/components/dataset/UploadMethodNavigation';
import { useToastContext } from '@/components/providers/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ModalConfirm } from '@/components/ui/modal-confirm';
import { DatasetProvider, useDataset } from '@/contexts/DatasetContext';
import { useAppDispatch } from '@/store/hooks';
import { createDatasetThunk } from '@/features/dataset/datasetThunk';
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
} from '@/utils/dataProcessors';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'upload' | 'textUpload' | 'sampleData' | 'view';

// Inner component that uses the context
function CreateDatasetPageContent() {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToastContext();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get states from context
  const {
    originalTextContent,
    setOriginalTextContent,
    currentParsedData,
    setOriginalParsedData,
    setCurrentParsedData,
    setIsJsonFormat,
    setSelectedDelimiter,
    resetState,
    datasetName,
    description,
    parsedValues,
    numberFormat,
    dateFormat,
  } = useDataset();

  // Local state management (non-shareable states)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [previousViewMode, setPreviousViewMode] = useState<ViewMode>('upload');

  // Modal state for confirm create dataset
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCreatingDataset, setIsCreatingDataset] = useState(false);

  // Handle switching between upload methods; clear transient inputs
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      if (mode !== 'view') {
        setOriginalTextContent('');
        setCurrentParsedData(null);
        setSelectedFile(null);
      }
      setViewMode(mode);
    },
    [setOriginalTextContent, setCurrentParsedData]
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

        // Set up 3-layer data structure
        setOriginalParsedData(result); // Layer 2: Original parsed data
        setCurrentParsedData({ ...result }); // Layer 3: Current working copy
        console.log('Processed result:', result);
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
    [
      showError,
      t,
      viewMode,
      setSelectedDelimiter,
      setOriginalParsedData,
      setCurrentParsedData,
      setOriginalTextContent,
    ]
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
    setCurrentParsedData(null);
    setViewMode('upload');
  }, [setCurrentParsedData]);

  // Handle file upload (create dataset) - Execute the actual creation
  const executeCreateDataset = useCallback(async () => {
    if (!currentParsedData) {
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

    try {
      // Transform currentParsedData to headers format for the new API
      const headers = [];

      if (currentParsedData && currentParsedData.headers.length > 0) {
        // Use the current working data (includes user modifications)
        for (let columnIndex = 0; columnIndex < currentParsedData.headers.length; columnIndex++) {
          const header = currentParsedData.headers[columnIndex];

          // Use parsed values if available for this column, otherwise use original data
          let columnData: (string | number | boolean | null)[];

          if (parsedValues[columnIndex] && Array.isArray(parsedValues[columnIndex])) {
            // Use parsed values from the map, converting undefined to null for API compatibility
            columnData = parsedValues[columnIndex].map(value =>
              value === undefined ? null : value
            );
          } else {
            // Fallback to original data
            columnData = currentParsedData.data.map(row => row[columnIndex] || null);
          }

          headers.push({
            name: header.name,
            type: header.type, // Use the actual column type from user's working data
            index: columnIndex,
            data: columnData, // This will be the parsed values or original data
          });
        }
      }

      // Prepare the data to send in the new format
      const requestData = {
        name: datasetName.trim(),
        headers: headers,
        ...(description && { description: description.trim() }),
        thousandsSeparator: numberFormat.thousandsSeparator,
        decimalSeparator: numberFormat.decimalSeparator,
        dateFormat: dateFormat,
      };

      // Console log the exact request data being sent
      console.log('🚀 Upload Request Data:', requestData);

      // Use Redux thunk instead of direct axios call
      const result = await dispatch(createDatasetThunk(requestData));

      if (createDatasetThunk.fulfilled.match(result)) {
        // Show success message first
        showSuccess('Dataset Created Successfully', 'Your dataset has been created and saved');

        // Navigate to workspace datasets page
        const created = result.payload as any; // dataset object
        if (created && created.id) {
          // Use React Router navigation instead of window.location.href
          navigate('/workspace', { state: { tab: 'datasets' } });
        }

        // Reset state after successful upload
        setSelectedFile(null);
        setCurrentParsedData(null);
        setViewMode('upload');
      } else {
        // Handle thunk rejection
        const error = result.payload as any;
        if (error?.status === 409) {
          showError(
            t('dataset_nameExists'),
            t('dataset_nameExistsMessage', { name: datasetName.trim() })
          );
        } else {
          showError(t('dataset_uploadFailed'), error?.message || t('dataset_uploadFailedMessage'));
        }
      }
    } catch (error: any) {
      showError(t('dataset_uploadFailed'), error.message || t('dataset_uploadFailedMessage'));
    }
  }, [
    currentParsedData,
    parsedValues,
    showWarning,
    showSuccess,
    showError,
    datasetName,
    description,
    dispatch,
    navigate,
    t,
    setCurrentParsedData,
    dateFormat,
    numberFormat.decimalSeparator,
    numberFormat.thousandsSeparator,
  ]);

  // Handle file upload (create dataset) - Show confirm modal
  const handleFileUpload = useCallback(async () => {
    if (!currentParsedData) {
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

    // Show confirmation modal
    setShowConfirmModal(true);
  }, [currentParsedData, datasetName, description, showWarning, t]);

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

          // Set up 3-layer data structure
          setOriginalParsedData(result); // Layer 2: Original parsed data
          setCurrentParsedData({ ...result }); // Layer 3: Current working copy
        } else {
          // Parse as regular CSV/text data
          const detectedDelimiter = detectDelimiter(content);
          setSelectedDelimiter(detectedDelimiter);
          const result = parseTabularContent(content, { delimiter: detectedDelimiter });

          // Set up 3-layer data structure
          setOriginalParsedData(result); // Layer 2: Original parsed data
          setCurrentParsedData({ ...result }); // Layer 3: Current working copy
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
    [
      showError,
      t,
      viewMode,
      setIsJsonFormat,
      setOriginalTextContent,
      setOriginalParsedData,
      setCurrentParsedData,
      setSelectedDelimiter,
    ]
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

      {/* Confirmation Modal */}
      <ModalConfirm
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={async () => {
          setIsCreatingDataset(true);
          await executeCreateDataset();
          setIsCreatingDataset(false);
          setShowConfirmModal(false);
        }}
        title={'Confirm Dataset Creation'}
        message={`Are you sure you want to create the dataset "${datasetName.trim()}"?`}
        confirmText={t('dataset_createDatasetButton') || 'Create Dataset'}
        cancelText={t('cancel') || 'Cancel'}
        type="info"
        loading={isCreatingDataset}
      />
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
