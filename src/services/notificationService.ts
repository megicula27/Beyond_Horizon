import api from "./apiClient";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: "job_approved" | "system" | "alert" | "safety";
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchNotifications(
  page = 1,
  limit = 20
): Promise<NotificationsResponse> {
  const res = await api.get<NotificationsResponse>("/notifications", {
    params: { page, limit },
  });
  return res.data;
}

export async function markNotificationAsRead(id: string) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsAsRead() {
  const res = await api.patch("/notifications/read-all");
  return res.data;
}
