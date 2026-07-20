import type { Priority } from "@/features/priorities/types/priority.types"

import { getQueryClient } from "@/lib/query-client"

import {
  cacheAddEntity,
  cacheReplaceEntity,
  cacheRemoveEntity,
} from "@/shared/core/entity/cache/entity-cache"

import type { RealtimeEvent } from "../types/realtime-event"

export function priorityHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "CREATED": {

      cacheAddEntity<Priority>(
        queryClient,
        "priorities",
        "priority",
        event.payload as Priority,
      )

      return

    }

    case "UPDATED": {

      cacheReplaceEntity<Priority>(
        queryClient,
        "priorities",
        "priority",
        event.payload as Priority,
      )

      return

    }

    case "DELETED": {

      cacheRemoveEntity<Priority>(
        queryClient,
        "priorities",
        "priority",
        event.id,
      )

      return

    }

  }

}