import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Global socket instance cache
const socketCache = new Map<string, Socket>();
// Track how many components are using each socket
const socketRefCount = new Map<string, number>();

/**
 * Get or create a shared socket instance for a given namespace and userId
 * This prevents duplicate connections when multiple hooks use the same socket
 */
export function useSharedSocket(namespace: string, userId?: string | number): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);
  const cacheKey = `${namespace}:${userId || 'anonymous'}`;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      return;
    }

    // Check if socket already exists in cache
    if (socketCache.has(cacheKey)) {
      const cachedSocket = socketCache.get(cacheKey)!;
      // Increment reference count
      socketRefCount.set(cacheKey, (socketRefCount.get(cacheKey) || 0) + 1);
      if (isMountedRef.current) {
        setSocket(cachedSocket);
      }
      return;
    }

    // Create new socket instance
    const newSocket = io(`${SOCKET_URL}/${namespace}`, {
      query: { userId: String(userId) },
    });

    console.log(`[SharedSocket][${namespace}] Creating new connection for userId:`, userId);

    // Initialize reference count
    socketRefCount.set(cacheKey, 1);
    socketCache.set(cacheKey, newSocket);

    // Set socket immediately so hooks can use it (even if not connected yet)
    if (isMountedRef.current) {
      setSocket(newSocket);
    }

    newSocket.on('connect', () => {
      if (isMountedRef.current) {
        console.log(`[SharedSocket][${namespace}] Connected:`, newSocket.id);
      }
    });

    newSocket.on('disconnect', () => {
      if (isMountedRef.current) {
        console.log(`[SharedSocket][${namespace}] Disconnected`);
      }
      // Don't remove from cache on disconnect - allow reconnection
    });

    return () => {
      // Decrement reference count
      const currentCount = socketRefCount.get(cacheKey) || 0;
      const newCount = Math.max(0, currentCount - 1);
      socketRefCount.set(cacheKey, newCount);

      // Only disconnect and remove from cache if no components are using it
      if (newCount === 0) {
        console.log(`[SharedSocket][${namespace}] Last reference removed, disconnecting`);
        newSocket.disconnect();
        socketCache.delete(cacheKey);
        socketRefCount.delete(cacheKey);
      }
    };
  }, [namespace, userId, cacheKey]);

  return socket;
}

/**
 * Cleanup function to disconnect all cached sockets
 * Useful for testing or explicit cleanup
 */
export function disconnectAllSockets(): void {
  socketCache.forEach((socket, key) => {
    console.log(`[SharedSocket] Disconnecting cached socket:`, key);
    socket.disconnect();
  });
  socketCache.clear();
}
