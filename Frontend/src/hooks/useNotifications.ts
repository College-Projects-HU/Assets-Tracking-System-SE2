import { useEffect, useState, useRef } from 'react';
import notificationService, { NotificationItem } from '@/services/notificationService';

export default function useNotifications(pollInterval = 10000) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data || []);
      setError(null);
    } catch (err: any) {
      console.warn('Failed to fetch notifications', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    timerRef.current = window.setInterval(fetch, pollInterval);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollInterval]);

  const markRead = async (id: number) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.warn('Failed to mark notification read', err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Failed to mark all read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, loading, error, unreadCount, markRead, markAllRead, refresh: fetch };
}
