import { api } from "@/lib/api"
import type { Notification, NotificationsPage } from "../types/notification.types"

export const notificationsApi={

  async getAll(params?:{ cursor?:string; take?:number }){
    const response=await api.get<NotificationsPage>("/notifications",{ params })
    return response.data
  },

  async getUnreadCount(){
    const response=await api.get<{ count:number }>("/notifications/unread-count")
    return response.data.count
  },

  async markAsRead(id:string){
    const response=await api.patch<Notification>(`/notifications/${id}/read`)
    return response.data
  },

  async markAllAsRead(){
    await api.patch("/notifications/read-all")
  },

}