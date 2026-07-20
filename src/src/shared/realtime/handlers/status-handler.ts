import type { Status } from "@/features/statuses/types/status.types"

import { getQueryClient } from "@/lib/query-client"

import {
  cacheAddEntity,
  cacheReplaceEntity,
  cacheRemoveEntity,
} from "@/shared/core/entity/cache/entity-cache"

import type { RealtimeEvent } from "../types/realtime-event"

export function statusHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "CREATED": {

      cacheAddEntity<Status>(
        queryClient,
        "statuses",
        "status",
        event.payload as Status,
      )

      return

    }

    case "UPDATED": {

      cacheReplaceEntity<Status>(
        queryClient,
        "statuses",
        "status",
        event.payload as Status,
      )

      return

    }

    case "DELETED": {

      cacheRemoveEntity<Status>(
        queryClient,
        "statuses",
        "status",
        event.id,
      )

      return

    }

  }

}