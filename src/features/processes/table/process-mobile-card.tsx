"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronDown, MessageSquare, User, UserX } from "lucide-react"

import { CollapsibleHeightSection } from "@/shared/ui/collapsible-height-section"
import { cn } from "@/shared/utils/utils"
import { useDomainInk } from "@/shared/utils/use-badge-colors"
import { formatDate } from "@/shared/utils/date-format"
import { ProjectCodeChip } from "@/features/projects/components/project-code-chip"
import {
  ENTITY_ICONS,
  type EntityIcon,
} from "@/shared/constants/entity-icons"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { workflowAccess } from "@/features/workflow/access/workflow-access"
import type { ProcessTask } from "../types/process.types"
import { processAccess } from "../access/process-access"

import { ProcessOperatorCell } from "../components/cells/process-operator-cell"
import { ProcessExecutionCell } from "../components/cells/process-execution-cell"
import { ProcessRowActions } from "../components/actions/process-row-actions"
import { DetailAssetsEye } from "@/features/detail-assets/components/detail-assets-eye"
import { EntityAuditInfo } from "@/shared/ui/entity-audit-info/entity-audit-info"
import { TaskMaterialInfo } from "@/features/tasks/components/task-material-info"
import { ProcessExpandedRow } from "../components/expanded-row/process-expanded-row"

function EntityIconBadge({
  icon,
  color,
  size = 12,
}: {
  icon?: EntityIcon
  color: string
  size?: number
}) {
  if (!icon) return null
  const Icon = ENTITY_ICONS[icon]
  if (!Icon) return null
  return <Icon size={size} strokeWidth={2.25} style={{ color }} className="shrink-0" />
}

type Props =
  | {
      loading: true
      opacity?: number
      processTask?: undefined
      expanded?: boolean
      dimOthers?: boolean
      onToggle?: () => void
    }
  | {
      loading?: false
      opacity?: number
      processTask: ProcessTask
      expanded: boolean
      dimOthers?: boolean
      onToggle: () => void
    }


function OperatorNameText({
  name,
  color,
  className,
}: {
  name: string
  color?: string | null
  className?: string
}) {
  const ink = useDomainInk(color)
  return (
    <span className={className} style={{ color: ink }}>
      {name}
    </span>
  )
}


/** Loading = mismo shell que la fila real (estilo bitácora). */
export function ProcessMobileCard(props: Props) {
  if (props.loading) {
    const opacity = props.opacity ?? 1
    return (
      <div className="@container/prow rounded-xl bg-foreground/5" style={{ opacity }} aria-hidden>
        <div className="flex items-center gap-1 px-1">
          <div className="flex min-w-0 flex-1 animate-pulse items-center gap-2.5 py-3 pr-2">
            <span className="inline-flex h-7 min-w-[2.75rem] shrink-0 items-center justify-center rounded-md bg-foreground/10 px-2" />
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
              <span className="h-4 w-[40%] max-w-[11rem] rounded bg-foreground/10" />
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-foreground/15" />
                <span className="h-3 w-20 rounded bg-foreground/5" />
              </span>
            </div>
            <span className="hidden h-3 w-14 shrink-0 rounded bg-foreground/5 md:block" />
          </div>
        </div>
      </div>
    )
  }
  return (
    <ProcessMobileCardReady
      processTask={props.processTask}
      expanded={props.expanded}
      dimOthers={props.dimOthers}
      onToggle={props.onToggle}
    />
  )
}

