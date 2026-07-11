import type { Stage } from "@/features/stages/types/stage.types"

import { getQueryClient } from "@/lib/query-client"

import {
  cacheAddEntity,
  cacheReplaceEntity,
  cacheRemoveEntity,
} from "@/shared/core/entity/cache/entity-cache"

import type { RealtimeEvent } from "../types/realtime-event"

export function stageHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "CREATED": {

      cacheAddEntity<Stage>(
        queryClient,
        "stages",
        "stage",
        event.payload as Stage,
      )

      return

    }

    case "UPDATED": {

      cacheReplaceEntity<Stage>(
        queryClient,
        "stages",
        "stage",
        event.payload as Stage,
      )

      return

    }

    case "DELETED": {

      cacheRemoveEntity<Stage>(
        queryClient,
        "stages",
        "stage",
        event.id,
      )

      return

    }

  }

}