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

export function TaskExpandedRow({
  task,
}:Props){

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

        <div className="flex min-h-43.5 gap-4 select-none">

          <div className="w-[50%]">

            <EntityExpandedSection
              title="WORKFLOW OPERATIVO"
            >

              <TaskProductionPanel
                task={task}
              />

            </EntityExpandedSection>

          </div>

          <div className="w-[50%]">

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