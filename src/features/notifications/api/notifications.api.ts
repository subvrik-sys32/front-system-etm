import { api } from "@/lib/api"
import type { Notification, NotificationsPage } from "../types/notification.types"

export const notificationsApi={

  async getAll(params?:{ cursor?:string; take?:number },signal?:AbortSignal){
    const response=await api.get<NotificationsPage>("/notifications",{ params, signal })
    return response.data
  },

  async getUnreadCount(signal?:AbortSignal){
    const response=await api.get<{ count:number }>("/notifications/unread-count",{ signal })
    return response.data.count
  },

  async markAsRead(id:string){
    const response=await api.patch<Notification>(`/notifications/${id}/read`)
    return response.data
  },

  async markAllAsRead(){
    await api.patch("/notifications/read-all")
  },

  async remove(id:string){
    await api.delete(`/notifications/${id}`)
  },

  async removeAll(){
    await api.delete("/notifications")
  },

}