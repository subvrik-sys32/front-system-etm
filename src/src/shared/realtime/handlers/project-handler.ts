import type { Project } from "@/features/projects/types/project.types"

import { getQueryClient } from "@/lib/query-client"

import {
  cacheAddEntity,
  cacheReplaceEntity,
  cacheRemoveEntity,
} from "@/shared/core/entity/cache/entity-cache"

import { propagateProjectUpdate } from "@/features/projects/cache/propagate-project-update"

import { sidebarCountsQueryKey } from "@/shared/responsive/layout/hooks/use-sidebar-counts"

import type { RealtimeEvent } from "../types/realtime-event"

export function projectHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  // Crear/actualizar (cambio de estado, ej. a COMPLETED)/borrar un
  // proyecto puede cambiar el contador "activos" del sidebar — se
  // invalida siempre, es una query liviana (COUNT), no cuesta nada
  // pedirla de más alguna vez por las dudas.
  queryClient.invalidateQueries({
    queryKey: sidebarCountsQueryKey,
  })

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

      // El payload ahora es liviano: solo {id,position}[] de los
      // proyectos que en verdad cambiaron de posición — antes era
      // el array completo (con client+pm+stage+status incluidos),
      // reemplazando la cache entera solo para actualizar un campo.
      const reorderedItems =
        event.payload as { id: string; position: number }[]

      queryClient.setQueryData<Project[]>(

        ["projects"],

        current => {

          if (!current) {
            return current
          }

          const positionById =
            new Map(
              reorderedItems.map(item => [item.id, item.position]),
            )

          return current
            .map(project => {

              const nextPosition =
                positionById.get(project.id)

              return nextPosition === undefined
                ? project
                : { ...project, position: nextPosition }

            })
            .sort((a, b) => a.position - b.position)

        },

      )

      return

    }

  }

}