function ProcessMobileCardReady({
  processTask,
  expanded,
  dimOthers = false,
  onToggle,
}: {
  processTask: ProcessTask
  expanded: boolean
  dimOthers?: boolean
  onToggle: () => void
}) {
  const [showFields, setShowFields] = useState(false)

  const { isMobile } = useResponsive()
  const task = processAccess.task(processTask)
  const project = processAccess.project(processTask)
  const priority = processAccess.priority(processTask)
  const operator = processAccess.operator(processTask)
  const coCount = processTask.workflowStep?.coOperatorIds?.length ?? 0
  const operatorLabel = operator
    ? coCount > 0
      ? `${operator.name} +${coCount}`
      : operator.name
    : null

  useEffect(() => {
    if (!expanded) setShowFields(false)
  }, [expanded])

  function handleRowToggle() {
    onToggle()
  }
  const statusLabel = workflowAccess.statusLabel(processTask)
  const priorityInk = useDomainInk(priority.color)
  const statusInk = useDomainInk(statusLabel.color)
  const operatorInk = useDomainInk(operator?.color)

  const stepId = workflowAccess.stepId(processTask)
  const processCode = workflowAccess.processCode(processTask)

  const isCompleted = workflowAccess.isCompleted(processTask)
  const isDimmed = isCompleted || (dimOthers && !expanded)

  return (
    <div className={cn("@container/prow rounded-xl bg-foreground/5", isDimmed && "opacity-50")}>
      <div className="flex items-center gap-1 px-1">
        <div
          role="button"
          tabIndex={0}
          onClick={handleRowToggle}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleRowToggle()
            }
          }}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-3 pr-2 pl-3 text-left"
        >
          {/* Chip = mismo componente/contrato que proyectos (padding + color) */}
          <ProjectCodeChip
            code={project.projectCode}
            color={project.client.color}
          />

          <div className="flex min-w-0 flex-1 flex-col items-start">
            {/* Referencia principal + iconos de prioridad y estado en línea */}
            <div className="flex min-w-0 max-w-full items-center gap-1.5">
              {isMobile ? (
                <span className="max-w-full truncate text-sm font-semibold leading-none text-foreground">
                  {task.reference}
                </span>
              ) : (
                <Link
                  href={`/tasks?taskId=${task.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-full truncate text-sm font-semibold leading-none text-foreground transition-colors hover:text-primary"
                >
                  {task.reference}
                </Link>
              )}
              <span className="shrink-0 text-muted-foreground/85">·</span>
              <span
                className="inline-flex size-5 shrink-0 items-center justify-center self-center"
                title={priority.name}
              >
                <EntityIconBadge
                  icon={priority.icon}
                  color={priority.color}
                  size={16}
                />
              </span>
              <span className="shrink-0 text-muted-foreground/85">·</span>
              <span
                className="inline-flex size-5 shrink-0 items-center justify-center self-center"
                title={statusLabel.label}
              >
                <EntityIconBadge
                  icon={statusLabel.icon}
                  color={statusLabel.color}
                  size={16}
                />
              </span>
            </div>

            {/* Línea inferior: Cliente con su icono corporativo y Operario con icono y color de asignación */}
            <div
              className={cn(
                "mt-0.5 flex min-w-0 items-center gap-1.5 text-xs",
                expanded && "hidden",
              )}
            >
              <span className="inline-flex min-w-0 shrink items-center gap-1.5 text-muted-foreground">
                <EntityIconBadge
                  icon={project.client.icon ?? "factory"}
                  color={project.client.color}
                  size={12}
                />
                <span className="truncate">{project.client.name}</span>
              </span>

              <span className="shrink-0 text-muted-foreground/85">·</span>
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="inline-flex items-center">
                  {operator ? (
                    <EntityIconBadge
                      icon={operator.icon}
                      color={operatorInk}
                      size={12}
                    />
                  ) : (
                    <UserX size={12} className="shrink-0 text-muted-foreground" />
                  )}
                </span>
                {operatorLabel ? (
                  <OperatorNameText
                    name={operatorLabel}
                    color={operator?.color}
                    className="truncate font-medium"
                  />
                ) : (
                  <span className="truncate text-muted-foreground">
                    Sin asignar
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Mensajes del proceso — solo si hay */}
          {(processTask.workflowStep?.commentCount ?? 0) > 0 && (
            <span
              title={
                processTask.workflowStep?.commentCount === 1
                  ? "1 mensaje del proceso"
                  : `${processTask.workflowStep?.commentCount} mensajes del proceso`
              }
              className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center gap-0.5 rounded-full bg-sky-500/15 px-1.5 text-[10px] font-semibold tabular-nums text-sky-700 dark:text-sky-300"
            >
              <MessageSquare size={10} strokeWidth={2.5} />
              {processTask.workflowStep?.commentCount}
            </span>
          )}

          {/* Fecha */}
          <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground @[40rem]/prow:inline">
            {formatDate(task.deliveryDate)}
          </span>

        </div>

        {stepId && processCode && (
          <div
            className="w-30 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <ProcessRowActions
              task={task}
              stepId={stepId}
              status={workflowAccess.status(processTask)}
              processCode={processCode}
            />
          </div>
        )}

        {/* Info + materiales + ojo detalle: después de Iniciar */}
        {!expanded && (
          <div
            className="flex shrink-0 items-center gap-1 pr-0.5"
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <DetailAssetsEye taskId={task.id} readOnly count={task.detailAssetCount ?? 0} />
            <span className="hidden items-center gap-1 md:inline-flex">
              <TaskMaterialInfo task={task} alwaysShow />
              <EntityAuditInfo
                createdAt={task.createdAt}
                updatedAt={task.updatedAt}
                createdBy={task.createdBy}
                updatedBy={task.updatedBy}
                workflowSteps={task.workflowSteps}
              />
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleRowToggle}
          className="shrink-0 p-2"
        >
          <ChevronDown
            size={16}
            className={cn(
              "text-muted-foreground",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>

      <CollapsibleHeightSection open={expanded} className="space-y-3 px-3 pb-3 pt-3">
        <button
          type="button"
          onClick={() => setShowFields(v => !v)}
          className="flex w-full items-center gap-2 rounded-lg bg-foreground/5 px-3 py-2.5 transition hover:bg-foreground/5"
        >
          {showFields ? (
            <span className="min-w-0 flex-1 text-left text-xs font-medium text-muted-foreground">
              Ocultar campos
            </span>
          ) : (
            <span className="flex min-w-0 flex-1 items-center gap-3 text-sm">
              {/* Cliente */}
              <span
                className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground"
                title={project.client.name}
              >
                <EntityIconBadge
                  icon={project.client.icon ?? "factory"}
                  color={project.client.color}
                  size={14}
                />
                <span className="truncate">{project.client.name}</span>
              </span>

              <span className="shrink-0 text-muted-foreground/50">·</span>

              {/* Prioridad */}
              <span
                className="inline-flex min-w-0 items-center gap-1.5"
                title={priority.name}
                style={{ color: priorityInk }}
              >
                <EntityIconBadge
                  icon={priority.icon}
                  color={priorityInk}
                  size={14}
                />
                <span className="hidden truncate md:inline">{priority.name}</span>
              </span>

              <span className="shrink-0 text-muted-foreground/50">·</span>

              {/* Estado */}
              <span
                className="inline-flex min-w-0 items-center gap-1.5"
                title={statusLabel.label}
                style={{ color: statusInk }}
              >
                <EntityIconBadge
                  icon={statusLabel.icon}
                  color={statusInk}
                  size={14}
                />
                <span className="hidden truncate md:inline">{statusLabel.label}</span>
              </span>

              <span className="shrink-0 text-muted-foreground/50">·</span>

              {/* Operario / Sin asignar */}
              <span
                className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground"
                title={operatorLabel ?? "Sin asignar"}
              >
                {operator ? (
                  <EntityIconBadge
                    icon={operator.icon}
                    color={operatorInk}
                    size={14}
                  />
                ) : (
                  <UserX size={14} className="shrink-0 text-muted-foreground" />
                )}
                {operatorLabel ? (
                  <OperatorNameText
                    name={operatorLabel}
                    color={operator?.color}
                    className="truncate font-medium"
                  />
                ) : (
                  <span className="truncate">Sin asignar</span>
                )}
              </span>
            </span>
          )}
          <ChevronDown
            size={14}
            className={cn(
              "shrink-0 text-muted-foreground",
              showFields && "rotate-180",
            )}
          />
        </button>

        <CollapsibleHeightSection open={showFields} className="flex flex-col gap-2">
          <ProcessExecutionCell processTask={processTask} />
          <ProcessOperatorCell
              processTask={processTask}
              triggerVariant="row"
              rowLabel="Asignar operario"
            />
        </CollapsibleHeightSection>

        <ProcessExpandedRow
          processTask={processTask}
          headerActions={
            <>
              <DetailAssetsEye taskId={task.id} readOnly count={task.detailAssetCount ?? 0} />
              <TaskMaterialInfo task={task} alwaysShow />
              <EntityAuditInfo
                createdAt={task.createdAt}
                updatedAt={task.updatedAt}
                createdBy={task.createdBy}
                updatedBy={task.updatedBy}
                workflowSteps={task.workflowSteps}
              />
            </>
          }
        />
      </CollapsibleHeightSection>
    </div>
  )
}