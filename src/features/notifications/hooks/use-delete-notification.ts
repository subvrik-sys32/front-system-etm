"use client"

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { notificationsService } from "../services/notifications.service"
import { notificationsQueryKey } from "./use-notifications"
import type { Notification, NotificationsPage } from "../types/notification.types"
import { markPendingSelfDeletion } from "@/shared/realtime/pending-self-deletions"

export function useDeleteNotification(){

  const queryClient=useQueryClient()

  const mutation=useMutation({

    mutationFn:(notification:Notification)=>notificationsService.remove(notification.id),

    onSuccess:(_,notification)=>{

      // El backend le va a hacer eco de este mismo borrado por SSE
      // al propio usuario (ver NotificationsService.remove). Marcamos
      // el id ANTES de que ese eco pueda llegar, para que el handler
      // de realtime sepa que ya se descontó acá abajo y no lo reste
      // otra vez.
      markPendingSelfDeletion(notification.id)

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