import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, RefreshCw, Settings } from 'lucide-react';
import DelimiterSelector from './DelimiterSelector';
import { NumberFormatSelector } from './NumberFormatSelector';
import DataTransformationSelector from './DataTransformationSelector';
import { useDataset } from '@/contexts/DatasetContext';
import { DATASET_NAME_MAX_LENGTH, DATASET_DESCRIPTION_MAX_LENGTH } from '@/utils/Consts';
import {
  transformWideToLong,
  parseJsonDirectly,
  parseTabularContent,
} from '@/utils/dataProcessors';
import './scrollbar.css';
import { useCallback } from 'react';
import { useToastContext } from '../providers/ToastProvider';
import { useAppSelector } from '@/store/hooks';

interface DataViewerOptionsProps {
  onUpload?: () => void;
  onChangeData?: () => void;
}

function DataViewerOptions({ onUpload, onChangeData }: DataViewerOptionsProps) {
  const { t } = useTranslation();
  const { showError } = useToastContext();
  const { creating: isUploading } = useAppSelector(state => state.dataset);

  // Get states from context
  const {
    datasetName,
    setDatasetName,
    description,
    setDescription,
    selectedDelimiter,
    setSelectedDelimiter,
    numberFormat,
    setNumberFormat,
    parsedData,
    originalHeaders,
    setOriginalHeaders,
    isJsonFormat,
    transformationColumn,
    setTransformationColumn,
    originalTextContent,
    setParsedData,
  } = useDataset();

  // Handle delimiter change - reparse the original content with new delimiter
  const handleDelimiterChange = useCallback(
    (delimiter: string) => {
      if (!originalTextContent) return;

      setSelectedDelimiter(delimiter);
      // Reset transformation when delimiter changes
      setTransformationColumn(null);
      try {
        const result = parseTabularContent(originalTextContent, { delimiter });
        // Convert result back to 2D array format for backward compatibility
        const headers = result.headers.map(h => h.name);
        const data = [headers, ...result.data];
        setParsedData(data);
        setOriginalHeaders(headers);
      } catch (error) {
        showError('Parse Error', 'Failed to parse with the selected delimiter');
      }
    },
    [originalTextContent, showError, setOriginalHeaders]
  );

  const handleNumberFormatChange = (
    type: 'thousandsSeparator' | 'decimalSeparator',
    value: string
  ) => {
    const newFormat = {
      ...numberFormat,
      [type]: value,
    };
    setNumberFormat(newFormat);
  };

  const handleTransformationColumnChange = (column: string) => {
    setTransformationColumn(column);

    // Always re-parse from original content to get fresh data
    if (!originalTextContent) return;

    try {
      // Re-parse from original content to get fresh data
      let originalData: string[][];

      // Use the stored format flag instead of recalculating
      if (isJsonFormat) {
        const result = parseJsonDirectly(originalTextContent);
        // Convert result back to 2D array format for backward compatibility
        const headers = result.headers.map(h => h.name);
        originalData = [headers, ...result.data];
      } else {
        const result = parseTabularContent(originalTextContent, {
          delimiter: selectedDelimiter,
        });
        // Convert result back to 2D array format for backward compatibility
        const headers = result.headers.map(h => h.name);
        originalData = [headers, ...result.data];
      }

      // If no column selected, use original data
      if (!column) {
        setParsedData(originalData);
        setOriginalHeaders(originalData[0] || []);
        return;
      }

      // Transform the original data (not the current parsedData)
      const transformed = transformWideToLong(originalData, column);

      // Update the parsed data with transformed data
      // Keep original headers - don't change them for transformations
      setParsedData(transformed);
    } catch (error) {
      showError('Parse Error', 'Failed to process data transformation');
    }
  };

  return (
    <div className="w-[420px] flex-shrink-0">
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
              {!datasetName.trim() && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
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

          {/* Data Transformation Selector */}
          <DataTransformationSelector
            headers={originalHeaders}
            value={transformationColumn ?? ''}
            onChange={handleTransformationColumnChange}
            disabled={isUploading || !parsedData}
          />

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={onUpload}
              disabled={isUploading || !datasetName.trim()}
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
