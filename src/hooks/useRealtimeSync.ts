import { useEffect } from 'react';
import { useAuthStore } from '../store/useStore';

/**
 * Hook to listen for server-side real-time events (Server-Sent Events)
 * Automatically syncs profile updates (avatar, name, bio) across devices, tabs, and sessions.
 */
export function useRealtimeSync() {
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.EventSource) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      try {
        eventSource = new EventSource('/api/realtime');

        eventSource.addEventListener('USER_UPDATED', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data && currentUser && (data.id === currentUser.id || data.username === currentUser.username)) {
              updateUser(data);
            }
            // Dispatch window event so any active profile or feed components can re-render immediately
            window.dispatchEvent(new CustomEvent('bellbird:user-updated', { detail: data }));
          } catch (err) {
            console.warn('[RealtimeSync] Parse error:', err);
          }
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Attempt reconnection after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.warn('[RealtimeSync] Connection error:', err);
      }
    }

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentUser?.id, currentUser?.username, updateUser]);
}
