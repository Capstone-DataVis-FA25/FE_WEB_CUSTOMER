'use client';

import type React from 'react';

import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, AlertCircle, Sparkles, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cleanExcelUpload, cleanCsv } from '@/features/ai/aiAPI';
import type { CleanCsvRequest } from '@/features/ai/aiTypes';

interface CleanDatasetWithAIProps {
  onCleanComplete?: (data: any, type: 'csv' | 'excel') => void;
  isProcessing?: boolean;
  onProcessingChange?: (processing: boolean) => void;
}

function CleanDatasetWithAI({
  onCleanComplete,
  isProcessing = false,
  onProcessingChange,
}: CleanDatasetWithAIProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('excel');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const [cleaningOptions, setCleaningOptions] = useState({
    thousandsSeparator: ',',
    decimalSeparator: '.',
    dateFormat: 'DD/MM/YYYY',
    notes: 'AI data cleaning',
  });

  const handleOptionChange = (key: keyof typeof cleaningOptions, value: string) => {
    setCleaningOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle Excel file upload
  const handleExcelFileSelect = async (file: File) => {
    if (!file.name.match(/\.(xlsx?|xls)$/i)) {
      setError('Please select a valid Excel file (.xlsx, .xls)');
      return;
    }

    setError(null);
    setIsLoading(true);
    onProcessingChange?.(true);

    try {
      const resp = await cleanExcelUpload(file, cleaningOptions);

      if (resp.code === 200 && Array.isArray(resp.data)) {
        // resp.data is a 2D matrix: [['col1','col2'], ['r1c1','r1c2'], ...]
        console.log('[v0] Cleaned Excel data (matrix):', resp.data);

        // Pass the raw matrix back to the caller (CreateDatasetPage expects a matrix)
        // CreateDatasetPage will convert the matrix to CSV/parsed data.
        onCleanComplete?.(resp.data, 'excel');
        setError(null);
      } else {
        setError(resp.message || 'Failed to clean Excel file');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error cleaning Excel file: ${errorMessage}`);
      console.error('[v0] Excel cleaning error:', err);
    } finally {
      setIsLoading(false);
      onProcessingChange?.(false);
    }
  };

  // Handle CSV text cleaning
  const handleCleanCsv = async () => {
    if (!csvText.trim()) {
      setError('Please enter CSV data');
      return;
    }

    setError(null);
    setIsLoading(true);
    onProcessingChange?.(true);

    try {
      const payload: CleanCsvRequest = {
        csv: csvText,
        thousandsSeparator: cleaningOptions.thousandsSeparator,
        decimalSeparator: cleaningOptions.decimalSeparator,
        dateFormat: cleaningOptions.dateFormat,
        schemaExample: '',
        notes: cleaningOptions.notes,
      };

      const resp = await cleanCsv(payload);

      if (resp.code === 200 && resp.data?.cleanedCsv) {
        console.log('[v0] Cleaned CSV:', resp.data.cleanedCsv);
        onCleanComplete?.(resp.data.cleanedCsv, 'csv');
        setCsvText('');
        setError(null);
      } else {
        setError(resp.message || 'Failed to clean CSV data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error cleaning CSV: ${errorMessage}`);
      console.error('[v0] CSV cleaning error:', err);
    } finally {
      setIsLoading(false);
      onProcessingChange?.(false);
    }
  };

  // File input handlers
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleExcelFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleExcelFileSelect(file);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Clean Dataset with AI
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Use AI to automatically clean and standardize your data. Choose between Excel files or
            CSV text.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Cleaning Options
              </span>
              {showAdvancedOptions ? (
                <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {showAdvancedOptions && (
              <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="thousandsSeparator"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Thousands Separator
                    </Label>
                    <Input
                      id="thousandsSeparator"
                      type="text"
                      value={cleaningOptions.thousandsSeparator}
                      onChange={e => handleOptionChange('thousandsSeparator', e.target.value)}
                      placeholder=","
                      maxLength={1}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      e.g., comma (,) or space ( )
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="decimalSeparator"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Decimal Separator
                    </Label>
                    <Input
                      id="decimalSeparator"
                      type="text"
                      value={cleaningOptions.decimalSeparator}
                      onChange={e => handleOptionChange('decimalSeparator', e.target.value)}
                      placeholder="."
                      maxLength={1}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      e.g., period (.) or comma (,)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="dateFormat"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Date Format
                    </Label>
                    <Input
                      id="dateFormat"
                      type="text"
                      value={cleaningOptions.dateFormat}
                      onChange={e => handleOptionChange('dateFormat', e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      e.g., DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="notes"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      type="text"
                      value={cleaningOptions.notes}
                      onChange={e => handleOptionChange('notes', e.target.value)}
                      placeholder="AI data cleaning"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Optional notes about the cleaning process
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Preview:</strong> Numbers will use{' '}
                    <strong>{cleaningOptions.thousandsSeparator}</strong> for thousands and{' '}
                    <strong>{cleaningOptions.decimalSeparator}</strong> for decimals. Dates will be
                    formatted as <strong>{cleaningOptions.dateFormat}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="excel" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Clean Excel File
              </TabsTrigger>
              <TabsTrigger value="csv" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Clean CSV Text
              </TabsTrigger>
            </TabsList>

            {/* Excel Tab */}
            <TabsContent value="excel" className="space-y-4">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
                ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={isLoading || isProcessing}
                />

                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {isDragOver
                        ? 'Drop your Excel file here'
                        : 'Click to upload or drag Excel file'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Supported formats: .xlsx, .xls
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      What AI will clean:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>
                        • Standardize number formats (thousands separator:{' '}
                        {cleaningOptions.thousandsSeparator})
                      </li>
                      <li>• Normalize decimal separators ({cleaningOptions.decimalSeparator})</li>
                      <li>• Format dates consistently ({cleaningOptions.dateFormat})</li>
                      <li>• Remove duplicates and inconsistencies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* CSV Tab */}
            <TabsContent value="csv" className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="csvInput"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Paste your CSV data
                </Label>
                <textarea
                  id="csvInput"
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder="ID,Name,Age,Salary&#10;1,John Doe,28,1234.56&#10;2,Jane Smith,34,2890.75"
                  className="w-full min-h-[300px] p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y focus:border-blue-200 dark:focus:border-blue-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isProcessing}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Paste your CSV data with headers in the first row
                </p>
              </div>

              <Button
                onClick={handleCleanCsv}
                disabled={!csvText.trim() || isLoading || isProcessing}
                className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoading ? 'Cleaning with AI...' : 'Clean CSV with AI'}
              </Button>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      What AI will clean:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>
                        • Standardize number formats (thousands separator:{' '}
                        {cleaningOptions.thousandsSeparator})
                      </li>
                      <li>• Normalize decimal separators ({cleaningOptions.decimalSeparator})</li>
                      <li>• Format dates consistently ({cleaningOptions.dateFormat})</li>
                      <li>• Clean and standardize text fields</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}

export default CleanDatasetWithAI;
