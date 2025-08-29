import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, AlertCircle, Upload, RefreshCw } from 'lucide-react';

interface ParsedData {
  content: string;
  tabularData?: string[][];
  parseErrors?: Array<{ message: string; row?: number; type?: string }>;
}

interface DataViewerProps {
  parsedData: ParsedData | null;
  isUploading: boolean;
  onUpload: () => void;
  onChangeData: () => void;
}

function DataViewer({ parsedData, isUploading, onUpload, onChangeData }: DataViewerProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          Data Preview
        </CardTitle>
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="font-semibold text-gray-900 dark:text-white">Dataset Preview</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ready for processing and upload
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {parsedData ? (
          <div className="space-y-6">
            {/* Parse Errors Warning */}
            {parsedData.parseErrors && parsedData.parseErrors.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      {t('dataset_parseWarning')}
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                      {t('dataset_parseWarningMessage', { count: parsedData.parseErrors.length })}
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {parsedData.parseErrors.slice(0, 5).map((error, index) => (
                        <p key={index} className="text-xs text-amber-700 dark:text-amber-300">
                          • {error.message} {error.row && `(Row ${error.row})`}
                        </p>
                      ))}
                      {parsedData.parseErrors.length > 5 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                          ... and {parsedData.parseErrors.length - 5} more errors
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Display */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {parsedData.tabularData && parsedData.tabularData.length > 0 ? (
                <div>
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        {parsedData.tabularData.length > 0 && (
                          <tr>
                            {parsedData.tabularData[0].map((header, index) => (
                              <th
                                key={index}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        )}
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {parsedData.tabularData.slice(1).map((row, rowIndex) => (
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
                  {parsedData.tabularData.length > 1 && (
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <span>
                        {t('dataset_csvTableInfo', {
                          rows: parsedData.tabularData.length - 1,
                          columns: parsedData.tabularData[0]?.length || 0,
                        })}
                      </span>
                      {parsedData.parseErrors && parsedData.parseErrors.length > 0 && (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {t('dataset_parseErrorsCount', { count: parsedData.parseErrors.length })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : parsedData.content ? (
                <div className="p-4">
                  <pre className="bg-white dark:bg-gray-900 rounded-lg p-4 text-xs font-mono overflow-auto max-h-96 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 whitespace-pre-wrap">
                    {parsedData.content}
                  </pre>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    {t('dataset_noContentToDisplay')}
                  </p>
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
            onClick={onUpload}
            disabled={isUploading}
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
