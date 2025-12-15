import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Unified job type
export type UnifiedJobType =
  | {
      type: 'clean-dataset';
      jobId: string;
      fileName: string;
      progress: number;
      completed: number;
      total: number;
      status: 'processing' | 'done' | 'error';
      startTime: string;
      fileType: 'csv' | 'excel';
      hasReceivedUpdate?: boolean;
    }
  | {
      type: 'forecast-creation';
      jobId: string;
      forecastName?: string;
      status: 'processing' | 'done' | 'error';
      startTime: string;
      forecastId?: string;
      hasReceivedUpdate?: boolean;
    }
  | {
      type: 'forecast-analysis';
      jobId: string;
      forecastId: string;
      status: 'processing' | 'done' | 'error';
      startTime: string;
      hasReceivedUpdate?: boolean;
    };

interface UnifiedProgressBarProps {
  jobs: UnifiedJobType[];
  onJobClick: (job: UnifiedJobType) => void;
  onRemove: (jobId: string) => void;
}

export const UnifiedProgressBar: React.FC<UnifiedProgressBarProps> = ({
  jobs,
  onJobClick,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem('unified-progress-minimized');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('unified-progress-minimized', String(isMinimized));
  }, [isMinimized]);

  if (jobs.length === 0) return null;

  // Minimized view
  if (isMinimized) {
    const processingCount = jobs.filter(j => j.status === 'processing').length;
    const doneCount = jobs.filter(j => j.status === 'done').length;
    const errorCount = jobs.filter(j => j.status === 'error').length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-40 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-2">
            {processingCount > 0 && (
              <div className="flex items-center gap-1">
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {processingCount}
                </span>
              </div>
            )}
            {doneCount > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {doneCount}
                </span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {errorCount}
                </span>
              </div>
            )}
          </div>
          <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
        </button>
      </motion.div>
    );
  }

  const getJobConfig = (job: UnifiedJobType) => {
    if (job.type === 'clean-dataset') {
      return {
        title: job.fileName,
        getStatusText: () => {
          if (job.status === 'processing') {
            return `${t('ai_clean_processing', 'Đang xử lý')} - ${job.completed}/${job.total} chunks`;
          }
          if (job.status === 'done') {
            return t('ai_clean_completed', 'Hoàn thành');
          }
          return t('ai_clean_error', 'Lỗi');
        },
        getStatusColor: () => {
          if (job.status === 'processing') return 'text-blue-600 dark:text-blue-400';
          if (job.status === 'done') return 'text-green-600 dark:text-green-400';
          return 'text-red-600 dark:text-red-400';
        },
        progress: job.progress,
        buttonText: t('ai_clean_view_result', 'Xem kết quả'),
      };
    }

    if (job.type === 'forecast-creation') {
      return {
        title: job.forecastName || t('forecast_creation_default_name', 'New Forecast'),
        getStatusText: () => {
          if (job.status === 'processing') {
            return t('forecast.creation.processing', 'Creating forecast...');
          }
          if (job.status === 'done') {
            return t('forecast.creation.completed', 'Completed');
          }
          return t('forecast.creation.error', 'Error');
        },
        getStatusColor: () => {
          if (job.status === 'processing') return 'text-blue-600 dark:text-blue-400';
          if (job.status === 'done') return 'text-green-600 dark:text-green-400';
          return 'text-red-600 dark:text-red-400';
        },
        progress: 0,
        buttonText: t('forecast.creation.view_result', 'View Forecast'),
      };
    }

    // forecast-analysis
    return {
      title: t('forecast_analysis_job_title', 'Forecast Analysis'),
      getStatusText: () => {
        if (job.status === 'processing') {
          return t('forecast.analysis.processing', 'Analyzing...');
        }
        if (job.status === 'done') {
          return t('forecast.analysis.completed', 'Completed');
        }
        return t('forecast.analysis.error', 'Error');
      },
      getStatusColor: () => {
        if (job.status === 'processing') return 'text-blue-600 dark:text-blue-400';
        if (job.status === 'done') return 'text-green-600 dark:text-green-400';
        return 'text-red-600 dark:text-red-400';
      },
      progress: 0,
      buttonText: t('forecast.analysis.view_result', 'View Forecast'),
    };
  };

  // Sort jobs: newest first (most recent at top)
  const sortedJobs = [...jobs].sort((a, b) => {
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    return timeB - timeA; // Newest first
  });

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      {/* Minimize button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsMinimized(true)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      {/* Scrollable container */}
      <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
        <AnimatePresence>
          {sortedJobs.map(job => {
            const config = getJobConfig(job);

            return (
              <motion.div
                key={job.jobId}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-3">
                  {/* Header - Compact, no icon */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {config.title}
                      </p>
                      <p className={`text-xs ${config.getStatusColor()}`}>
                        {config.getStatusText()}
                      </p>
                    </div>

                    {/* Status Icon and Close */}
                    <div className="flex items-center gap-2 ml-2">
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
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
                        aria-label="Remove notification"
                        title="Remove from progress bar"
                      >
                        <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar - Only show if job has received WebSocket update (not stale from localStorage) */}
                  {job.status === 'processing' && job.hasReceivedUpdate !== false && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                        {job.type === 'clean-dataset' ? (
                          // Actual progress for dataset cleaning
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${config.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        ) : (
                          // Indeterminate progress for forecast jobs (sliding animation)
                          <motion.div
                            className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            animate={{
                              x: ['-100%', '300%'],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button for Done Status */}
                  {job.status === 'done' && (
                    <button
                      onClick={() => onJobClick(job)}
                      className="w-full mt-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-medium rounded-md transition-all duration-200 cursor-pointer"
                    >
                      {config.buttonText}
                    </button>
                  )}

                  {/* Dismiss Button for Error Status */}
                  {job.status === 'error' && (
                    <button
                      onClick={() => onRemove(job.jobId)}
                      className="w-full mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-md transition-all duration-200 cursor-pointer"
                    >
                      {t('ai_clean_dismiss', 'Đóng')}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
