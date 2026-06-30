"use client"

import type {
  WorkflowStep,
} from "@/features/workflow/types/workflow.types"

import {
  createWorkflowView,
} from "@/features/workflow/view/create-workflow-view"

type Props = {

  workflow: WorkflowStep[]

}

export function TaskWorkflowSummaryCard({
  workflow,
}: Props) {

  const workflowView =
    createWorkflowView(
      workflow
    )

  return (

    <div className="rounded-2xl border border-white/6 bg-[#0D0D10] p-6">

      <div className="mb-6 text-xs font-semibold tracking-[0.18em] text-neutral-500">

        PROCESO ACTUAL

      </div>

      <div className="text-3xl font-bold text-white">

        {

          workflowView.completed

            ? "COMPLETADO"

            : workflowView.currentProcess ?? "-"

        }

      </div>

      <div className="mt-2 text-sm font-medium text-neutral-400">

        {

          workflowView.completed

            ? "Workflow finalizado"

            : workflowView.currentStatus ?? "-"

        }

      </div>

      <div className="mt-8">

        <div className="mb-2 text-xs font-semibold tracking-[0.14em] text-neutral-500">

          AVANCE

        </div>

        <div className="text-4xl font-bold text-white">

          {workflowView.progress}%

        </div>

        <div className="mt-2 text-sm text-neutral-400">

          {workflowView.completedSteps}
          {" / "}
          {workflowView.totalSteps}
          {" procesos completados"}

        </div>

      </div>

    </div>

  )

}