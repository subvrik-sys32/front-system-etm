import type { Thickness } from "@/features/thicknesses/types/thickness.types"

import { getQueryClient } from "@/lib/query-client"

import {
  cacheAddEntity,
  cacheReplaceEntity,
  cacheRemoveEntity,
} from "@/shared/core/entity/cache/entity-cache"

import type { RealtimeEvent } from "../types/realtime-event"

export function thicknessHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "CREATED": {

      cacheAddEntity<Thickness>(
        queryClient,
        "thicknesses",
        "thickness",
        event.payload as Thickness,
      )

      return

    }

    case "UPDATED": {

      cacheReplaceEntity<Thickness>(
        queryClient,
        "thicknesses",
        "thickness",
        event.payload as Thickness,
      )

      return

    }

    case "DELETED": {

      cacheRemoveEntity<Thickness>(
        queryClient,
        "thicknesses",
        "thickness",
        event.id,
      )

      return

    }

  }

}