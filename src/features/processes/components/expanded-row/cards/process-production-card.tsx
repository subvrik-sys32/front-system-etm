"use client"

import { Puzzle } from "lucide-react"

import { ProcessMiniCard } from "@/shared/ui/mini-card/process-mini-card"
import { ProcessEditableValue } from "./process-editable-value"

import { useWorkflowStepField } from "@/features/workflow/hooks/use-workflow-step-field"
import { getWorkflowStepContext } from "@/features/workflow/utils/get-workflow-step-context"

import type { ProcessTask } from "../../../types/process.types"

const toNumber = (value: unknown) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

type Props = {
  processTask: ProcessTask
}

export function ProcessProductionCard({
  processTask,
}: Props) {

  const updateField =
    useWorkflowStepField()

  const { stepId, locked } =
    getWorkflowStepContext(processTask)

  const workflowStep =
    processTask.workflowStep

  const showOutput =
    ["CT", "PL", "SD", "PT"].includes(
      workflowStep?.processCode ?? "",
    )

  const showPlRt =
    workflowStep?.processCode === "CT"

  const plRtSuffix =
    processTask.task.plRt
      ?.replace(/\d+/g, "")
      .trim() ?? ""

  return (
    <ProcessMiniCard
      label="Producción"
      icon={Puzzle}
      color="#f99d9d"
      rows={[
        {
          label: "Entrada",
          value: processTask.inputQuantity ?? "-",
        },

        ...(showOutput
          ? [{
              label: "Salida",
              value: (
                <ProcessEditableValue
                  numeric
                  value={workflowStep?.piecesOutput ?? null}
                  disabled={locked}
                  onSave={async value => {

                    if (!stepId) return

                    const piecesOutput =
                      toNumber(value)

                    await updateField(
                      stepId,
                      { piecesOutput },
                      { piecesOutput },
                    )
                  }}
                />
              ),
            }]
          : []),

        ...(showPlRt
          ? [{
              label: "PL/RT",
              value: (
                <ProcessEditableValue
                  numeric
                  value={workflowStep?.plRtReal ?? null}
                  suffix={plRtSuffix}
                  disabled={locked}
                  onSave={async value => {

                    if (!stepId) return

                    const plRtReal =
                      toNumber(value)

                    await updateField(
                      stepId,
                      { plRtReal },
                      { plRtReal },
                    )
                  }}
                />
              ),
            }]
          : []),

      ]}
    />
  )
}