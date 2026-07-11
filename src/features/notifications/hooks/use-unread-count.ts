"use client"

import { useQuery } from "@tanstack/react-query"
import { notificationsService } from "../services/notifications.service"

export function useUnreadCount(){

  const query=useQuery({
    queryKey:["notifications","unread-count"],
    queryFn:notificationsService.getUnreadCount,
  })

  return{
    count:query.data??0,
  }

}