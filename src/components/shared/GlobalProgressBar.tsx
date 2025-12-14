import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useAiCleaningProgress } from '@/features/ai/useAiCleaningProgress';
import { useForecastCreationProgress } from '@/features/forecast/useForecastCreationProgress';
import { useForecastAnalysisProgress } from '@/features/forecast/useForecastAnalysisProgress';
import { UnifiedProgressBar, type UnifiedJobType } from './UnifiedProgressBar';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useTranslation } from 'react-i18next';

export const GlobalProgressBar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showError, showSuccess } = useToastContext();

  // Get all job types
  const {
    activeJobs: cleaningJobs,
    removeJob: removeCleaningJob,
    handleJobClick: handleCleaningJobClick,
  } = useAiCleaningProgress(user?.id);
  const {
    activeJobs: creationJobs,
    removeJob: removeCreationJob,
    handleJobClick: handleCreationJobClick,
  } = useForecastCreationProgress(user?.id);
  const {
    activeJobs: analysisJobs,
    removeJob: removeAnalysisJob,
    handleJobClick: handleAnalysisJobClick,
  } = useForecastAnalysisProgress(user?.id);

  // Track previous job statuses to detect transitions (processing -> done)
  // This prevents showing toasts for jobs that were already completed before page load
  const prevJobStatusesRef = useRef<{
    cleaning: Map<string, 'processing' | 'done' | 'error'>;
    creation: Map<string, 'processing' | 'done' | 'error'>;
    analysis: Map<string, 'processing' | 'done' | 'error'>;
  }>({
    cleaning: new Map(),
    creation: new Map(),
    analysis: new Map(),
  });
  const isInitializedRef = useRef(false);

  // Initialize with current job statuses on first render
  useEffect(() => {
    if (!isInitializedRef.current) {
      cleaningJobs.forEach(job => {
        prevJobStatusesRef.current.cleaning.set(job.jobId, job.status);
      });
      creationJobs.forEach(job => {
        prevJobStatusesRef.current.creation.set(job.jobId, job.status);
      });
      analysisJobs.forEach(job => {
        prevJobStatusesRef.current.analysis.set(job.jobId, job.status);
      });
      isInitializedRef.current = true;
    }
  }, []); // Only run once on mount

  // Show toast when jobs transition from processing -> done (only during this session)
  useEffect(() => {
    // Skip if not initialized yet
    if (!isInitializedRef.current) return;

    // Check cleaning jobs - only show toast if status changed from processing to done
    cleaningJobs.forEach(job => {
      const prevStatus = prevJobStatusesRef.current.cleaning.get(job.jobId);
      if (prevStatus === 'processing' && job.status === 'done') {
        showSuccess(
          t('ai_clean_completed', 'Hoàn thành'),
          t('notification_clean_ready', 'Dữ liệu đã clean sẵn sàng')
        );
      }
      prevJobStatusesRef.current.cleaning.set(job.jobId, job.status);
    });

    // Check forecast creation jobs
    creationJobs.forEach(job => {
      const prevStatus = prevJobStatusesRef.current.creation.get(job.jobId);
      if (prevStatus === 'processing' && job.status === 'done') {
        showSuccess(
          t('forecast.creation.completed', 'Completed'),
          t('notification_forecast_ready', 'Forecast đã sẵn sàng')
        );
      }
      prevJobStatusesRef.current.creation.set(job.jobId, job.status);
    });

    // Check forecast analysis jobs
    analysisJobs.forEach(job => {
      const prevStatus = prevJobStatusesRef.current.analysis.get(job.jobId);
      if (prevStatus === 'processing' && job.status === 'done') {
        showSuccess(
          t('forecast.analysis.completed', 'Completed'),
          t('notification_forecast_analysis_ready', 'Phân tích forecast đã sẵn sàng')
        );
      }
      prevJobStatusesRef.current.analysis.set(job.jobId, job.status);
    });
  }, [cleaningJobs, creationJobs, analysisJobs, showSuccess, t]);

  // Combine all jobs into unified format - ONLY show processing/error jobs (not done)
  // Completed jobs are handled by the notification bell
  const allJobs: UnifiedJobType[] = [
    ...cleaningJobs
      .filter(job => job.status !== 'done')
      .map(job => ({
        type: 'clean-dataset' as const,
        jobId: job.jobId,
        fileName: job.fileName,
        progress: job.progress,
        completed: job.completed,
        total: job.total,
        status: job.status,
        startTime: job.startTime,
        fileType: job.type,
        hasReceivedUpdate: job.hasReceivedUpdate,
      })),
    ...creationJobs
      .filter(job => job.status !== 'done')
      .map(job => ({
        type: 'forecast-creation' as const,
        jobId: job.jobId,
        forecastName: job.forecastName,
        status: job.status,
        startTime: job.startTime,
        forecastId: job.forecastId,
        hasReceivedUpdate: job.hasReceivedUpdate,
      })),
    ...analysisJobs
      .filter(job => job.status !== 'done')
      .map(job => ({
        type: 'forecast-analysis' as const,
        jobId: job.jobId,
        forecastId: job.forecastId,
        status: job.status,
        startTime: job.startTime,
        hasReceivedUpdate: job.hasReceivedUpdate,
      })),
  ];

  const handleJobClick = (job: UnifiedJobType) => {
    if (job.type === 'clean-dataset') {
      handleCleaningJobClick(
        job.jobId,
        (data, type) => {
          navigate('/datasets/create', {
            state: { cleanedData: data, jobId: job.jobId, fileType: type },
          });
        },
        err => {
          showError(
            t('ai_clean_error_title', 'Lỗi lấy kết quả'),
            err?.message || t('ai_clean_error_message', 'Không thể lấy kết quả làm sạch')
          );
        }
      );
    } else if (job.type === 'forecast-creation' && job.forecastId) {
      navigate(`/forecast/${job.forecastId}`);
      removeCreationJob(job.jobId);
    } else if (job.type === 'forecast-analysis') {
      handleAnalysisJobClick(job.jobId, forecastId => {
        navigate(`/forecast/${forecastId}`);
      });
    }
  };

  const handleRemove = (jobId: string) => {
    // Try to remove from all job lists (only one will match)
    removeCleaningJob(jobId);
    removeCreationJob(jobId);
    removeAnalysisJob(jobId);
  };

  return <UnifiedProgressBar jobs={allJobs} onJobClick={handleJobClick} onRemove={handleRemove} />;
};
