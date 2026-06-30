"use client"

import { PaintBucket } from "lucide-react"

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

export function ProcessPaintCard({ processTask }: Props) {

  const updateField = useWorkflowStepField()

  const color = processTask.task.color

  const locked = workflowAccess.isCompleted(processTask)

  const stepId = workflowAccess.stepId(processTask)

  return (
    <ProcessMiniCard
      label="Pintura"
      icon={PaintBucket}
      color={color?.color ?? "#F97316"}
      rows={[
        {
          label: "Color",
          value: color?.name ?? "-",
        },
        {
          label: "Pedido",
          value: `${processTask.task.paintKg} KG`,
        },
        {
          label: "Real",
          value: (
            <ProcessEditableValue
              numeric
              value={workflowAccess.paintKgReal(processTask) ?? null}
              suffix="KG"
              disabled={locked}
              onSave={async value => {

                if (!stepId) return

                const paintKgReal = toNumber(value)

                await updateField(
                  stepId,
                  { paintKgReal },
                  { paintKgReal },
                )
              }}
            />
          ),
        },
      ]}
    />
  )
}