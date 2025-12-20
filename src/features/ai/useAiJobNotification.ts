import { useEffect, useState, useCallback } from 'react';
import { getCleanResult } from './aiAPI';
import { useSharedSocket } from '@/features/socket/useSharedSocket';

interface AiJob {
  jobId: string;
  time: string;
  type?: 'clean-dataset' | 'forecast-creation' | 'forecast-analysis';
  forecastId?: string;
}

export function useAiJobNotification(userId?: string | number) {
  const [pendingJobs, setPendingJobs] = useState<AiJob[]>([]);
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);
  const socket = useSharedSocket('user-notification', userId);

  useEffect(() => {
    if (!socket) return;

    console.log('[Socket][Bell] Using shared socket:', socket.id || 'connecting...');

    const handleConnect = () => {
      console.log('[Socket][Bell] Connected:', socket.id);
    };
    const handleNotification = (noti: any) => {
      console.log('[Socket][Bell] notification:created', noti);

      // Only handle DONE notifications - add to bell notifications
      if (noti.type === 'clean-dataset-done' && noti.userId === String(userId)) {
        console.log(
          '[Socket][Bell] ✅ Dataset cleaning completed, adding to pending jobs:',
          noti.jobId
        );
        setPendingJobs(jobs => [
          ...jobs,
          { jobId: noti.jobId, time: noti.time || new Date().toISOString(), type: 'clean-dataset' },
        ]);
      }

      // Handle forecast creation completion
      if (noti.type === 'forecast-creation-done' && noti.userId === String(userId)) {
        console.log(
          '[Socket][Bell] ✅ Forecast creation completed, adding to pending jobs:',
          noti.jobId
        );
        setPendingJobs(jobs => [
          ...jobs,
          {
            jobId: noti.jobId,
            time: noti.time || new Date().toISOString(),
            type: 'forecast-creation',
            forecastId: noti.forecastId,
          },
        ]);
      }

      // Handle forecast analysis completion
      if (noti.type === 'forecast-analysis-done' && noti.userId === String(userId)) {
        console.log(
          '[Socket][Bell] ✅ Forecast analysis completed, adding to pending jobs:',
          noti.jobId
        );
        setPendingJobs(jobs => [
          ...jobs,
          {
            jobId: noti.jobId,
            time: noti.time || new Date().toISOString(),
            type: 'forecast-analysis',
            forecastId: noti.forecastId,
          },
        ]);
      }

      // Ignore progress notifications here - handled by progress hooks
      if (
        noti.type === 'clean-dataset-progress' ||
        noti.type === 'forecast-creation-started' ||
        noti.type === 'forecast-analysis-started'
      ) {
        console.log('[Socket][Bell] ⏩ Ignoring progress notification (handled by progress hooks)');
      }
    };

    socket.on('connect', handleConnect);
    socket.on('notification:created', handleNotification);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('notification:created', handleNotification);
    };
  }, [socket, userId]);

  const handleJobClick = useCallback(
    async (jobId: string, onData: (data: any) => void, onError?: (err: any) => void) => {
      setLoadingJobId(jobId);
      try {
        const result = await getCleanResult(jobId);
        onData(result.data);
        setPendingJobs(jobs => jobs.filter(j => j.jobId !== jobId));
      } catch (err) {
        if (onError) onError(err);
      } finally {
        setLoadingJobId(null);
      }
    },
    []
  );

  return { pendingJobs, loadingJobId, handleJobClick, setPendingJobs };
}
