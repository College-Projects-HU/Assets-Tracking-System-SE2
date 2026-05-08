import axios from 'axios';
import api from './api';

export interface NotificationItem {
  id: number;
  title: string;
  body?: string;
  createdAt: string;
  read: boolean;
}

const notificationService = {
  getAll: () => api.get<NotificationItem[]>('/notifications').catch((error) => {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { data: [] as NotificationItem[] };
    }
    throw error;
  }),
  getUnread: () => api.get<NotificationItem[]>('/notifications?unread=true').catch((error) => {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { data: [] as NotificationItem[] };
    }
    throw error;
  }),
  markRead: (id: number) => api.post(`/notifications/${id}/read`).catch((error) => {
    if (axios.isAxiosError(error) && error.response?.status === 404) return { data: null };
    throw error;
  }),
  markAllRead: () => api.post('/notifications/read-all').catch((error) => {
    if (axios.isAxiosError(error) && error.response?.status === 404) return { data: null };
    throw error;
  }),
};

export default notificationService;
