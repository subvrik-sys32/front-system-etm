"use client"

import { Truck } from "lucide-react"

import { ProcessMiniCard } from "@/shared/ui/mini-card/process-mini-card"
import { ProcessEditableValue } from "./process-editable-value"

import { workflowAccess } from "@/features/workflow/access/workflow-access"
import { useWorkflowStepField } from "@/features/workflow/hooks/use-workflow-step-field"

import type { ProcessTask } from "../../../types/process.types"

type Props = {
  processTask: ProcessTask
}

const toNumber = (value: unknown): number | null => {

  if (value == null) {
    return null
  }

  const text = String(value).trim()

  if (text === "") {
    return null
  }

  const number = Number(text)

  return Number.isFinite(number)
    ? number
    : null

}

export function ProcessDispatchCard({ processTask }: Props) {

  const updateField = useWorkflowStepField()

  const locked =
    workflowAccess.isCompleted(processTask) ||
    workflowAccess.status(processTask) === "REVIEWED"

  const stepId = workflowAccess.stepId(processTask)

  return (
    <ProcessMiniCard
      label="Despacho"
      icon={Truck}
      color="#06B6D4"
      rows={[
        {
          label: "Ingreso",
          value: processTask.inputQuantity ?? "-",
          editable: false,
        },
        {
          label: "Despachadas",
          value: (
            <ProcessEditableValue
              numeric
              value={workflowAccess.piecesOutput(processTask) ?? null}
              suffix="UND"
              disabled={locked}
              onSave={async value => {

                if (!stepId) return

                const piecesOutput = toNumber(value)

                await updateField(
                  stepId,
                  { piecesOutput },
                  { piecesOutput },
                )
              }}
            />
          ),
          editable: true,
        },
      ]}
    />
  )
}