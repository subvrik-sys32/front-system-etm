"use client"

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { notificationsService } from "../services/notifications.service"
import { notificationsQueryKey } from "./use-notifications"
import type { NotificationsPage } from "../types/notification.types"

export function useDeleteAllNotifications(){

  const queryClient=useQueryClient()

  const mutation=useMutation({

    mutationFn:()=>notificationsService.removeAll(),

    onSuccess:()=>{

      queryClient.setQueryData<InfiniteData<NotificationsPage>>(
        notificationsQueryKey,
        current=>{

          if(!current)return current

          return{
            ...current,
            pages:current.pages.map(page=>({ ...page, items:[] })),
          }

        },
      )

      queryClient.setQueryData<number>(["notifications","unread-count"],0)

    },

  })

  return{
    deleteAll:mutation.mutateAsync,
  }

}