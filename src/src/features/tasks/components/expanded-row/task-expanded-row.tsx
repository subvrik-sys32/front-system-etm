"use client"

import type {
  Task,
} from "../../types/task.types"

import {
  EntityExpandedContent,
  EntityExpandedHeader,
  EntityExpandedRow,
  EntityExpandedSection,
} from "@/shared/ui/entity-expanded-row"

import {
  useContainerWidth,
} from "@/shared/hooks/use-container-width"

import {
  cn,
} from "@/shared/utils/utils"

import {
  TaskKpisSection,
} from "./task-kpis-section"

import {
  TaskProductionPanel,
} from "./production/task-production-panel"

import {
  TaskCommentsPanel,
} from "./comments/task-comments-panel"

type Props={
  task:Task
}

// Debajo de este ancho REAL del contenedor, WORKFLOW OPERATIVO y
// MENSAJES uno al lado del otro al 50% quedan demasiado angostos
// (el stepper de pasos y el panel de comentarios necesitan un
// mínimo de espacio cada uno) — se apilan en columna. No usa
// isMobile: esta fila puede vivir en contextos angostos aunque el
// viewport sea "desktop".
const STACK_BREAKPOINT_PX = 640

export function TaskExpandedRow({
  task,
}:Props){

  const { ref, width } = useContainerWidth()

  const isNarrow = width !== null && width < STACK_BREAKPOINT_PX

  return(

    <EntityExpandedRow
      rowId={task.id}
    >

      <EntityExpandedHeader
        section="TAREA OPERATIVA"
        title={task.reference}
        metric={task.route.length}
        metricLabel="procesos definidos"
      />

      <TaskKpisSection
        task={task}
      />

      <EntityExpandedContent>

        <div
          ref={ref}
          className={cn(
            "flex min-h-43.5 gap-4 select-none",
            isNarrow ? "flex-col" : "flex-row",
          )}
        >

          <div className={isNarrow ? "w-full" : "w-[50%]"}>

            <EntityExpandedSection
              title="WORKFLOW OPERATIVO"
            >

              <TaskProductionPanel
                task={task}
              />

            </EntityExpandedSection>

          </div>

          <div className={isNarrow ? "w-full" : "w-[50%]"}>

            <EntityExpandedSection
              title="MENSAJES"
            >

              <TaskCommentsPanel
                taskId={task.id}
              />

            </EntityExpandedSection>

          </div>

        </div>

      </EntityExpandedContent>

    </EntityExpandedRow>

  )

}