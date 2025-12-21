import { useEffect, useState, useCallback, useRef } from 'react';
import { axiosPrivate } from '@/services/axios';
import { useSharedSocket } from '@/features/socket/useSharedSocket';

export interface ForecastCreationJob {
  jobId: string;
  forecastId?: string;
  forecastName?: string;
  status: 'processing' | 'done' | 'error';
  startTime: string;
  hasReceivedUpdate?: boolean; // Track if job has received WebSocket update in this session
}

export function useForecastCreationProgress(userId?: string | number) {
  const activeJobsRef = useRef<ForecastCreationJob[]>([]);
  const [activeJobs, setActiveJobs] = useState<ForecastCreationJob[]>(() => {
    const saved = localStorage.getItem('forecast-creation-jobs');
    if (saved) {
      try {
        const jobs = JSON.parse(saved);
        // Only keep jobs that are still processing (running)
        const runningJobs = jobs.filter((job: ForecastCreationJob) => job.status === 'processing');
        // Mark restored jobs as not having received update yet (progress bar will be hidden)
        const restoredJobs = runningJobs.map((job: any) => ({ ...job, hasReceivedUpdate: false }));
        // Clear completed/error jobs from localStorage
        if (runningJobs.length !== jobs.length) {
          localStorage.setItem('forecast-creation-jobs', JSON.stringify(restoredJobs));
        }
        return restoredJobs;
      } catch (err) {
        console.error('[useForecastCreationProgress] Failed to parse saved jobs:', err);
        return [];
      }
    }
    return [];
  });

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    activeJobsRef.current = activeJobs;
    localStorage.setItem('forecast-creation-jobs', JSON.stringify(activeJobs));
  }, [activeJobs]);

  const socket = useSharedSocket('user-notification', userId);

  // Connect to socket when userId is available
  useEffect(() => {
    if (!socket) return;

    console.log('[Socket][ForecastCreation] Using shared socket:', socket.id || 'connecting...');

    const handleConnect = async () => {
      console.log('[Socket][ForecastCreation] Connected:', socket.id);

      // Check restored jobs against backend - if forecast already exists, job is done (stale)
      const currentJobsSnapshot = activeJobsRef.current;
      const restoredJobs = currentJobsSnapshot.filter(j => !j.hasReceivedUpdate && j.forecastId);
      if (restoredJobs.length === 0) return;

      const staleJobIds: string[] = [];

      // Check each restored job against backend
      await Promise.all(
        restoredJobs.map(async job => {
          if (!job.forecastId) return;
          try {
            await axiosPrivate.get(`/forecasts/${job.forecastId}`);
            // Forecast exists - job completed, remove it
            console.log(
              '[Socket][ForecastCreation] Forecast exists, marking stale job:',
              job.jobId
            );
            staleJobIds.push(job.jobId);
          } catch (error: any) {
            // Forecast doesn't exist (404) - job might still be running, keep it
            // Only remove if it's a different error (like 500)
            if (error.response?.status !== 404) {
              console.log(
                '[Socket][ForecastCreation] Error checking forecast, marking stale job:',
                job.jobId,
                error.response?.status
              );
              staleJobIds.push(job.jobId);
            }
          }
        })
      );

      // Remove all stale jobs in one batch
      if (staleJobIds.length > 0) {
        console.log('[Socket][ForecastCreation] Removing stale jobs:', staleJobIds);
        setActiveJobs(jobs => jobs.filter(j => !staleJobIds.includes(j.jobId)));
      }
    };

    const handleNotification = (notification: any) => {
      console.log('[Socket][ForecastCreation] notification:created', notification);

      // Handle creation started
      if (notification.type === 'forecast-creation-started') {
        const { jobId } = notification;
        console.log('[Socket][ForecastCreation] Forecast creation started:', { jobId });

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
              status: 'processing',
              startTime: new Date().toISOString(),
              hasReceivedUpdate: true, // New job from WebSocket
            },
          ];
        });
      }

      // Handle completion
      if (notification.type === 'forecast-creation-done') {
        const { jobId, forecastId } = notification;
        console.log('[Socket][ForecastCreation] Forecast creation completed:', {
          jobId,
          forecastId,
        });

        setActiveJobs(jobs =>
          jobs.map(j =>
            j.jobId === jobId
              ? { ...j, status: 'done' as const, forecastId, hasReceivedUpdate: true }
              : j
          )
        );
      }

      // Handle error
      if (notification.type === 'forecast-creation-error') {
        const { jobId } = notification;
        console.log('[Socket][ForecastCreation] Forecast creation error:', jobId);

        setActiveJobs(jobs =>
          jobs.map(j => (j.jobId === jobId ? { ...j, status: 'error' as const } : j))
        );
      }
    };

    socket.on('connect', handleConnect);
    socket.on('notification:created', handleNotification);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('notification:created', handleNotification);
    };
  }, [socket, userId]);

  // Add a new job manually (when submitting)
  const addJob = useCallback((job: Omit<ForecastCreationJob, 'status' | 'startTime'>) => {
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
      if (!job || job.status !== 'done' || !job.forecastId) return;

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
