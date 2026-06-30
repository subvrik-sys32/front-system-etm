"use client"

import type {
  Task,
} from "@/features/tasks/types/task.types"

import type {
  EntityBase,
} from "@/shared/types/entity-base.types"

import {
  useMemo,
} from "react"

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import {
  createWorkflowView,
} from "@/features/workflow/view/create-workflow-view"

import {
  getCurrentStep,
} from "@/features/workflow/selectors/get-current-step"

import {
  WORKFLOW_STATUS_DEFINITIONS,
} from "@/features/workflow/constants/workflow-status-definitions"

import {
  ENTITY_ICONS,
} from "@/shared/constants/entity-icons"

import {
  TaskRouteViewer,
} from "./task-route-viewer"

type Props={
  task:Task
}

export function TaskProductionPanel({
  task,
}:Props){

  const workflowView=
    createWorkflowView(
      task.workflowSteps,
    )

  const currentStep=
    getCurrentStep(
      task.workflowSteps,
    )

  const status=
    useMemo<EntityBase|undefined>(()=>{

      if(
        workflowView.completed
      ){

        return{
          id:"finalized",
          name:"Finalizado",
          icon:"check",
          color:"#22C55E",
        }

      }

      if(
        !currentStep
      ){
        return undefined
      }

      const definition=
        WORKFLOW_STATUS_DEFINITIONS[
          currentStep.status
        ]

      return{
        id:currentStep.status,
        name:definition.label,
        icon:definition.icon,
        color:definition.color,
      }

    },[
      workflowView.completed,
      currentStep,
    ])

  const StatusIcon=

    status?.icon

      ?ENTITY_ICONS[
        status.icon
      ]

      :undefined

  const progressContent=(

    <div className="flex min-w-0 items-center gap-2">

      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/5">

        <div
          className="h-full rounded-full bg-cyan-500 transition-all"
          style={{
            width:`${workflowView.progress}%`,
          }}
        />

      </div>

      <span className="w-12 shrink-0 text-center text-xl font-bold leading-none text-cyan-400">

        {workflowView.progress}%

      </span>

    </div>

  )

  const completedContent=(

    <div className="flex shrink-0 flex-col items-center">

      <span className="text-lg font-bold leading-none text-neutral-100">

        {workflowView.completedSteps}

        /

        {workflowView.totalSteps}

      </span>

      <span className="mt-1 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-neutral-500">

        COMPLETADOS

      </span>

    </div>

  )

  const statusContent=

    status&&(

      <DynamicBadge
        label={status.name}
        color={status.color}
        iconComponent={StatusIcon}
      />

    )

  return(

    <div className="flex h-full min-h-43.5 w-full flex-col justify-center rounded-xl bg-white/2 p-4">

      <div className="flex justify-center">

        <TaskRouteViewer
          taskId={task.id}
          route={task.route}
          currentProcess={
            currentStep?.processCode
          }
        />

      </div>

      <div className="mt-3 flex justify-center">

        <div className="w-full max-w-5xl rounded-xl bg-white/2 px-4 py-3">

          <div className="hidden items-center justify-center gap-8 xl:flex">

            <div className="w-80">

              {progressContent}

            </div>

            <div className="max-w-36 min-w-0 shrink">

              {statusContent}

            </div>

            {completedContent}

          </div>

          <div className="xl:hidden">

            {status&&(

              <div className="mb-3 flex justify-center">

                {statusContent}

              </div>

            )}

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1">

              {progressContent}

              {completedContent}

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}