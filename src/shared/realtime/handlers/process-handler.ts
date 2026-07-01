"use client"

import type { RealtimeEvent } from "../types/realtime-event"
import type { Task } from "@/features/tasks/types/task.types"

import { getQueryClient } from "@/lib/query-client"
import { propagateWorkflowUpdate } from "@/features/workflow/cache/propagate-workflow-update"

export function processHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "UPDATED": {

      propagateWorkflowUpdate(
        queryClient,
        {
          taskId: event.id,
          task: event.payload as Task,
        },
      )

      return

    }

  }

}