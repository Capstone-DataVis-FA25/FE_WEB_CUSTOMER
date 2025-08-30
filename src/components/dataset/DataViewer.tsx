import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Upload, RefreshCw } from 'lucide-react';

interface DataViewerProps {
  data: string[][] | null;
  isUploading: boolean;
  onUpload: (name: string) => void;
  onChangeData: () => void;
}

function DataViewer({ data, isUploading, onUpload, onChangeData }: DataViewerProps) {
  const { t } = useTranslation();
  const [datasetName, setDatasetName] = useState<string>('');

  const handleUpload = () => {
    if (!datasetName.trim()) {
      return; // Don't upload if name is empty
    }
    onUpload(datasetName.trim());
  };

  return (
    <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          Data Preview
        </CardTitle>
      </CardHeader>

      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-6">
            {/* Dataset Name Input */}
            <div>
              <div className="max-w-md mx-auto">
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
            </div>
            {/* Data Table Display */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      {data[0].map((header, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length > 1 && (
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  <span>
                    {t('dataset_csvTableInfo', {
                      rows: data.length - 1,
                      columns: data[0]?.length || 0,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 italic">
              {t('dataset_noContentToDisplay')}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onChangeData}
            variant="outline"
            className="px-6 py-3 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('dataset_changeData')}
          </Button>

          <Button
            onClick={handleUpload}
            disabled={isUploading || !datasetName.trim()}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </CardContent>
    </Card>
  );
}

export default DataViewer;
