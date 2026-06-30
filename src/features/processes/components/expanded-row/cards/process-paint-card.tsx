"use client"

import { PaintBucket } from "lucide-react"

import { ProcessMiniCard } from "@/shared/ui/mini-card/process-mini-card"
import { ProcessEditableValue } from "./process-editable-value"

import { workflowAccess } from "@/features/workflow/access/workflow-access"
import { useWorkflowStepField } from "@/features/workflow/hooks/use-workflow-step-field"

import type { ProcessTask } from "../../../types/process.types"

type Props = {
  processTask: ProcessTask
  readOnly?: boolean
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

export function ProcessPaintCard({ processTask, readOnly = false }: Props) {

  const updateField = useWorkflowStepField()

  const color = processTask.task.color

  const hasPaintProcess =
    processTask.task.route.includes("PT")

  const locked = readOnly || workflowAccess.isCompleted(processTask)

  // en Ensamble/Despacho el step relevante es paintStep, no workflowStep
  const relevantStep =
    readOnly
      ? processTask.paintStep
      : processTask.workflowStep

  const paintKgReal =
    relevantStep?.paintKgReal ?? null

  const stepId =
    relevantStep?.id ?? null

  return (
    <ProcessMiniCard
      label={hasPaintProcess ? "Pintura" : "Acabado"}
      icon={PaintBucket}
      color={
        hasPaintProcess
          ? color?.color ?? "#F97316"
          : "#BBBBBB"
      }
      rows={
        hasPaintProcess
          ? [
              {
                label: "Color",
                value: color?.name ?? "-",
                editable: false,
              },
              {
                label: "Pedido",
                value: `${processTask.task.paintKg} KG`,
                editable: false,
              },
              {
                label: "Real",
                value: (
                  <ProcessEditableValue
                    numeric
                    value={paintKgReal}
                    suffix="KG"
                    disabled={locked}
                    onSave={async value => {

                      if (!stepId) return

                      const nextValue = toNumber(value)

                      await updateField(
                        stepId,
                        { paintKgReal: nextValue },
                        { paintKgReal: nextValue },
                      )
                    }}
                  />
                ),
                editable: !locked,
              },
            ]
          : [
              {
                label: "Tipo",
                value: "Natural",
                editable: false,
              },
            ]
      }
    />
  )
}