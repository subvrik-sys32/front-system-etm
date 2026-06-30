"use client"

import { Puzzle } from "lucide-react"

import { ProcessMiniCard } from "@/shared/ui/mini-card/process-mini-card"
import { ProcessEditableValue } from "./process-editable-value"

import { workflowAccess } from "@/features/workflow/access/workflow-access"
import { useWorkflowStepField } from "@/features/workflow/hooks/use-workflow-step-field"

import type { ProcessTask } from "../../../types/process.types"

type Props = {
  processTask: ProcessTask
}

const toNumber = (value: unknown) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function ProcessAssemblyCard({ processTask }: Props) {

  const updateField = useWorkflowStepField()

  const locked = workflowAccess.isCompleted(processTask)

  const stepId = workflowAccess.stepId(processTask)

  return (
    <ProcessMiniCard
      label="Ensamble"
      icon={Puzzle}
      color="#8B5CF6"
      rows={[
        {
          label: "Ingreso",
          value: processTask.inputQuantity ?? "-",
        },
        {
          label: "Unidades",
          value: processTask.task.assemblyCount,
        },
        {
          label: "Salida",
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
        },
      ]}
    />
  )
}