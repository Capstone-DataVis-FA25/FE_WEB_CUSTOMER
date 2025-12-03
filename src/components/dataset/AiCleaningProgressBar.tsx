import React from 'react';
import { X, CheckCircle, AlertCircle, Loader2, FileSpreadsheet, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CleaningJob } from '@/features/ai/useAiCleaningProgress';
import { useTranslation } from 'react-i18next';

interface AiCleaningProgressBarProps {
  jobs: CleaningJob[];
  onJobClick: (jobId: string) => void;
  onRemove: (jobId: string) => void;
}

export const AiCleaningProgressBar: React.FC<AiCleaningProgressBarProps> = ({
  jobs,
  onJobClick,
  onRemove,
}) => {
  const { t } = useTranslation();

  if (jobs.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 space-y-2">
      <AnimatePresence>
        {jobs.map(job => (
          <motion.div
            key={job.jobId}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    {job.type === 'excel' ? (
                      <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {job.fileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {job.status === 'processing' && (
                        <>
                          {t('ai_clean_processing', 'Đang xử lý')} - {job.completed}/{job.total}{' '}
                          chunks
                        </>
                      )}
                      {job.status === 'done' && (
                        <span className="text-green-600 dark:text-green-400">
                          {t('ai_clean_completed', 'Hoàn thành')}
                        </span>
                      )}
                      {job.status === 'error' && (
                        <span className="text-red-600 dark:text-red-400">
                          {t('ai_clean_error', 'Lỗi')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Status Icon */}
                <div className="flex items-center gap-2">
                  {job.status === 'processing' && (
                    <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  )}
                  {job.status === 'done' && (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                  {job.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onRemove(job.jobId);
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Remove notification"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {job.status === 'processing' && (
                <div className="mb-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {job.progress}%
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button for Done Status */}
              {job.status === 'done' && (
                <button
                  onClick={() => onJobClick(job.jobId)}
                  className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {t('ai_clean_view_result', 'Xem kết quả')}
                </button>
              )}

              {/* Retry Button for Error Status */}
              {job.status === 'error' && (
                <button
                  onClick={() => onRemove(job.jobId)}
                  className="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                >
                  {t('ai_clean_dismiss', 'Đóng')}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
