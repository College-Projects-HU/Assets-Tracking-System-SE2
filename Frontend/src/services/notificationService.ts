import axios from 'axios';
import api from './api';

interface BackendNotificationDto {
  id: number;
  recipientId: number;
  message: string;
  type: string;
  readStatus: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  body?: string;
  createdAt: string;
  read: boolean;
}

const mapNotification = (n: BackendNotificationDto): NotificationItem => ({
  id: n.id,
  title: n.type?.replaceAll('_', ' ') || 'Notification',
  body: n.message,
  createdAt: n.createdAt,
  read: n.readStatus,
});

const notificationService = {
  getAll: () =>
    api.get<BackendNotificationDto[]>('/notifications')
      .then((response) => ({ ...response, data: (response.data || []).map(mapNotification) }))
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return { data: [] as NotificationItem[] };
        }
        throw error;
      }),
  getUnread: () =>
    notificationService.getAll().then((response) => ({
      ...response,
      data: response.data.filter((n) => !n.read),
    })),
  markRead: (id: number) =>
    api.put(`/notifications/${id}/read`).catch((error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return { data: null };
      throw error;
    }),
  markAllRead: async () => {
    const all = await notificationService.getAll();
    await Promise.all(all.data.filter((n) => !n.read).map((n) => notificationService.markRead(n.id)));
    return { data: null };
  },
};

export default notificationService;
