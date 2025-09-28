import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDataset, type DateFormat, type NumberFormat } from '@/contexts/DatasetContext';
import { useAppSelector } from '@/store/hooks';
import { DATASET_DESCRIPTION_MAX_LENGTH, DATASET_NAME_MAX_LENGTH } from '@/utils/Consts';
import { parseTabularContent, transformWideToLong } from '@/utils/dataProcessors';
import { RefreshCw, Settings, Upload } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '../providers/ToastProvider';
import DataTransformationSelector from './DataTransformationSelector';
import { DateFormatSelector } from './DateFormatSelector';
import DelimiterSelector from './DelimiterSelector';
import { NumberFormatSelector } from './NumberFormatSelector';
import './scrollbar.css';

interface DataViewerOptionsProps {
  onUpload?: () => void;
  onChangeData?: () => void;
}

function DataViewerOptions({ onUpload, onChangeData }: DataViewerOptionsProps) {
  const { t } = useTranslation();
  const { showError, showSuccess } = useToastContext();
  const { creating: isUploading } = useAppSelector(state => state.dataset);

  // Get states from context
  const {
    datasetName,
    setDatasetName,
    validationErrors,
    setValidationError,
    description,
    setDescription,
    selectedDelimiter,
    setSelectedDelimiter,
    numberFormat,
    setNumberFormat,
    dateFormat,
    setDateFormat,
    originalParsedData,
    setOriginalParsedData,
    setCurrentParsedData,
    isJsonFormat,
    transformationColumn,
    setTransformationColumn,
    originalTextContent,
    hasValidationErrors,
  } = useDataset();

  // Initialize dataset name error on mount and when name changes (centralized)
  useEffect(() => {
    const isEmpty = !datasetName.trim();
    setValidationError('datasetName', 'empty', isEmpty);
  }, [datasetName, setValidationError]);

  // Handle delimiter change - reparse the original content with new delimiter
  const handleDelimiterChange = useCallback(
    (delimiter: string) => {
      // No-op if user reselects the same delimiter
      if (delimiter === selectedDelimiter) return;
      if (!originalTextContent) return;

      setSelectedDelimiter(delimiter);
      // Reset transformation when delimiter changes
      setTransformationColumn(null);
      try {
        const result = parseTabularContent(originalTextContent, { delimiter });
        // Update Layer 2: Original parsed data
        setOriginalParsedData(result);
        // Update Layer 3: Current working data (starts as copy of original)
        setCurrentParsedData({ ...result });
      } catch (error) {
        showError('Parse Error', 'Failed to parse with the selected delimiter');
      }
    },
    [
      originalTextContent,
      showError,
      setOriginalParsedData,
      setCurrentParsedData,
      setSelectedDelimiter,
      setTransformationColumn,
      selectedDelimiter,
    ]
  );

  const handleNumberFormatChange = (format: NumberFormat) => {
    // Replace old state with the new format
    setNumberFormat(format);
  };

  const handleDateFormatChange = (format: DateFormat) => {
    // No-op if user reselects the same date format
    if (format === dateFormat) return;
    setDateFormat(format);
  };

  const handleTransformationColumnChange = (column: string) => {
    // No-op if user reselects the same column
    if (column === (transformationColumn ?? '')) return;
    // Validate: need at least 2 columns to perform stack transformation
    if (!originalParsedData || (originalParsedData.headers?.length || 0) <= 1) {
      showError('Invalid Operation', 'Stack transformation requires at least 2 columns');
      return;
    }
    setTransformationColumn(column);

    if (!originalParsedData) return;

    try {
      // If no column selected, reset to original parsed data
      if (!column) {
        setCurrentParsedData({ ...originalParsedData });
        return;
      }

      // Transform using currentParsedData (user's working data)
      // Convert to 2D array format for transformation function
      const headers = originalParsedData.headers.map(h => h.name);
      const data2D = [headers, ...originalParsedData.data];

      const transformed = transformWideToLong(data2D, column);

      // Update current working data with transformation result
      // Note: transformed data has different structure, so we need to parse it back
      if (transformed.length > 0) {
        const transformedHeaders = transformed[0].map((name, index) => ({
          name,
          type: 'text' as const,
          index,
        }));
        const transformedData = transformed.slice(1);

        setCurrentParsedData({
          headers: transformedHeaders,
          data: transformedData,
        });
      }
    } catch (error) {
      showError('Parse Error', 'Failed to process data transformation');
    }
  };

  return (
    <div className="w-full flex-shrink-0">
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dataset Name Input */}
          <div>
            <label
              htmlFor="dataset-name"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
            >
              Dataset Name *
            </label>
            <Input
              id="dataset-name"
              type="text"
              placeholder="Enter a name for your dataset..."
              value={datasetName}
              onChange={e => setDatasetName(e.target.value)}
              maxLength={DATASET_NAME_MAX_LENGTH}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 border-gray-300 dark:border-gray-600"
              disabled={isUploading}
            />
            <div className="flex justify-between items-center mt-1">
              {validationErrors.datasetName?.empty && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Please enter a name before creating the dataset
                </p>
              )}
              <p
                className={`text-xs ml-auto ${datasetName.length > DATASET_NAME_MAX_LENGTH * 0.8 ? 'text-orange-500' : 'text-gray-400'}`}
              >
                {datasetName.length}/{DATASET_NAME_MAX_LENGTH}
              </p>
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="dataset-description"
              className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="dataset-description"
              placeholder="Enter a description for your dataset..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={DATASET_DESCRIPTION_MAX_LENGTH}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 custom-scrollbar"
              disabled={isUploading}
            />
            <p
              className={`text-xs text-right mt-1 ${description.length > DATASET_DESCRIPTION_MAX_LENGTH * 0.8 ? 'text-orange-500' : 'text-gray-400'}`}
            >
              {description.length}/{DATASET_DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          {/* Delimiter Selector - Only show for non-JSON formats */}
          {!isJsonFormat && (
            <DelimiterSelector
              selectedDelimiter={selectedDelimiter}
              onDelimiterChange={handleDelimiterChange}
              disabled={isUploading}
            />
          )}

          {/* Number Format Settings */}
          <NumberFormatSelector
            thousandsSeparator={numberFormat.thousandsSeparator}
            decimalSeparator={numberFormat.decimalSeparator}
            onChange={handleNumberFormatChange}
            disabled={isUploading}
          />

          {/* Date Format Settings */}
          <DateFormatSelector
            format={dateFormat}
            onChange={handleDateFormatChange}
            disabled={isUploading}
          />

          {/* Data Transformation Selector */}
          {/* <DataTransformationSelector
            headers={originalParsedData?.headers.map(h => h.name) || []}
            value={transformationColumn ?? ''}
            onChange={handleTransformationColumnChange}
            disabled={isUploading || !originalParsedData}
          /> */}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={onUpload}
              disabled={isUploading || hasValidationErrors()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

            <Button
              onClick={onChangeData}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('dataset_changeData')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DataViewerOptions;
