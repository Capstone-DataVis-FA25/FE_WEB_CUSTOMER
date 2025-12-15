import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getCleanResult } from './aiAPI';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface CleaningJob {
  jobId: string;
  fileName: string;
  progress: number; // 0-100
  completed: number;
  total: number;
  status: 'processing' | 'done' | 'error';
  startTime: string;
  type: 'csv' | 'excel';
  hasReceivedUpdate?: boolean; // Track if job has received WebSocket update in this session
}

export function useAiCleaningProgress(userId?: string | number) {
  const [activeJobs, setActiveJobs] = useState<CleaningJob[]>(() => {
    const saved = localStorage.getItem('ai-cleaning-jobs');
    if (saved) {
      try {
        const jobs = JSON.parse(saved);
        // Only keep jobs that are still processing (running)
        const runningJobs = jobs.filter((job: CleaningJob) => job.status === 'processing');
        // Mark restored jobs as not having received update yet (progress bar will be hidden)
        const restoredJobs = runningJobs.map(job => ({ ...job, hasReceivedUpdate: false }));
        // Clear completed/error jobs from localStorage
        if (runningJobs.length !== jobs.length) {
          localStorage.setItem('ai-cleaning-jobs', JSON.stringify(restoredJobs));
        }
        return restoredJobs;
      } catch (err) {
        console.error('[useAiCleaningProgress] Failed to parse saved jobs:', err);
        return [];
      }
    }
    return [];
  });

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ai-cleaning-jobs', JSON.stringify(activeJobs));
  }, [activeJobs]);

  // Connect to socket when userId is available
  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(`${SOCKET_URL}/user-notification`, {
      query: { userId: String(userId) },
    });

    console.log('[Socket][Progress] Connecting to', `${SOCKET_URL}/user-notification`);

    socketInstance.on('connect', () => {
      console.log('[Socket][Progress] Connected:', socketInstance.id);
    });

    socketInstance.on('notification:created', notification => {
      console.log('[Socket][Progress] notification:created', notification);

      // Only handle progress updates - NO TOAST
      if (notification.type === 'clean-dataset-progress') {
        const { jobId, completed, total, progress } = notification;
        console.log('[Socket][Progress] Updating progress:', { jobId, completed, total, progress });

        setActiveJobs(jobs => {
          const existing = jobs.find(j => j.jobId === jobId);

          if (existing) {
            // Update existing job progress - mark as having received update
            return jobs.map(j =>
              j.jobId === jobId
                ? {
                    ...j,
                    progress: progress || Math.round((completed / total) * 100),
                    completed,
                    total,
                    status: 'processing' as const,
                    hasReceivedUpdate: true, // Mark as updated via WebSocket
                  }
                : j
            );
          } else {
            // New job detected via progress notification
            return [
              ...jobs,
              {
                jobId,
                fileName:
                  notification.fileName ||
                  `File - ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
                progress: progress || Math.round((completed / total) * 100),
                completed,
                total,
                status: 'processing' as const,
                startTime: new Date().toISOString(),
                type: notification.jobType || 'csv',
                hasReceivedUpdate: true, // New job from WebSocket, show progress
              },
            ];
          }
        });
      }

      // Handle completion - mark as done, DON'T show toast here
      if (notification.type === 'clean-dataset-done') {
        const { jobId } = notification;
        console.log('[Socket][Progress] Job completed:', jobId);

        setActiveJobs(jobs =>
          jobs.map(j => (j.jobId === jobId ? { ...j, progress: 100, status: 'done' as const } : j))
        );
      }

      // Handle error
      if (notification.type === 'clean-dataset-error') {
        const { jobId } = notification;
        console.log('[Socket][Progress] Job error:', jobId);

        setActiveJobs(jobs =>
          jobs.map(j => (j.jobId === jobId ? { ...j, status: 'error' as const } : j))
        );
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket][Progress] Disconnected');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  // Add a new job manually (when submitting)
  const addJob = useCallback(
    (
      job: Omit<
        CleaningJob,
        'progress' | 'completed' | 'total' | 'status' | 'startTime' | 'hasReceivedUpdate'
      >
    ) => {
      setActiveJobs(jobs => [
        ...jobs,
        {
          ...job,
          progress: 0,
          completed: 0,
          total: 100,
          status: 'processing',
          startTime: new Date().toISOString(),
          hasReceivedUpdate: true, // Newly created job, show progress
        },
      ]);
    },
    []
  );

  // Remove a job from the list
  const removeJob = useCallback((jobId: string) => {
    setActiveJobs(jobs => jobs.filter(j => j.jobId !== jobId));
  }, []);

  // Handle clicking on a completed job to view result
  const handleJobClick = useCallback(
    async (
      jobId: string,
      onData: (data: any, type: 'csv' | 'excel') => void,
      onError?: (err: any) => void
    ) => {
      const job = activeJobs.find(j => j.jobId === jobId);
      if (!job || job.status !== 'done') return;

      try {
        const result = await getCleanResult(jobId);
        onData(result.data, job.type);
        removeJob(jobId);
      } catch (err) {
        console.error('[useAiCleaningProgress] Error fetching result:', err);
        if (onError) onError(err);
      }
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
