import type { Project } from "@/features/projects/types/project.types"

import { getQueryClient } from "@/lib/query-client"

import {
  cacheAddEntity,
  cacheReplaceEntity,
  cacheRemoveEntity,
} from "@/shared/core/entity/cache/entity-cache"

import { propagateProjectUpdate } from "@/features/projects/cache/propagate-project-update"

import type { RealtimeEvent } from "../types/realtime-event"

export function projectHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "CREATED": {

      cacheAddEntity<Project>(
        queryClient,
        "projects",
        "project",
        event.payload as Project,
        (a, b) => a.position - b.position,
      )

      return

    }

    case "UPDATED": {

      const project = event.payload as Project

      cacheReplaceEntity<Project>(
        queryClient,
        "projects",
        "project",
        project,
      )

      propagateProjectUpdate(
        queryClient,
        project,
      )

      return

    }

    case "DELETED": {

      cacheRemoveEntity<Project>(
        queryClient,
        "projects",
        "project",
        event.id,
      )

      return

    }

    case "REORDERED": {

      queryClient.setQueryData<Project[]>(
        ["projects"],
        event.payload as Project[],
      )

      return

    }

  }

}