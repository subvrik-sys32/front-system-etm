"use client"

import type { RealtimeEvent } from "../types/realtime-event"
import type { WorkflowResponse } from "@/features/workflow/services/workflow.services"

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
        event.payload as WorkflowResponse,
      )

      return

    }

  }

}