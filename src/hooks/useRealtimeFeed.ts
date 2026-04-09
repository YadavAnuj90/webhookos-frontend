'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeDeliveryEvent } from '@/lib/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
const MAX_EVENTS = 100;

interface UseRealtimeFeedOpts {
  projectId?: string;
  endpointId?: string;
  enabled?: boolean;
}

/**
 * Connects to the WebhookOS real-time delivery feed via Socket.IO.
 *
 * Lazy-loads socket.io-client to avoid SSR issues and keep the bundle lean
 * for pages that don't use WebSocket. Falls back gracefully if the backend
 * or the library is unavailable.
 */
export function useRealtimeFeed({ projectId, endpointId, enabled = true }: UseRealtimeFeedOpts = {}) {
  const [events, setEvents] = useState<RealtimeDeliveryEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<any>(null);

  const clear = useCallback(() => setEvents([]), []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let socket: any;
    let cancelled = false;

    (async () => {
      try {
        // Dynamic import — avoids SSR crash and tree-shakes out when unused
        const { io } = await import('socket.io-client');
        if (cancelled) return;

        const token = localStorage.getItem('accessToken');
        socket = io(`${WS_URL}/realtime`, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 2000,
          reconnectionAttempts: 10,
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          setConnected(true);
          // Subscribe to project/endpoint rooms
          if (projectId) socket.emit('subscribe', { projectId, endpointId });
        });

        socket.on('disconnect', () => setConnected(false));

        // Delivery events from the backend RealtimeGateway
        const deliveryEvents = [
          'delivery.success', 'delivery.failed', 'delivery.dead',
          'delivery.retry', 'delivery.filtered', 'delivery.rate_queued',
        ];
        deliveryEvents.forEach(evt => {
          socket.on(evt, (payload: any) => {
            const event: RealtimeDeliveryEvent = { type: evt as any, timestamp: new Date().toISOString(), ...payload };
            setEvents(prev => [event, ...prev].slice(0, MAX_EVENTS));
          });
        });

        socket.on('connect_error', () => {
          // Silently degrade — WebSocket is optional
          setConnected(false);
        });
      } catch {
        // socket.io-client not installed or import failed — degrade silently
      }
    })();

    return () => {
      cancelled = true;
      if (socket) {
        if (projectId) socket.emit('unsubscribe', { projectId, endpointId });
        socket.disconnect();
      }
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, projectId, endpointId]);

  return { events, connected, clear };
}
