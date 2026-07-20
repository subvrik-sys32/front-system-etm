import type { Material } from "@/features/materials/types/material.types"

import { getQueryClient } from "@/lib/query-client"

import {
  cacheAddEntity,
  cacheReplaceEntity,
  cacheRemoveEntity,
} from "@/shared/core/entity/cache/entity-cache"

import type { RealtimeEvent } from "../types/realtime-event"

export function materialHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "CREATED": {

      cacheAddEntity<Material>(
        queryClient,
        "materials",
        "material",
        event.payload as Material,
      )

      return

    }

    case "UPDATED": {

      cacheReplaceEntity<Material>(
        queryClient,
        "materials",
        "material",
        event.payload as Material,
      )

      return

    }

    case "DELETED": {

      cacheRemoveEntity<Material>(
        queryClient,
        "materials",
        "material",
        event.id,
      )

      return

    }

  }

}