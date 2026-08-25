"use client"

import { Info } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDateTime } from "@/shared/utils/date-format"
import { CHROME_ICON_BTN } from "@/shared/ui/actions/icon-action"
import { cn } from "@/shared/utils/utils"
import type { WorkflowStep } from "@/features/workflow/types/workflow.types"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { ScrollArea } from "@/components/ui/scroll-area"

type AuditUser = { id: string; name: string }

type Props = {
  createdAt?: string | null
  updatedAt?: string | null
  createdBy?: AuditUser | null
  updatedBy?: AuditUser | null
  /** Pasos de workflow: quién opera / estado / timestamps */
  workflowSteps?: WorkflowStep[] | null
  className?: string
}

const STATUS_LABEL: Record<string, string> = {
  QUEUE: "En cola",
  PENDING: "Pendiente",
  PROGRESS: "En progreso",
  PAUSED: "Pausado",
  COMPLETED: "Completado",
  REVIEWED: "Revisado",
}

export function EntityAuditInfo({
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
  workflowSteps,
  className,
}: Props) {
  const rows = [
    { label: "Creado por", value: createdBy?.name ?? "—" },
    { label: "Creado", value: formatDateTime(createdAt) },
    { label: "Última modificación", value: formatDateTime(updatedAt) },
    ...(updatedBy
      ? [{ label: "Modificado por", value: updatedBy.name }]
      : []),
  ]

  const steps = (workflowSteps ?? []).slice().sort((a, b) => a.order - b.order)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Información de auditoría"
          title="Auditoría"
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          className={cn(CHROME_ICON_BTN, className)}
        >
          <Info size={14} strokeWidth={2.25} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={12}
        floatingClassName="w-72"
        className="gap-0 p-0"
      >
        <div className="border-b border-border/50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Información
          </p>
        </div>
        <div className="flex flex-col gap-2.5 px-3 py-3">
          {rows.map(row => (
            <div key={row.label} className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {row.label}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                {row.value}
              </p>
            </div>
          ))}
        </div>

        {steps.length > 0 && (
          <>
            <div className="border-t border-border/50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Flujo de trabajo
              </p>
            </div>
            <ScrollArea className="max-h-52">
            <ul className="flex flex-col gap-1 px-2 pb-3">
              {steps.map(step => {
                const def = PROCESS_DEFINITIONS[step.processCode]
                const processName = def?.label ?? step.processCode
                const status = STATUS_LABEL[step.status] ?? step.status
                const who = step.operator?.name ?? "Sin asignar"
                const when =
                  step.completedAt ??
                  step.startedAt ??
                  (step.status === "PAUSED" ? step.updatedAt : null)

                return (
                  <li
                    key={step.id}
                    className="rounded-lg px-2 py-2 hover:bg-foreground/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-semibold text-foreground">
                        {processName}
                      </span>
                      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {who}
                      {when ? ` · ${formatDateTime(when)}` : ""}
                    </p>
                  </li>
                )
              })}
            </ul>
            </ScrollArea>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
