import axios from "axios";
import api from "./api";

interface BackendNotificationDto {
  id: number;
  recipientId: number;
  message: string;
  type: string;
  readStatus: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  ASSET_ASSIGNED: "Asset Assigned",
  ASSET_RETURNED: "Asset Returned",
  MAINTENANCE_CREATED: "Ticket Created",
  MAINTENANCE_NEW_TICKET: "New Ticket",
  MAINTENANCE_STATUS_UPDATED: "Status Updated",
  MAINTENANCE_NOTE_ADDED: "Note Added",
};

const mapNotification = (n: BackendNotificationDto): NotificationItem => ({
  id: n.id,
  type: n.type,
  title: TYPE_LABELS[n.type] ?? n.type.replaceAll("_", " "),
  body: n.message,
  createdAt: n.createdAt,
  read: n.readStatus,
});

const notificationService = {
  getAll: () =>
    api
      .get<BackendNotificationDto[]>("/notifications")
      .then((r) => ({ ...r, data: (r.data || []).map(mapNotification) }))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return { data: [] as NotificationItem[] };
        }
        throw err;
      }),

  markRead: (id: number) =>
    api.put(`/notifications/${id}/read`).catch((err) => {
      if (axios.isAxiosError(err) && err.response?.status === 404)
        return { data: null };
      throw err;
    }),

  markAllRead: async () => {
    const all = await notificationService.getAll();
    await Promise.allSettled(
      all.data
        .filter((n) => !n.read)
        .map((n) => notificationService.markRead(n.id)),
    );
    return { data: null };
  },
};

export default notificationService;
