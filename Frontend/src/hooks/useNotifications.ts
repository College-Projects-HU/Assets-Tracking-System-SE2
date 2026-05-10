import { useState, useEffect, useCallback } from "react";
import notificationService, {
  type NotificationItem,
} from "@/services/notificationService";
import { useAuth } from "@/lib/auth";

const POLL_MS = 30_000; // poll every 30 seconds

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationService.getAll();
      // Sort newest first
      setNotifications(
        (res.data || []).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch {
      // fail silently — never crash the sidebar
    }
  }, [user]);

  // Initial fetch + polling
  useEffect(() => {
    fetch();
    const id = setInterval(fetch, POLL_MS);
    return () => clearInterval(id);
  }, [fetch]);

  const markRead = useCallback(async (id: number) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    await Promise.allSettled(
      unread.map((n) => notificationService.markRead(n.id)),
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markRead,
    markAllRead,
    refetch: fetch,
  };
}
