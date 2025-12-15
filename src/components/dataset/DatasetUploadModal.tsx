import { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DatasetProvider, useDataset } from '@/contexts/DatasetContext';
import { useForm } from '@/contexts/FormContext';
import FileUpload from '@/components/dataset/FileUpload';
import TextUpload from '@/components/dataset/TextUpload';
import SampleDataUpload from '@/components/dataset/SampleDataUpload';
import UploadMethodNavigation from '@/components/dataset/UploadMethodNavigation';
import DataViewer from '@/components/dataset/DataViewer';
import { useToastContext } from '@/components/providers/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ModalConfirm } from '@/components/ui/modal-confirm';
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
import { useTranslation } from 'react-i18next';
import type { Dataset } from '@/features/dataset/datasetAPI';

type ViewMode = 'upload' | 'textUpload' | 'sampleData' | 'view' | 'cleanDataset';

interface DatasetUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDatasetCreated: (dataset: Dataset) => void;
  createDataset: (data: any) => Promise<Dataset>;
}

// Inner component that uses the context
function DatasetUploadModalContent({
  open,
  onOpenChange,
  onDatasetCreated,
  createDataset,
}: DatasetUploadModalProps) {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToastContext();

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
    parsedValues,
    numberFormat,
    dateFormat,
  } = useDataset();

  // Get form states from FormContext
  const { datasetName, description } = useForm();

  // Local state management
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
        await new Promise(resolve => setTimeout(resolve, 500));

        // Set up 3-layer data structure
        setOriginalParsedData(result); // Layer 2: Original parsed data
        setCurrentParsedData({ ...result }); // Layer 3: Current working copy

        console.log('✅ [processAndViewFile] Processed result:', result);
        console.log('📝 [processAndViewFile] setCurrentParsedData called with:', result);
        console.log('📊 [processAndViewFile] Result data length:', result?.data?.length || 0);
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

  // Execute the actual creation
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

      console.log('🚀 Upload Request Data:', requestData);

      // Create dataset using the provided function
      const result = await createDataset(requestData);

      // Show success message
      showSuccess('Dataset Created Successfully', 'Your dataset has been created and saved');

      // Call the callback with the created dataset
      onDatasetCreated(result);

      // Close the modal and reset state
      onOpenChange(false);
      resetState();
      setSelectedFile(null);
      setCurrentParsedData(null);
      setViewMode('upload');
    } catch (error: any) {
      if (error?.status === 409) {
        showError(
          t('dataset_nameExists'),
          t('dataset_nameExistsMessage', { name: datasetName.trim() })
        );
      } else {
        showError(t('dataset_uploadFailed'), error?.message || t('dataset_uploadFailedMessage'));
      }
    }
  }, [
    currentParsedData,
    parsedValues,
    showWarning,
    showSuccess,
    showError,
    datasetName,
    description,
    t,
    setCurrentParsedData,
    dateFormat,
    numberFormat.decimalSeparator,
    numberFormat.thousandsSeparator,
    createDataset,
    onDatasetCreated,
    onOpenChange,
    resetState,
  ]);

  // Handle dataset upload (create dataset) - Show confirm modal
  const handleDatasetUpload = useCallback(async () => {
    console.log('🔍 [handleDatasetUpload] currentParsedData:', currentParsedData);
    console.log('🔍 [handleDatasetUpload] datasetName:', datasetName);
    console.log('🔍 [handleDatasetUpload] viewMode:', viewMode);

    if (!currentParsedData) {
      console.error('❌ [handleDatasetUpload] No currentParsedData available!');
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

  // Handle modal close
  const handleClose = useCallback(() => {
    // Reset state when closing
    resetState();
    setSelectedFile(null);
    setCurrentParsedData(null);
    setViewMode('upload');
    onOpenChange(false);
  }, [resetState, setCurrentParsedData, onOpenChange]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-7xl max-h-[90vh] bg-white dark:bg-gray-800 overflow-hidden"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold">Upload Dataset</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {isProcessing ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner />
              </div>
            ) : viewMode === 'view' ? (
              // Data Viewer - Full Width
              <div className="h-full overflow-auto">
                <DataViewer onUpload={handleDatasetUpload} onChangeData={handleChangeData} />
              </div>
            ) : (
              // Upload Modes - With Sidebar
              <div className="flex h-full">
                {/* Left Navigation Component */}
                <div className="w-80 border-r bg-gray-50 dark:bg-gray-900">
                  <UploadMethodNavigation
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                  />
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-6">
                  {viewMode === 'upload' ? (
                    <SlideInUp key="file-upload" delay={0.1}>
                      <FileUpload
                        onFileSelect={handleFileSelect}
                        onFileRemove={handleFileRemove}
                        selectedFile={selectedFile}
                        isValidFileType={isValidFileType}
                        isProcessing={false}
                      />
                    </SlideInUp>
                  ) : viewMode === 'textUpload' ? (
                    <SlideInUp key="text-upload" delay={0.1}>
                      <TextUpload onTextProcess={handleTextProcess} isProcessing={isProcessing} />
                    </SlideInUp>
                  ) : (
                    <SlideInUp key="sample-data" delay={0.1}>
                      <SampleDataUpload onSampleSelect={handleTextProcess} />
                    </SlideInUp>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
}

// Main component with provider wrapper
export default function DatasetUploadModal(props: DatasetUploadModalProps) {
  return (
    <DatasetProvider>
      <DatasetUploadModalContent {...props} />
    </DatasetProvider>
  );
}
