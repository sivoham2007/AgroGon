import { apiFetch } from "./client";

export interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  category: string;
  isRead: boolean;
  createdAt: string;
}

export const httpNotificationsService = {
  list(): Promise<{ items: NotificationItem[]; unreadCount: number }> {
    return apiFetch("/notifications");
  },
  markRead(id: string): Promise<{ ok: true }> {
    return apiFetch(`/notifications/${id}/read`, { method: "PUT" });
  },
};
