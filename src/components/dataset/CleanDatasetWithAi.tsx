import type React from 'react';

import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, AlertCircle, Sparkles, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { cleanExcelAsync, cleanCsvAsync } from '@/features/ai/aiAPI';
import type { CleanCsvRequest } from '@/features/ai/aiTypes';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '@/components/providers/ToastProvider';

interface CleanDatasetWithAIProps {
  onCleanComplete?: (data: any, type: 'csv' | 'excel') => void;
  isProcessing?: boolean;
  onProcessingChange?: (processing: boolean) => void;
  userId?: string; // Thêm userId để gửi lên BE
  onJobSubmit?: (jobId: string, fileName: string, type: 'csv' | 'excel') => void; // Callback khi submit job
}

function CleanDatasetWithAI({
  isProcessing = false,
  onProcessingChange,
  userId,
  onJobSubmit,
}: CleanDatasetWithAIProps) {
  // Lấy userId từ localStorage nếu prop userId không có
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const effectiveUserId = userId || localUser.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('excel');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [cleaningOptions, setCleaningOptions] = useState({
    thousandsSeparator: '',
    decimalSeparator: '',
    notes: '',
    // Cleaning rules checkboxes (default enabled)
    removeDuplicates: true,
    fixDataTypes: true,
    missingStrategy: 'auto', // 'remove' | 'fill_mean' | 'fill_mode' | 'auto'
    outlierStrategy: 'auto', // 'remove' | 'fill_mean' | 'fill_mode' | 'auto'
    standardizeFormats: true,
    standardizeUnits: false,
  });

  const { t } = useTranslation();
  const { showSuccess, showError } = useToastContext();

  const handleOptionChange = (key: keyof typeof cleaningOptions, value: string | boolean) => {
    setCleaningOptions(prev => ({ ...prev, [key]: value }));
  };

  // Handle CSV text cleaning (ASYNC)
  const handleCleanCsv = async () => {
    if (!csvText.trim()) {
      setError('Please enter CSV data');
      return;
    }
    setError(null);
    setIsLoading(true);
    onProcessingChange?.(true);
    showSuccess(
      t('ai_clean_sending_title', 'Đang gửi dữ liệu để làm sạch'),
      t('ai_clean_sending_desc', 'Vui lòng đợi, chúng tôi đang xử lý dữ liệu của bạn...')
    );
    try {
      if (!effectiveUserId) throw new Error('Missing userId');
      const payload: CleanCsvRequest = {
        csv: csvText,
        // chỉ gửi nếu người dùng nhập, nếu rỗng để BE dùng default
        ...(cleaningOptions.thousandsSeparator && {
          thousandsSeparator: cleaningOptions.thousandsSeparator,
        }),
        ...(cleaningOptions.decimalSeparator && {
          decimalSeparator: cleaningOptions.decimalSeparator,
        }),
        schemaExample: '',
        ...(cleaningOptions.notes && { notes: cleaningOptions.notes }),
        userId: effectiveUserId,
      };
      console.log('Submitting cleanCsvAsync payload:', payload);
      const resp = await cleanCsvAsync(payload);
      console.log('cleanCsvAsync response:', resp);
      if (resp.jobId) {
        onJobSubmit?.(resp.jobId, 'CSV Data', 'csv');
      } else {
        setError('Không nhận được jobId từ server');
      }
    } catch (err) {
      console.error('Gửi job thất bại:', err);
      setError('Gửi job thất bại');
    } finally {
      setIsLoading(false);
      onProcessingChange?.(false);
    }
  };

  // Handle file selection (just store the file, don't process yet)
  const handleFileSelect = (file: File) => {
    const isExcel = file.name.match(/\.(xlsx?|xls)$/i);
    const isCsv = file.name.match(/\.csv$/i);
    if (!isExcel && !isCsv) {
      setError('Please select a valid Excel or CSV file (.xlsx, .xls, .csv)');
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  // Handle Excel or CSV file cleaning (ASYNC) - triggered by button click
  const handleCleanFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    setError(null);
    setIsLoading(true);
    onProcessingChange?.(true);
    try {
      if (!effectiveUserId) throw new Error('Missing userId');
      const isExcel = selectedFile.name.match(/\.(xlsx?|xls)$/i);
      const isCsv = selectedFile.name.match(/\.csv$/i);

      if (isExcel) {
        const resp = await cleanExcelAsync(selectedFile, {
          ...(cleaningOptions.thousandsSeparator && {
            thousandsSeparator: cleaningOptions.thousandsSeparator,
          }),
          ...(cleaningOptions.decimalSeparator && {
            decimalSeparator: cleaningOptions.decimalSeparator,
          }),
          ...(cleaningOptions.notes && { notes: cleaningOptions.notes }),
          userId: effectiveUserId,
        });
        if (resp.jobId) {
          onJobSubmit?.(resp.jobId, selectedFile.name, 'excel');
          showSuccess(
            t('ai_clean_upload_success_title', 'Đã gửi file Excel để làm sạch'),
            t('ai_clean_upload_success_desc', 'Bạn sẽ nhận được thông báo khi hoàn tất.')
          );
        } else {
          setError(t('ai_clean_no_jobid', 'Không nhận được jobId từ server'));
        }
      } else if (isCsv) {
        const text = await selectedFile.text();
        // Check if CSV has only header or only header + empty/whitespace row
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
        if (lines.length <= 1) {
          const msg = t(
            'ai_clean_csv_no_data',
            'File CSV chỉ có header, không có dữ liệu để làm sạch.'
          );
          setError(msg);
          showError?.(msg);
          setIsLoading(false);
          onProcessingChange?.(false);
          return;
        }
        // Check if all data rows (except header) are empty or whitespace
        const dataRows = lines.slice(1);
        const hasValidData = dataRows.some(row => row.split(',').some(cell => cell.trim() !== ''));
        if (!hasValidData) {
          const msg = t('ai_clean_csv_no_data', 'File CSV không có dữ liệu hợp lệ để làm sạch.');
          setError(msg);
          showError?.(msg);
          setIsLoading(false);
          onProcessingChange?.(false);
          return;
        }
        // Only show success toast after validation passes
        showSuccess(
          t('ai_clean_sending_title', 'Đang gửi dữ liệu để làm sạch'),
          t('ai_clean_sending_desc', 'Vui lòng đợi, chúng tôi đang xử lý dữ liệu của bạn...')
        );
        const payload: CleanCsvRequest = {
          csv: text,
          ...(cleaningOptions.thousandsSeparator && {
            thousandsSeparator: cleaningOptions.thousandsSeparator,
          }),
          ...(cleaningOptions.decimalSeparator && {
            decimalSeparator: cleaningOptions.decimalSeparator,
          }),
          schemaExample: '',
          ...(cleaningOptions.notes && { notes: cleaningOptions.notes }),
          userId: effectiveUserId,
        };
        const resp = await cleanCsvAsync(payload);
        if (resp.jobId) {
          onJobSubmit?.(resp.jobId, selectedFile.name, 'csv');
          showSuccess(
            t('ai_clean_upload_success_title', 'Đã gửi file CSV để làm sạch'),
            t('ai_clean_upload_success_desc', 'Bạn sẽ nhận được thông báo khi hoàn tất.')
          );
        } else {
          setError(t('ai_clean_no_jobid', 'Không nhận được jobId từ server'));
        }
      }
    } catch (err) {
      setError(t('ai_clean_send_failed', 'Gửi job thất bại'));
    } finally {
      setIsLoading(false);
      onProcessingChange?.(false);
    }
  };

  // File input handlers
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
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
      handleFileSelect(file);
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
                {/* Cleaning Rules Checkboxes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Cleaning Rules
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={cleaningOptions.removeDuplicates}
                        onChange={e => handleOptionChange('removeDuplicates', e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 block">
                          Remove duplicates
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Remove exact duplicate rows
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={cleaningOptions.fixDataTypes}
                        onChange={e => handleOptionChange('fixDataTypes', e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 block">
                          Fix data types
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Convert strings to numbers
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={cleaningOptions.standardizeFormats}
                        onChange={e => handleOptionChange('standardizeFormats', e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 block">
                          Standardize formats
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Normalize dates, phones, etc.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={cleaningOptions.standardizeUnits}
                        onChange={e => handleOptionChange('standardizeUnits', e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 block">
                          Standardize units
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Convert to consistent units
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Advanced Strategies
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Missing value strategy dropdown */}
                    <div className="space-y-2">
                      <label
                        htmlFor="missingStrategy"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 block"
                      >
                        Missing value strategy
                      </label>
                      <select
                        id="missingStrategy"
                        className="w-full min-w-[180px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-auto"
                        style={{ minWidth: 180, paddingLeft: 8, paddingRight: 32 }}
                        value={cleaningOptions.missingStrategy}
                        onChange={e => handleOptionChange('missingStrategy', e.target.value)}
                      >
                        <option value="auto">Auto fill</option>
                        <option value="remove">Remove rows with missing values</option>
                        <option value="fill_mean">Fill with mean</option>
                        <option value="fill_mode">Fill with mode</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Choose how to handle missing values
                      </p>
                    </div>

                    {/* Outlier strategy dropdown */}
                    <div className="space-y-2">
                      <label
                        htmlFor="outlierStrategy"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 block"
                      >
                        Outlier strategy
                      </label>
                      <select
                        id="outlierStrategy"
                        className="w-full min-w-[180px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-auto"
                        style={{ minWidth: 180, paddingLeft: 8, paddingRight: 32 }}
                        value={cleaningOptions.outlierStrategy}
                        onChange={e => handleOptionChange('outlierStrategy', e.target.value)}
                      >
                        <option value="auto">Auto</option>
                        <option value="remove">Remove rows with outliers</option>
                        <option value="fill_mean">Fill with mean</option>
                        <option value="fill_mode">Fill with mode</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Choose how to handle outliers
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-600"></div>

                {/* Format Settings */}
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
                      placeholder="None (default)"
                      maxLength={1}
                      className="bg-background"
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
                      placeholder="Default: . (dot)"
                      maxLength={1}
                      className="bg-background"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      e.g., period (.) or comma (,)
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="notes"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Additional Notes
                    </Label>
                    <textarea
                      id="notes"
                      value={cleaningOptions.notes}
                      onChange={e => handleOptionChange('notes', e.target.value)}
                      placeholder="Optional: Add custom cleaning instructions..."
                      className="w-full min-h-[80px] p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Provide any specific cleaning requirements
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="excel" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {t('ai_clean_tab_file', 'Clean File (Excel/CSV)')}
              </TabsTrigger>
              <TabsTrigger value="csv" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('ai_clean_tab_csv', 'Clean CSV Text')}
              </TabsTrigger>
            </TabsList>

            {/* File Tab (Excel/CSV) */}
            <TabsContent value="excel" className="space-y-4">
              {!selectedFile ? (
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
                    accept=".xlsx,.xls,.csv"
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
                          ? t('ai_clean_drop_file', 'Thả file Excel hoặc CSV vào đây')
                          : t(
                              'ai_clean_click_upload',
                              'Click để tải lên hoặc kéo thả file Excel/CSV'
                            )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('ai_clean_supported_formats', 'Hỗ trợ: .xlsx, .xls, .csv')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCleanFile}
                disabled={!selectedFile || isLoading || isProcessing}
                className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoading ? 'Cleaning with AI...' : 'Clean File with AI'}
              </Button>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      AI will apply:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      {cleaningOptions.removeDuplicates && <li>• Remove duplicate rows</li>}
                      {cleaningOptions.fixDataTypes && <li>• Fix data types</li>}
                      {cleaningOptions.missingStrategy === 'remove' && (
                        <li>• Remove all missing values</li>
                      )}
                      {cleaningOptions.missingStrategy === 'fill_mean' && (
                        <li>• Fill missing values with mean</li>
                      )}
                      {cleaningOptions.missingStrategy === 'fill_mode' && (
                        <li>• Fill missing values with mode</li>
                      )}
                      {cleaningOptions.missingStrategy === 'auto' && (
                        <li>• Auto fill missing values</li>
                      )}
                      {cleaningOptions.outlierStrategy === 'remove' && (
                        <li>• Remove rows with outliers</li>
                      )}
                      {cleaningOptions.outlierStrategy === 'fill_mean' && (
                        <li>• Fill outliers with mean</li>
                      )}
                      {cleaningOptions.outlierStrategy === 'fill_mode' && (
                        <li>• Fill outliers with mode</li>
                      )}
                      {cleaningOptions.outlierStrategy === 'auto' && (
                        <li>• Auto handle outliers</li>
                      )}
                      {cleaningOptions.standardizeFormats && <li>• Standardize formats</li>}
                      {cleaningOptions.standardizeUnits && <li>• Standardize units</li>}
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
                      AI will apply:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      {cleaningOptions.removeDuplicates && <li>• Remove duplicate rows</li>}
                      {cleaningOptions.fixDataTypes && <li>• Fix data types</li>}
                      {cleaningOptions.missingStrategy === 'remove' && (
                        <li>• Remove all missing values</li>
                      )}
                      {cleaningOptions.missingStrategy === 'fill_mean' && (
                        <li>• Fill missing values with mean</li>
                      )}
                      {cleaningOptions.missingStrategy === 'fill_mode' && (
                        <li>• Fill missing values with mode</li>
                      )}
                      {cleaningOptions.missingStrategy === 'auto' && (
                        <li>• Auto fill missing values</li>
                      )}
                      {cleaningOptions.outlierStrategy === 'remove' && (
                        <li>• Remove rows with outliers</li>
                      )}
                      {cleaningOptions.outlierStrategy === 'fill_mean' && (
                        <li>• Fill outliers with mean</li>
                      )}
                      {cleaningOptions.outlierStrategy === 'fill_mode' && (
                        <li>• Fill outliers with mode</li>
                      )}
                      {cleaningOptions.outlierStrategy === 'auto' && (
                        <li>• Auto handle outliers</li>
                      )}
                      {cleaningOptions.standardizeFormats && <li>• Standardize formats</li>}
                      {cleaningOptions.standardizeUnits && <li>• Standardize units</li>}
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
