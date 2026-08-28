 "use client"

import { useMemo } from "react"
import { Building2, ExternalLink } from "lucide-react"

import { useWorkflowStepField } from "@/features/workflow/hooks/use-workflow-step-field"
import type { StepExecution } from "@/features/workflow/types/workflow.types"
import { workflowAccess } from "@/features/workflow/access/workflow-access"
import type { ProcessTask } from "../../types/process.types"
import { cn } from "@/shared/utils/utils"

type Props = {
  processTask: ProcessTask
  onSavingChange?: (saving: boolean) => void
}

const OPTIONS: Array<{
  value: StepExecution
  label: string
  icon: typeof Building2
}> = [
  { value: "IN_HOUSE", label: "Planta", icon: Building2 },
  { value: "OUTSOURCED", label: "Tercero", icon: ExternalLink },
]

export function ProcessExecutionCell({
  processTask,
  onSavingChange,
}: Props) {
  const updateField = useWorkflowStepField()
  const stepId = workflowAccess.stepId(processTask)
  const status = workflowAccess.status(processTask)
  const execution = processTask.workflowStep?.execution ?? "IN_HOUSE"

  const editable =
    status !== "COMPLETED" &&
    status !== "REVIEWED"

  const selected = useMemo(
    () => OPTIONS.find(option => option.value === execution) ?? OPTIONS[0],
    [execution],
  )

  async function changeExecution(next: StepExecution) {
    if (!stepId || !editable || next === execution) return

    onSavingChange?.(true)
    try {
      // Al cambiar el destino de ejecución se limpia la asignación:
      // un operario de planta no debe quedar asignado accidentalmente
      // a un proceso que acaba de pasar a tercero, y viceversa.
      await updateField(
        stepId,
        {
          execution: next,
          operatorId: null,
          coOperatorIds: [],
        },
        {
          execution: next,
          operatorId: null,
          operator: null,
          coOperatorIds: [],
        },
      )
    } finally {
      onSavingChange?.(false)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg bg-foreground/5 p-1",
        !editable && "opacity-60",
      )}
      aria-label="Tipo de ejecución"
    >
      {OPTIONS.map(option => {
        const active = option.value === selected.value
        const Icon = option.icon

        return (
          <button
            key={option.value}
            type="button"
            disabled={!editable}
            onClick={() => void changeExecution(option.value)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors",
              active
                ? "bg-foreground/12 text-foreground"
                : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground",
            )}
            title={option.value === "IN_HOUSE"
              ? "Ejecutar en planta"
              : "Ejecutar con un tercero"}
          >
            <Icon size={13} />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
