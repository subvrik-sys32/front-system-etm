"use client"

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { notificationsService } from "../services/notifications.service"
import { notificationsQueryKey } from "./use-notifications"
import type { Notification, NotificationsPage } from "../types/notification.types"

export function useDeleteNotification(){

  const queryClient=useQueryClient()

  const mutation=useMutation({

    mutationFn:(notification:Notification)=>notificationsService.remove(notification.id),

    onSuccess:(_,notification)=>{

      queryClient.setQueryData<InfiniteData<NotificationsPage>>(
        notificationsQueryKey,
        current=>{

          if(!current)return current

          return{
            ...current,
            pages:current.pages.map(page=>({
              ...page,
              items:page.items.filter(n=>n.id!==notification.id),
            })),
          }

        },
      )

      if(!notification.read){
        queryClient.setQueryData<number>(
          ["notifications","unread-count"],
          current=>Math.max(0,(current??0)-1),
        )
      }

    },

  })

  return{
    deleteNotification:mutation.mutateAsync,
  }

}