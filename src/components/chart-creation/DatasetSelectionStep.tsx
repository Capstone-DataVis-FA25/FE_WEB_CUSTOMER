import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useChartCreation } from '@/contexts/ChartCreationContext';
import { DatasetUploadProvider, useDatasetUpload } from '@/contexts/DatasetUploadContext';
import FileUpload from '@/components/dataset/FileUpload';
import TextUpload from '@/components/dataset/TextUpload';
import DataViewer from '@/components/dataset/DataViewer';
import type Papa from 'papaparse';
import { 
  Database, 
  Upload, 
  Search, 
  FileSpreadsheet, 
  Calendar,
  Eye,
  ChevronRight,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { axiosPrivate } from '@/services/axios';
import {
  processFileContent,
  parseTabularContent,
  validateFileSize,
  isValidFileType,
  MAX_FILE_SIZE,
} from '@/utils/fileProcessors';
import type { Dataset } from '@/contexts/ChartCreationContext';

interface DatasetSelectionStepProps {
  onNext: () => void;
  onDatasetSelect?: (dataset: Dataset) => void;
}

type ViewMode = 'selection' | 'upload' | 'paste' | 'preview';

// Inner component that uses DatasetUploadContext
function DatasetSelectionStepContent({ onNext, onDatasetSelect }: DatasetSelectionStepProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToastContext();
  const { selectedDataset, setSelectedDataset, setUploadedDataset } = useChartCreation();
  
  // Use DatasetUpload context for preview mode
  const {
    parsedData,
    setParsedData,
    originalTextContent,
    setOriginalTextContent,
    isUploading,
    setIsUploading,
  } = useDatasetUpload();

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  const [datasets] = useState<Dataset[]>([]);
  const [isLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch datasets
  const fetchDatasets = useCallback(async () => {
    // setIsLoading(true);
    // try {
    //   const response = await axiosPrivate.get('/datasets');
    //   setDatasets(response.data || []);
    // } catch (_error: unknown) {
    //   showError('Failed to load datasets', 'Could not fetch your datasets');
    // } finally {
    //   setIsLoading(false);
    // }
  }, []);

  // Load datasets on mount
  useState(() => {
    fetchDatasets();
  });

  // Filter datasets based on search
  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dataset.description && dataset.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle dataset selection
  const handleDatasetSelect = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    onDatasetSelect?.(dataset);
  };

  // Handle file selection for upload
  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file size
    if (!validateFileSize(file, MAX_FILE_SIZE)) {
      showError(t('dataset_fileTooLarge'), t('dataset_fileTooLargeMessage'));
      return;
    }

    setSelectedFile(file);
    
    // If file is valid, process it
    if (isValidFileType(file)) {
      setIsUploading(true);
      try {
        // Read the original text content first
        const textContent = await file.text();
        setOriginalTextContent(textContent);
        
        const result = await processFileContent(file);
        
        // Store parsed data for preview
        setParsedData(result);
        
        // Create a temporary dataset object
        const tempDataset: Dataset = {
          id: 'temp-' + Date.now(),
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          description: `Uploaded file: ${file.name}`,
          data: result.data || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setUploadedDataset(tempDataset);
        setSelectedDataset(tempDataset);
        onDatasetSelect?.(tempDataset);
        
        // Switch to preview mode
        setViewMode('preview');
        
        showSuccess(t('dataset_file_processed'), t('dataset_file_processed_message'));
      } catch (_error) {
        showError(t('dataset_file_failed'), t('dataset_file_failed_message'));
      } finally {
        setIsUploading(false);
      }
    }
  }, [showError, showSuccess, t, setUploadedDataset, setSelectedDataset, onDatasetSelect, setIsUploading, setOriginalTextContent, setParsedData]);

  // Handle file removal
  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setParsedData(null);
    setOriginalTextContent('');
    setUploadedDataset(null);
    if (selectedDataset?.id.startsWith('temp-')) {
      setSelectedDataset(null);
    }
    setViewMode('upload');
  }, [selectedDataset, setSelectedDataset, setUploadedDataset, setOriginalTextContent, setParsedData]);

  // Handle text processing
  const handleTextProcess = useCallback((content: string) => {
    setOriginalTextContent(content);
    try {
      const result = parseTabularContent(
        content,
        new File([content], 'text.csv', { type: 'text/csv' })
      );
      
      // Debug log
      console.log('DatasetSelectionStep - parseTabularContent result:', result);
      console.log('DatasetSelectionStep - result.data:', result.data);
      
      // Store parsed data for preview
      setParsedData(result);
      
      // Create a temporary dataset object
      const tempDataset: Dataset = {
        id: 'temp-' + Date.now(),
        name: 'Pasted Data',
        description: 'Data pasted from text input',
        data: result.data || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setUploadedDataset(tempDataset);
      setSelectedDataset(tempDataset);
      onDatasetSelect?.(tempDataset);
      
      // Switch to preview mode
      setViewMode('preview');
      
      showSuccess(t('dataset_text_processed'), t('dataset_text_processed_message'));
    } catch (_error) {
      showError(t('dataset_parse_error'), t('dataset_parse_error_message'));
    }
  }, [showError, showSuccess, setUploadedDataset, setSelectedDataset, onDatasetSelect, setOriginalTextContent, setParsedData, t]);

  // Handle preview button click
  const handlePreviewClick = useCallback(() => {
    if (selectedDataset) {
      // Set data to context for DataViewer to use
      const mockResult = {
        data: selectedDataset.data,
        errors: [],
        meta: {
          delimiter: ',',
          linebreak: '\n',
          aborted: false,
          truncated: false,
          cursor: 0
        }
      } as unknown as Papa.ParseResult<string[]>;
      setParsedData(mockResult);
      setViewMode('preview');
    }
  }, [selectedDataset, setParsedData]);

  // Handle back from preview
  const handleBackFromPreview = useCallback(() => {
    // Reset data but keep the dataset for chart creation
    setViewMode('selection');
  }, []);

  // Handle create dataset from preview
  const handleCreateDataset = useCallback(async (name: string, description?: string) => {
    if (!parsedData) return;

    setIsUploading(true);
    try {
      const requestBody = {
        name: name.trim(),
        data: parsedData.data || [],
        ...(description && { description: description.trim() }),
      };

      await axiosPrivate.post('/datasets', requestBody);
      
      // Update the dataset to be permanent
      const permanentDataset: Dataset = {
        ...selectedDataset!,
        id: 'saved-' + Date.now(),
        name: name.trim(),
        description: description || selectedDataset!.description,
      };
      
      setSelectedDataset(permanentDataset);
      setUploadedDataset(permanentDataset);
      onDatasetSelect?.(permanentDataset);
      
      showSuccess(t('dataset_created_success'), t('dataset_created_success_message'));
    } catch (_error) {
      showError(t('dataset_creation_failed'), t('dataset_creation_failed_message'));
    } finally {
      setIsUploading(false);
    }
  }, [parsedData, selectedDataset, showSuccess, showError, setSelectedDataset, setUploadedDataset, onDatasetSelect, setIsUploading, t]);

  // Handle delimiter change
  const handleDelimiterChange = useCallback((delimiter: string) => {
    if (!originalTextContent) return;

    try {
      const result = parseTabularContent(
        originalTextContent,
        new File([originalTextContent], 'data.csv', { type: 'text/csv' }),
        { delimiter }
      );
      setParsedData(result);
      
      // Update the selected dataset with new data
      if (selectedDataset) {
        const updatedDataset = {
          ...selectedDataset,
          data: result.data || []
        };
        setSelectedDataset(updatedDataset);
        setUploadedDataset(updatedDataset);
        onDatasetSelect?.(updatedDataset);
      }
    } catch (_error) {
      showError(t('dataset_delimiter_parse_error'), t('dataset_delimiter_parse_error_message'));
    }
  }, [originalTextContent, selectedDataset, showError, setSelectedDataset, setUploadedDataset, onDatasetSelect, setParsedData, t]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get preview of dataset data
  const getDataPreview = (data: string[][]) => {
    if (!data || data.length === 0) return t('dataset_no_data');
    const rows = data.length;
    const cols = data[0]?.length || 0;
    return `${rows} ${rows === 1 ? 'dòng' : 'dòng'} × ${cols} ${cols === 1 ? 'cột' : 'cột'}`;
  };

  return (
    <div className="space-y-6">
      {viewMode === 'preview' ? (
        // Preview mode - show DataViewer
        <div className="space-y-4">
          <DataViewer
            onUpload={handleCreateDataset}
            onChangeData={handleBackFromPreview}
            onDelimiterChange={handleDelimiterChange}
            onNumberFormatChange={() => {}} // Could implement if needed
          />
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBackFromPreview}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('dataset_back_selection')}
            </Button>
            <Button 
              onClick={onNext} 
              size="lg"
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('dataset_continue_chart_type')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Normal selection/upload modes
        <>
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('dataset_select_title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('dataset_select_subtitle')}
            </p>
          </div>

          {/* Mode Selection - 3 tabs */}
          <div className="flex justify-center space-x-2">
            <Button
              variant={viewMode === 'selection' ? 'default' : 'outline'}
              onClick={() => setViewMode('selection')}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              {t('dataset_tab_select')}
            </Button>
            <Button
              variant={viewMode === 'upload' ? 'default' : 'outline'}
              onClick={() => setViewMode('upload')}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {t('dataset_tab_upload')}
            </Button>
            <Button
              variant={viewMode === 'paste' ? 'default' : 'outline'}
              onClick={() => setViewMode('paste')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {t('dataset_tab_paste')}
            </Button>
          </div>

          {/* Content based on mode */}
          {viewMode === 'selection' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('dataset_search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Dataset List */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                  <div className="col-span-full text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">{t('dataset_loading')}</p>
                  </div>
                ) : filteredDatasets.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-600">{t('dataset_no_datasets')}</p>
                  </div>
                ) : (
                  filteredDatasets.map((dataset) => (
                    <Card
                      key={dataset.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedDataset?.id === dataset.id
                          ? 'ring-2 ring-blue-500 border-blue-500'
                          : 'hover:border-blue-300'
                      }`}
                      onClick={() => handleDatasetSelect(dataset)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="truncate">{dataset.name}</span>
                          {selectedDataset?.id === dataset.id && (
                            <Badge variant="default" className="ml-2">{t('dataset_selected')}</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {dataset.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {dataset.description}
                            </p>
                          )}
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <FileSpreadsheet className="w-3 h-3 mr-1" />
                              {getDataPreview(dataset.data)}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(dataset.createdAt)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ) : viewMode === 'upload' ? (
            <div className="max-w-2xl mx-auto">
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={selectedFile}
                isValidFileType={isValidFileType}
                isProcessing={isUploading}
              />
            </div>
          ) : viewMode === 'paste' ? (
            <div className="max-w-2xl mx-auto">
              <TextUpload 
                onTextProcess={handleTextProcess} 
                isProcessing={isUploading} 
              />
            </div>
          ) : null}

          {/* Selected Dataset Info */}
          {selectedDataset && (viewMode === 'selection' || viewMode === 'upload' || viewMode === 'paste') && (
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
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={handlePreviewClick}
                  >
                    <Eye className="w-3 h-3" />
                    {t('dataset_preview')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Button */}
          {(viewMode === 'selection' || viewMode === 'upload' || viewMode === 'paste') && (
            <div className="flex justify-end">
              <Button 
                onClick={onNext} 
                disabled={!selectedDataset}
                size="lg"
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('dataset_continue_chart_type')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Main wrapper component with DatasetUploadProvider
function DatasetSelectionStep(props: DatasetSelectionStepProps) {
  return (
    <DatasetUploadProvider>
      <DatasetSelectionStepContent {...props} />
    </DatasetUploadProvider>
  );
}

export default DatasetSelectionStep;
