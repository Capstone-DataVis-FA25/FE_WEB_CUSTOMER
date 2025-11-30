import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getCleanResult } from './aiAPI';

// Sử dụng biến môi trường Vite cho FE
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface AiJob {
  jobId: string;
  time: string;
}

export function useAiJobNotification(userId?: string | number) {
  const [pendingJobs, setPendingJobs] = useState<AiJob[]>([]);
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    // SOCKET_URL chỉ là http://localhost:4000, namespace là /user-notification
    const socket = io(`${SOCKET_URL}/user-notification`, {
      query: { userId: String(userId) },
    });
    console.log(
      '[Socket][Bell] Connecting to',
      `${SOCKET_URL}/user-notification`,
      'with userId:',
      userId
    );
    socket.on('connect', () => {
      console.log('[Socket][Bell] Connected:', socket.id);
    });
    socket.on('notification:created', noti => {
      console.log('[Socket][Bell] notification:created', noti);
      if (noti.userId === String(userId)) {
        setPendingJobs(jobs => [
          ...jobs,
          { jobId: noti.jobId, time: noti.time || new Date().toISOString() },
        ]);
      }
    });
    socket.on('disconnect', () => {
      console.log('[Socket][Bell] Disconnected');
    });
    return () => {
      socket.disconnect();
    };
  }, [userId]);

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
