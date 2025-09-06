import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, RefreshCw, Settings } from 'lucide-react';
import DelimiterSelector from './DelimiterSelector';
import { NumberFormatSelector } from './NumberFormatSelector';
import { useDatasetUpload } from '@/contexts/DatasetUploadContext';
import './scrollbar.css';

interface DataViewerOptionsProps {
  onUpload: (name: string, description?: string) => void;
  onChangeData: () => void;
  onDelimiterChange?: (delimiter: string) => void;
  onNumberFormatChange?: (thousandsSeparator: string, decimalSeparator: string) => void;
}

function DataViewerOptions({
  onUpload,
  onChangeData,
  onDelimiterChange,
  onNumberFormatChange,
}: DataViewerOptionsProps) {
  const { t } = useTranslation();

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
    isUploading,
  } = useDatasetUpload();

  const handleUpload = () => {
    if (!datasetName.trim()) {
      return; // Don't upload if name is empty
    }
    onUpload(datasetName.trim(), description.trim() || undefined);
  };

  const handleDelimiterChange = (delimiter: string) => {
    setSelectedDelimiter(delimiter);
    if (onDelimiterChange) {
      onDelimiterChange(delimiter);
    }
  };

  const handleNumberFormatChange = (type: 'thousands' | 'decimal', value: string) => {
    const newFormat = {
      ...numberFormat,
      [type === 'thousands' ? 'thousandsSeparator' : 'decimalSeparator']: value,
    };
    setNumberFormat(newFormat);

    if (onNumberFormatChange) {
      onNumberFormatChange(newFormat.thousandsSeparator, newFormat.decimalSeparator);
    }
  };

  return (
    <div className="w-96 flex-shrink-0 pl-6">
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
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 border-gray-300 dark:border-gray-600"
              disabled={isUploading}
            />
            {!datasetName.trim() && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Please enter a name before creating the dataset
              </p>
            )}
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
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 custom-scrollbar"
              disabled={isUploading}
            />
          </div>

          {/* Delimiter Selector */}
          {onDelimiterChange && (
            <DelimiterSelector
              selectedDelimiter={selectedDelimiter}
              onDelimiterChange={handleDelimiterChange}
              disabled={isUploading}
            />
          )}

          {/* Number Format Settings */}
          {onNumberFormatChange && (
            <NumberFormatSelector
              thousandsSeparator={numberFormat.thousandsSeparator}
              decimalSeparator={numberFormat.decimalSeparator}
              onChange={handleNumberFormatChange}
              disabled={isUploading}
            />
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleUpload}
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
