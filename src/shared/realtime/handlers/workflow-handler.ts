"use client"

import type { RealtimeEvent } from "../types/realtime-event"
import type { WorkflowResponse } from "@/features/workflow/services/workflow.services"

import { getQueryClient } from "@/lib/query-client"
import { propagateWorkflowUpdate } from "@/features/workflow/cache/propagate-workflow-update"
import { sidebarCountsQueryKey } from "@/shared/responsive/layout/hooks/use-sidebar-counts"

export function workflowHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  // Un workflowStep llegando a REVIEWED (o saliendo de ahí) cambia
  // "activeTasksCount" y los contadores por proceso del sidebar —
  // invalidación liviana (COUNT), no cuesta nada de más.
  queryClient.invalidateQueries({
    queryKey: sidebarCountsQueryKey,
  })

  switch (event.action) {

    case "UPDATED": {

      propagateWorkflowUpdate(
        queryClient,
        event.payload as WorkflowResponse,
      )

      return

    }

  }

}