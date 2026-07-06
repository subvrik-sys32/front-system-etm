import { notificationsApi } from "../api/notifications.api"

export const notificationsService={
  getAll:notificationsApi.getAll,
  getUnreadCount:notificationsApi.getUnreadCount,
  markAsRead:notificationsApi.markAsRead,
  markAllAsRead:notificationsApi.markAllAsRead,
}