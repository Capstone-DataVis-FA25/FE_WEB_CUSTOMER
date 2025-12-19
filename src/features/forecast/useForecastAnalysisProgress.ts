import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { axiosPrivate } from '@/services/axios';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface ForecastAnalysisJob {
  jobId: string;
  forecastId: string;
  forecastName?: string;
  status: 'processing' | 'done' | 'error';
  startTime: string;
  hasReceivedUpdate?: boolean; // Track if job has received WebSocket update in this session
}

export function useForecastAnalysisProgress(userId?: string | number) {
  const activeJobsRef = useRef<ForecastAnalysisJob[]>([]);
  const [activeJobs, setActiveJobs] = useState<ForecastAnalysisJob[]>(() => {
    const saved = localStorage.getItem('forecast-analysis-jobs');
    if (saved) {
      try {
        const jobs = JSON.parse(saved);
        // Only keep jobs that are still processing (running)
        const runningJobs = jobs.filter((job: ForecastAnalysisJob) => job.status === 'processing');
        // Mark restored jobs as not having received update yet (progress bar will be hidden)
        const restoredJobs = runningJobs.map((job: any) => ({ ...job, hasReceivedUpdate: false }));
        // Clear completed/error jobs from localStorage
        if (runningJobs.length !== jobs.length) {
          localStorage.setItem('forecast-analysis-jobs', JSON.stringify(restoredJobs));
        }
        return restoredJobs;
      } catch (err) {
        console.error('[useForecastAnalysisProgress] Failed to parse saved jobs:', err);
        return [];
      }
    }
    return [];
  });

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    activeJobsRef.current = activeJobs;
    localStorage.setItem('forecast-analysis-jobs', JSON.stringify(activeJobs));
  }, [activeJobs]);

  // Connect to socket when userId is available
  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(`${SOCKET_URL}/user-notification`, {
      query: { userId: String(userId) },
    });

    console.log('[Socket][ForecastAnalysis] Connecting to', `${SOCKET_URL}/user-notification`);

    socketInstance.on('connect', async () => {
      console.log('[Socket][ForecastAnalysis] Connected:', socketInstance.id);

      // Check restored jobs against backend - if forecast already has analysis or doesn't exist, remove job
      const currentJobsSnapshot = activeJobsRef.current;
      const restoredJobs = currentJobsSnapshot.filter(j => !j.hasReceivedUpdate);
      if (restoredJobs.length === 0) return;

      const staleJobIds: string[] = [];

      // Check each restored job against backend
      await Promise.all(
        restoredJobs.map(async job => {
          try {
            const response = await axiosPrivate.get(`/forecasts/${job.forecastId}`);
            const forecast = response.data?.data || response.data;

            // If forecast already has analysis, job is done (stale)
            if (forecast?.analyze) {
              console.log(
                '[Socket][ForecastAnalysis] Forecast already has analysis, marking stale job:',
                job.jobId
              );
              staleJobIds.push(job.jobId);
            }
            // If forecast exists but no analysis yet, job might still be running - keep it
          } catch (error: any) {
            // Forecast doesn't exist (404) or other error - job is stale
            console.log(
              '[Socket][ForecastAnalysis] Forecast not found or error, marking stale job:',
              job.jobId,
              error.response?.status
            );
            staleJobIds.push(job.jobId);
          }
        })
      );

      // Remove all stale jobs in one batch
      if (staleJobIds.length > 0) {
        console.log('[Socket][ForecastAnalysis] Removing stale jobs:', staleJobIds);
        setActiveJobs(jobs => jobs.filter(j => !staleJobIds.includes(j.jobId)));
      }
    });

    socketInstance.on('notification:created', notification => {
      console.log('[Socket][ForecastAnalysis] notification:created', notification);

      // Handle analysis started
      if (notification.type === 'forecast-analysis-started') {
        const { jobId, forecastId } = notification;
        console.log('[Socket][ForecastAnalysis] Analysis started:', { jobId, forecastId });

        setActiveJobs(jobs => {
          const existing = jobs.find(j => j.jobId === jobId);
          if (existing) {
            // Mark as having received update
            return jobs.map(j => (j.jobId === jobId ? { ...j, hasReceivedUpdate: true } : j));
          }

          return [
            ...jobs,
            {
              jobId,
              forecastId,
              status: 'processing',
              startTime: new Date().toISOString(),
              hasReceivedUpdate: true, // New job from WebSocket
            },
          ];
        });
      }

      // Handle completion
      if (notification.type === 'forecast-analysis-done') {
        const { jobId } = notification;
        console.log('[Socket][ForecastAnalysis] Analysis completed:', jobId);

        setActiveJobs(jobs =>
          jobs.map(j =>
            j.jobId === jobId ? { ...j, status: 'done' as const, hasReceivedUpdate: true } : j
          )
        );
      }

      // Handle error
      if (notification.type === 'forecast-analysis-error') {
        const { jobId } = notification;
        console.log('[Socket][ForecastAnalysis] Analysis error:', jobId);

        setActiveJobs(jobs =>
          jobs.map(j => (j.jobId === jobId ? { ...j, status: 'error' as const } : j))
        );
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket][ForecastAnalysis] Disconnected');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  // Add a new job manually (when submitting)
  const addJob = useCallback((job: Omit<ForecastAnalysisJob, 'status' | 'startTime'>) => {
    setActiveJobs(jobs => {
      const existing = jobs.find(j => j.jobId === job.jobId);
      if (existing) return jobs; // Don't add duplicate

      return [
        ...jobs,
        {
          ...job,
          status: 'processing',
          startTime: new Date().toISOString(),
          hasReceivedUpdate: true, // Newly created job
        },
      ];
    });
  }, []);

  // Remove a job from the list
  const removeJob = useCallback((jobId: string) => {
    setActiveJobs(jobs => jobs.filter(j => j.jobId !== jobId));
  }, []);

  // Handle clicking on a completed job to navigate to forecast
  const handleJobClick = useCallback(
    async (jobId: string, onNavigate?: (forecastId: string) => void) => {
      const job = activeJobs.find(j => j.jobId === jobId);
      if (!job || job.status !== 'done') return;

      if (onNavigate) {
        onNavigate(job.forecastId);
      }
      removeJob(jobId);
    },
    [activeJobs, removeJob]
  );

  return {
    activeJobs,
    addJob,
    removeJob,
    handleJobClick,
  };
}
