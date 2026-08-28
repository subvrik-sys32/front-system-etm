"use client"

import { Check, ChevronDown, Factory, Truck } from "lucide-react"
import { useState } from "react"

import { cn } from "@/shared/utils/utils"
import { useWorkflowStepField } from "@/features/workflow/hooks/use-workflow-step-field"
import type { StepExecution } from "@/features/workflow/types/workflow.types"
import type { ProcessTask } from "../../types/process.types"
import { workflowAccess } from "@/features/workflow/access/workflow-access"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

const OPTIONS: Array<{
  value: StepExecution
  label: string
  description: string
  icon: typeof Factory
}> = [
  {
    value: "IN_HOUSE",
    label: "Planta",
    description: "Ejecutado internamente",
    icon: Factory,
  },
  {
    value: "OUTSOURCED",
    label: "Tercero",
    description: "Ejecutado externamente",
    icon: Truck,
  },
]

const NON_EDITABLE_STATUSES = ["COMPLETED", "REVIEWED"] as const

export function ProcessExecutionCell({
  processTask,
  onSavingChange,
  triggerVariant = "row",
}: {
  processTask: ProcessTask
  onSavingChange?: (saving: boolean) => void
  triggerVariant?: "badge" | "row"
}) {
  const updateField = useWorkflowStepField()
  const [open, setOpen] = useState(false)
  const step = processTask.workflowStep
  const current = step?.execution ?? "IN_HOUSE"
  const status = workflowAccess.status(processTask)
  const editable =
    !!step && !NON_EDITABLE_STATUSES.includes(status as (typeof NON_EDITABLE_STATUSES)[number])
  const selected = OPTIONS.find(option => option.value === current) ?? OPTIONS[0]
  const Icon = selected.icon

  async function handleSelect(value: StepExecution) {
    if (!step || !editable || value === current) {
      setOpen(false)
      return
    }

    onSavingChange?.(true)
    setOpen(false)
    try {
      await updateField(
        step.id,
        {
          execution: value,
          operatorId: null,
          coOperatorIds: [],
        },
        {
          execution: value,
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={!editable}
          className={cn(
            "h-auto justify-between gap-2 rounded-lg px-2.5 py-2 text-left",
            triggerVariant === "row" ? "w-full" : "min-w-[150px]",
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon size={15} className="shrink-0 text-muted-foreground" />
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold">{selected.label}</span>
              {triggerVariant === "badge" && (
                <span className="text-[10px] text-muted-foreground">
                  {selected.description}
                </span>
              )}
            </span>
          </span>
          <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1.5">
        <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Ejecución
        </div>
        {OPTIONS.map(option => {
          const OptionIcon = option.icon
          const isSelected = option.value === current
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => void handleSelect(option.value)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-foreground/5"
            >
              <OptionIcon size={15} className="shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">{option.label}</span>
                <span className="block text-[10px] text-muted-foreground">
                  {option.description}
                </span>
              </span>
              {isSelected && <Check size={15} className="shrink-0" />}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
