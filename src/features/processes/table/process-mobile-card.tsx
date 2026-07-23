"use client"

import { ChevronDown } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { formatDate } from "@/shared/utils/date-format"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { WorkflowStatusBadge } from "@/features/workflow/components/workflow-status-badge"
import { workflowAccess } from "@/features/workflow/access/workflow-access"

import type { ProcessTask } from "../types/process.types"

import { processAccess } from "../access/process-access"

import { ProcessOperatorCell } from "../components/cells/process-operator-cell"
import { ProcessRowActions } from "../components/actions/process-row-actions"
import { ProcessExpandedRow } from "../components/expanded-row/process-expanded-row"

type Props = {
  processTask: ProcessTask
  expanded: boolean
  onToggle: () => void
}

// Espeja TaskMobileCard/ProjectMobileCard: header colapsado con lo
// esencial (ID, referencia, proyecto, entrega) + toggle, y al
// expandir muestra los campos de meta (cliente/prioridad/estado/
// operador) más ProcessExpandedRow (KPIs, producción, comentarios).
export function ProcessMobileCard({
  processTask,
  expanded,
  onToggle,
}: Props) {

  const task = processAccess.task(processTask)
  const project = processAccess.project(processTask)
  const priority = processAccess.priority(processTask)
  const status = workflowAccess.status(processTask)

  const stepId = workflowAccess.stepId(processTask)
  const processCode = workflowAccess.processCode(processTask)

  return (

    <div className="overflow-hidden rounded-xl bg-white/2">

      <button
        type="button"
        onClick={onToggle}
        className="flex w-full min-w-0 items-center gap-2.5 px-3 py-3 text-left"
      >

        <span
          className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide"
          style={{
            backgroundColor: `${project.client.color}15`,
            color: project.client.color,
          }}
        >
          {String(task.taskNumber).padStart(3, "0")}
        </span>

        <div className="min-w-0 flex-1">

          <p className="truncate text-sm font-semibold text-white">
            {task.reference}
          </p>

          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {project.projectCode}
          </p>

        </div>

        <span className="shrink-0 text-xs text-neutral-500">
          {formatDate(task.deliveryDate)}
        </span>

        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-neutral-500 transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />

      </button>

      {expanded && (

        <div className="space-y-3 px-3 pb-3 pt-0">

          <div className="flex flex-wrap items-center gap-2">

            <DynamicBadge
              label={project.client.name}
              color={project.client.color}
              icon={project.client.icon}
              width="field"
            />

            <DynamicBadge
              label={priority.name}
              color={priority.color}
              icon={priority.icon}
              width="field"
            />

            {status && (
              <WorkflowStatusBadge status={status} />
            )}

            <ProcessOperatorCell processTask={processTask} />

          </div>

          <div className="flex items-center justify-between">

            <span className="text-xs text-neutral-500">
              {task.reference}
            </span>

            {stepId && processCode && (

              <ProcessRowActions
                task={task}
                stepId={stepId}
                status={workflowAccess.status(processTask)}
                processCode={processCode}
              />

            )}

          </div>

          <ProcessExpandedRow
            processTask={processTask}
          />

        </div>

      )}

    </div>

  )

}