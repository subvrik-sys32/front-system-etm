import type { Client } from "@/features/clients/types/client.types"

import { getQueryClient } from "@/lib/query-client"

import {
  cacheAddEntity,
  cacheReplaceEntity,
  cacheRemoveEntity,
} from "@/shared/core/entity/cache/entity-cache"

import type { RealtimeEvent } from "../types/realtime-event"

export function clientHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "CREATED": {

      cacheAddEntity<Client>(
        queryClient,
        "clients",
        "client",
        event.payload as Client,
        (a, b) => a.name.localeCompare(b.name),
      )

      return

    }

    case "UPDATED": {

      cacheReplaceEntity<Client>(
        queryClient,
        "clients",
        "client",
        event.payload as Client,
      )

      return

    }

    case "DELETED": {

      cacheRemoveEntity<Client>(
        queryClient,
        "clients",
        "client",
        event.id,
      )

      return

    }

  }

}