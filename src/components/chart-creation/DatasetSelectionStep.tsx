import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useChartCreation } from '@/contexts/ChartCreationContext';
import { DatasetProvider, useDataset } from '@/contexts/DatasetContext';
import FileUpload from '@/components/dataset/FileUpload';
import TextUpload from '@/components/dataset/TextUpload';
import SampleDataUpload from '@/components/dataset/SampleDataUpload';
import UploadMethodNavigation from '@/components/dataset/UploadMethodNavigation';
import DataViewer from '@/components/dataset/DataViewer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SlideInUp } from '@/theme/animation';
import { 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
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
import type { Dataset } from '@/contexts/ChartCreationContext';

interface DatasetSelectionStepProps {
  onNext: () => void;
  onDatasetSelect?: (dataset: Dataset) => void;
}

type ViewMode = 'upload' | 'textUpload' | 'sampleData' | 'view';

// Inner component that uses the DatasetContext
function DatasetSelectionStepContent({ onNext, onDatasetSelect }: DatasetSelectionStepProps) {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToastContext();
  const { selectedDataset, setSelectedDataset } = useChartCreation();

  // Get states from DatasetContext
  const {
    originalTextContent,
    setOriginalTextContent,
    parsedData,
    setParsedData,
    setOriginalHeaders,
    setIsJsonFormat,
    setSelectedDelimiter,
    resetState,
  } = useDataset();

  // Local state management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [previousViewMode, setPreviousViewMode] = useState<ViewMode>('upload');

  // Handle switching between modes
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      if (mode !== 'view') {
        setOriginalTextContent('');
        setParsedData(null);
        setSelectedFile(null);
      }
      setViewMode(mode);
    },
    [setOriginalTextContent, setParsedData]
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
        
        // Create dataset from processed data
        const tempDataset: Dataset = {
          id: 'temp-' + Date.now(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          description: `Uploaded file: ${file.name}`,
          data: result || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setSelectedDataset(tempDataset);
        onDatasetSelect?.(tempDataset);
        
        setPreviousViewMode(viewMode);
        setViewMode('view');
        
        showSuccess(t('dataset_file_processed'), t('dataset_file_processed_message'));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('dataset_fileReadErrorMessage');
        showError(t('dataset_fileReadError'), t(errorMessage));
      } finally {
        setIsProcessing(false);
      }
    },
    [showError, showSuccess, t, viewMode, setSelectedDelimiter, setOriginalTextContent, setParsedData, setOriginalHeaders, setSelectedDataset, onDatasetSelect]
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
    setSelectedDataset(null);
    setViewMode('upload');
  }, [setParsedData, setSelectedDataset]);

  // Handle text processing
  const handleTextProcess = useCallback(
    (content: string) => {
      setOriginalTextContent(content);

      try {
        // Check if content is JSON format first
        const isJson = checkIsJsonFormat(content);
        setIsJsonFormat(isJson);

        let result: string[][];
        if (isJson) {
          // Parse JSON directly - no delimiter needed
          result = parseJsonDirectly(content);
          setSelectedDelimiter(','); // Set a default delimiter for display purposes
        } else {
          // Parse as regular CSV/text data
          const detectedDelimiter = detectDelimiter(content);
          setSelectedDelimiter(detectedDelimiter);
          result = parseTabularContent(content, { delimiter: detectedDelimiter });
        }
        
        setParsedData(result);
        setOriginalHeaders(result[0] || []);
        
        // Create dataset from processed data
        const tempDataset: Dataset = {
          id: 'temp-' + Date.now(),
          name: 'Pasted Data',
          description: 'Data pasted from text input',
          data: result || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setSelectedDataset(tempDataset);
        onDatasetSelect?.(tempDataset);

        setPreviousViewMode(viewMode);
        setViewMode('view');
        
        showSuccess(t('dataset_text_processed'), t('dataset_text_processed_message'));
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
    [showError, showSuccess, t, viewMode, setOriginalTextContent, setParsedData, setOriginalHeaders, setIsJsonFormat, setSelectedDelimiter, setSelectedDataset, onDatasetSelect]
  );

  // Handle sample data selection
  const handleSampleSelect = useCallback((content: string) => {
    handleTextProcess(content);
  }, [handleTextProcess]);

  // Handle file upload (create dataset)
  const handleFileUpload = useCallback(async () => {
    if (!parsedData) {
      showWarning('No Data Available', 'Please select a file or enter text data first');
      return;
    }

    // For chart creation, we don't need to save the dataset to server
    // Just proceed with the temporary dataset
    showSuccess('Dataset Ready', 'Your dataset is ready for chart creation');
  }, [parsedData, showWarning, showSuccess]);

  // Handle change data (go back to previous upload method and reset shared state)
  const handleChangeData = useCallback(() => {
    const prevText = originalTextContent;
    // Reset all shared dataset state back to initial
    resetState();
    // Clear local file selection
    setSelectedFile(null);
    setSelectedDataset(null);

    // Restore user text only if returning to text upload
    if (previousViewMode === 'textUpload') {
      setOriginalTextContent(prevText);
    }

    setViewMode(previousViewMode);
  }, [originalTextContent, previousViewMode, resetState, setOriginalTextContent, setSelectedDataset]);

  // Get preview of dataset data
  const getDataPreview = (data: string[][]) => {
    if (!data || data.length === 0) return t('dataset_no_data');
    const rows = data.length;
    const cols = data[0]?.length || 0;
    return `${rows} ${rows === 1 ? 'dòng' : 'dòng'} × ${cols} ${cols === 1 ? 'cột' : 'cột'}`;
  };

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
            />
          </SlideInUp>
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleChangeData}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('dataset_back_selection')}
            </Button>
            <Button 
              onClick={onNext} 
              size="lg"
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedDataset}
            >
              {t('dataset_continue_chart_type')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Upload Modes - With Sidebar
        <div>
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('dataset_select_title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('dataset_select_subtitle')}
            </p>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <TextUpload onTextProcess={handleTextProcess} isProcessing={false} />
                  </SlideInUp>
                ) : (
                  <SlideInUp key="sample-data" delay={0.2}>
                    <SampleDataUpload onSampleSelect={handleSampleSelect} />
                  </SlideInUp>
                )}
              </div>
            </div>
          </div>

          {/* Selected Dataset Info */}
          {selectedDataset && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">
                        {t('dataset_selected_info')} {selectedDataset.name}
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {getDataPreview(selectedDataset.data)}
                      </p>
                    </div>
                    <Button 
                      onClick={onNext} 
                      size="lg"
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('dataset_continue_chart_type')}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main wrapper component with DatasetProvider
function DatasetSelectionStep(props: DatasetSelectionStepProps) {
  return (
    <DatasetProvider>
      <DatasetSelectionStepContent {...props} />
    </DatasetProvider>
  );
}

export default DatasetSelectionStep;
