import type React from 'react';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, AlertCircle, Sparkles, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cleanExcelAsync, cleanCsvAsync, getCleanResult } from '@/features/ai/aiAPI';
import { io } from 'socket.io-client';
import { cleanExcelUpload, cleanCsv } from '@/features/ai/aiAPI';
import type { CleanCsvRequest } from '@/features/ai/aiTypes';
import { useTranslation } from 'react-i18next';
import { useToastContext } from '@/components/providers/ToastProvider';

interface CleanDatasetWithAIProps {
  onCleanComplete?: (data: any, type: 'csv' | 'excel') => void;
  isProcessing?: boolean;
  onProcessingChange?: (processing: boolean) => void;
  userId?: string; // Thêm userId để gửi lên BE và lắng nghe socket
}

function CleanDatasetWithAI({
  onCleanComplete,
  isProcessing = false,
  onProcessingChange,
  userId,
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
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [jobType, setJobType] = useState<'csv' | 'excel' | null>(null);

  const [cleaningOptions, setCleaningOptions] = useState({
    thousandsSeparator: '',
    decimalSeparator: '',
    notes: '',
  });

  const { t } = useTranslation();
  const { showSuccess } = useToastContext();

  const handleOptionChange = (key: keyof typeof cleaningOptions, value: string) => {
    setCleaningOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Lắng nghe socket notification khi có jobId xong
  useEffect(() => {
    if (!effectiveUserId || !pendingJobId) return;
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000', {
      query: { userId: effectiveUserId },
      path: '/user-notification/socket.io',
    });
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });
    socket.on('notification:created', noti => {
      if (noti.type === 'clean-dataset-done' && noti.jobId === pendingJobId) {
        getCleanResult(noti.jobId).then(result => {
          onCleanComplete?.(result.data, jobType!);
          showSuccess(
            t('ai_clean_success_title', 'Dữ liệu đã được làm sạch'),
            t('ai_clean_success_desc', 'Bạn sẽ được chuyển sang bước tiếp theo để tạo dataset.')
          );
          setPendingJobId(null);
        });
      }
    });
    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });
    return () => {
      socket.disconnect();
    };
  }, [pendingJobId, effectiveUserId, jobType, onCleanComplete, t, showSuccess]);

  // Handle Excel file upload (ASYNC)
  const handleExcelFileSelect = async (file: File) => {
    if (!file.name.match(/\.(xlsx?|xls)$/i)) {
      setError('Please select a valid Excel file (.xlsx, .xls)');
      return;
    }
    setError(null);
    setIsLoading(true);
    onProcessingChange?.(true);
    try {
      if (!effectiveUserId) throw new Error('Missing userId');
      const resp = await cleanExcelAsync(file, {
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
        setPendingJobId(resp.jobId);
        setJobType('excel');
        showSuccess(
          t('ai_clean_upload_success_title', 'Đã gửi file Excel để làm sạch'),
          t('ai_clean_upload_success_desc', 'Bạn sẽ nhận được thông báo khi hoàn tất.')
        );
      } else {
        setError(t('ai_clean_no_jobid', 'Không nhận được jobId từ server'));
      }
    } catch (err) {
      setError(t('ai_clean_send_failed', 'Gửi job thất bại'));
    } finally {
      setIsLoading(false);
      onProcessingChange?.(false);
    }
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
        setPendingJobId(resp.jobId);
        setJobType('csv');
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

  // Handle Excel or CSV file upload (ASYNC)
  const handleFileSelect = async (file: File) => {
    const isExcel = file.name.match(/\.(xlsx?|xls)$/i);
    const isCsv = file.name.match(/\.csv$/i);
    if (!isExcel && !isCsv) {
      setError('Please select a valid Excel or CSV file (.xlsx, .xls, .csv)');
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
      if (isExcel) {
        const resp = await cleanExcelAsync(file, {
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
          setPendingJobId(resp.jobId);
          setJobType('excel');
          showSuccess(
            t('ai_clean_upload_success_title', 'Đã gửi file Excel để làm sạch'),
            t('ai_clean_upload_success_desc', 'Bạn sẽ nhận được thông báo khi hoàn tất.')
          );
        } else {
          setError(t('ai_clean_no_jobid', 'Không nhận được jobId từ server'));
        }
      } else if (isCsv) {
        const text = await file.text();
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
          setPendingJobId(resp.jobId);
          setJobType('csv');
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
                      placeholder="Default: , (comma)"
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
                      placeholder="Default: . (dot)"
                      maxLength={1}
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
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
                      Notes
                    </Label>
                    <textarea
                      id="notes"
                      value={cleaningOptions.notes}
                      onChange={e => handleOptionChange('notes', e.target.value)}
                      placeholder="Optional notes for AI. Leave empty to use default behaviour."
                      className="w-full min-h-[80px] p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Optional notes about the cleaning process (multiple lines supported)
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Preview:</strong> Numbers will use{' '}
                    <strong>{cleaningOptions.thousandsSeparator || ','}</strong> for thousands and{' '}
                    <strong>{cleaningOptions.decimalSeparator || '.'}</strong> for decimals.
                  </p>
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
