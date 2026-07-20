import type { Color } from "@/features/colors/types/color.types"

import { getQueryClient } from "@/lib/query-client"

import {
  cacheAddEntity,
  cacheReplaceEntity,
  cacheRemoveEntity,
} from "@/shared/core/entity/cache/entity-cache"

import type { RealtimeEvent } from "../types/realtime-event"

export function colorHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "CREATED": {

      cacheAddEntity<Color>(
        queryClient,
        "colors",
        "color",
        event.payload as Color,
      )

      return

    }

    case "UPDATED": {

      cacheReplaceEntity<Color>(
        queryClient,
        "colors",
        "color",
        event.payload as Color,
      )

      return

    }

    case "DELETED": {

      cacheRemoveEntity<Color>(
        queryClient,
        "colors",
        "color",
        event.id,
      )

      return

    }

  }

}