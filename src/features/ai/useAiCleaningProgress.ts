import { useEffect, useState, useCallback } from 'react';
import { getCleanResult } from './aiAPI';
import { useSharedSocket } from '@/features/socket/useSharedSocket';

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
        const restoredJobs = runningJobs.map((job: any) => ({ ...job, hasReceivedUpdate: false }));
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

  const socket = useSharedSocket('user-notification', userId);

  // Connect to socket when userId is available
  useEffect(() => {
    if (!socket) return;

    console.log('[Socket][Progress] Using shared socket:', socket.id || 'connecting...');

    const handleConnect = () => {
      console.log('[Socket][Progress] Connected:', socket.id);

      // Clean up stale jobs: if restored jobs don't receive updates within 2 seconds,
      // they're likely stale (backend reset) and should be removed
      // (2 seconds is enough - if backend is running, it will send updates immediately)
      setTimeout(() => {
        setActiveJobs(jobs => {
          const staleJobs = jobs.filter(j => !j.hasReceivedUpdate);
          if (staleJobs.length > 0) {
            console.log(
              '[Socket][Progress] Removing stale jobs:',
              staleJobs.map(j => j.jobId)
            );
            return jobs.filter(j => j.hasReceivedUpdate);
          }
          return jobs;
        });
      }, 2000); // 2 seconds timeout - backend should send updates immediately if running
    };

    const handleNotification = (notification: any) => {
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
    };

    socket.on('connect', handleConnect);
    socket.on('notification:created', handleNotification);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('notification:created', handleNotification);
    };
  }, [socket, userId]);

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
