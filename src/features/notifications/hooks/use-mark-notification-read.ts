"use client"

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { notificationsService } from "../services/notifications.service"
import { notificationsQueryKey } from "./use-notifications"
import type { Notification, NotificationsPage } from "../types/notification.types"

export function useMarkNotificationRead(){

  const queryClient=useQueryClient()

  const mutation=useMutation({

    mutationFn:(id:string)=>notificationsService.markAsRead(id),

    onSuccess:(updated)=>{

      queryClient.setQueryData<InfiniteData<NotificationsPage>>(
        notificationsQueryKey,
        current=>{

          if(!current)return current

          return{
            ...current,
            pages:current.pages.map(page=>({
              ...page,
              items:page.items.map((n:Notification)=>
                n.id===updated.id?updated:n,
              ),
            })),
          }

        },
      )

      queryClient.invalidateQueries({ queryKey:["notifications","unread-count"] })

    },

  })

  return{
    markAsRead:mutation.mutateAsync,
  }

}