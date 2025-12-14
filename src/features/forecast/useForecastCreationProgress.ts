import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { axiosPrivate } from '@/services/axios';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface ForecastCreationJob {
  jobId: string;
  forecastId?: string;
  forecastName?: string;
  status: 'processing' | 'done' | 'error';
  startTime: string;
  hasReceivedUpdate?: boolean; // Track if job has received WebSocket update in this session
}

export function useForecastCreationProgress(userId?: string | number) {
  const [activeJobs, setActiveJobs] = useState<ForecastCreationJob[]>(() => {
    const saved = localStorage.getItem('forecast-creation-jobs');
    if (saved) {
      try {
        const jobs = JSON.parse(saved);
        // Only keep jobs that are still processing (running)
        const runningJobs = jobs.filter((job: ForecastCreationJob) => job.status === 'processing');
        // Mark restored jobs as not having received update yet (progress bar will be hidden)
        const restoredJobs = runningJobs.map(job => ({ ...job, hasReceivedUpdate: false }));
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
    localStorage.setItem('forecast-creation-jobs', JSON.stringify(activeJobs));
  }, [activeJobs]);

  // Connect to socket when userId is available
  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(`${SOCKET_URL}/user-notification`, {
      query: { userId: String(userId) },
    });

    console.log('[Socket][ForecastCreation] Connecting to', `${SOCKET_URL}/user-notification`);

    socketInstance.on('connect', () => {
      console.log('[Socket][ForecastCreation] Connected:', socketInstance.id);
    });

    socketInstance.on('notification:created', notification => {
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
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket][ForecastCreation] Disconnected');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

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
