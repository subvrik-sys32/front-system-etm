"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronDown, MessageSquare } from "lucide-react"

import { CollapsibleHeightSection } from "@/shared/ui/collapsible-height-section"
import { cn } from "@/shared/utils/utils"
import { useBadgeColors, useDomainInk } from "@/shared/utils/use-badge-colors"
import { formatDate } from "@/shared/utils/date-format"
import { displayProjectCode } from "@/features/projects/utils/display-project-code"
import {
  ENTITY_ICONS,
  type EntityIcon,
} from "@/shared/constants/entity-icons"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { workflowAccess } from "@/features/workflow/access/workflow-access"
import type { ProcessTask } from "../types/process.types"
import { processAccess } from "../access/process-access"

import { ProcessOperatorCell } from "../components/cells/process-operator-cell"
import { ProcessRowActions } from "../components/actions/process-row-actions"
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
  const projectChipBadge = useBadgeColors(
    project.client?.color ?? "#64748B",
    "subtle",
  )
  const priority = processAccess.priority(processTask)
  const operator = processAccess.operator(processTask)

  // Al colapsar el row, resetear showFields al terminar la animación (no en el mismo frame).
  useEffect(() => {
    if (expanded) return
    const t = window.setTimeout(() => setShowFields(false), 200)
    return () => window.clearTimeout(t)
  }, [expanded])

  /** Cierra campos primero (200ms) y recién después colapsa el row — evita salto de altura. */
  function handleRowToggle() {
    if (expanded && showFields) {
      setShowFields(false)
      window.setTimeout(() => onToggle(), 200)
      return
    }
    onToggle()
  }
  const statusLabel = workflowAccess.statusLabel(processTask)
  const priorityInk = useDomainInk(priority.color)
  const statusInk = useDomainInk(statusLabel.color)

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
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-3 pr-2 pl-2 text-left"
        >
          {/* Código del proyecto YY-NNN — más grande solo en desktop */}
          <span
            className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold tracking-wide"
            style={{
              backgroundColor: projectChipBadge.background,
              color: projectChipBadge.text,
            }}
          >
            {displayProjectCode(project.projectCode)}
          </span>

          <div className="flex min-w-0 flex-1 flex-col items-start">
            {/* md+: referencia · iconos prio/estado. Mobile: solo nombre */}
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
              <span className="shrink-0 self-center text-muted-foreground/80">·</span>
              <span
                className="inline-flex size-5 shrink-0 items-center justify-center self-center"
                title={priority.name}
              >
                <EntityIconBadge
                  icon={priority.icon}
                  color={priority.color}
                  size={isMobile ? 12 : 16}
                />
              </span>
              <span className="shrink-0 self-center text-muted-foreground/80">·</span>
              <span
                className="inline-flex size-5 shrink-0 items-center justify-center self-center"
                title={statusLabel.label}
              >
                <EntityIconBadge
                  icon={statusLabel.icon}
                  color={statusLabel.color}
                  size={isMobile ? 12 : 16}
                />
              </span>
            </div>

            {/* Mobile: cliente · iconos prio/estado · operario | md+: cliente · operario */}
            <div
              className={cn(
                "mt-0.5 flex min-w-0 items-center gap-1.5 text-xs transition-all duration-200",
                expanded
                  ? "max-h-0 opacity-0"
                  : "max-h-5 opacity-100",
              )}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: project.client.color }}
              />
              <span className="shrink-0 truncate text-muted-foreground">
                {project.client.name}
              </span>

              {/* Mobile: iconos prio/estado · operario-icon | md+: operario nombre (como tasks/projects) */}
              <span className="shrink-0 text-muted-foreground/80 md:hidden">·</span>
              <span className="inline-flex shrink-0 items-center gap-1 md:hidden">
                <EntityIconBadge
                  icon={priority.icon}
                  color={priority.color}
                  size={12}
                />
              </span>
              <span className="shrink-0 text-muted-foreground/80 md:hidden">·</span>
              <span className="inline-flex shrink-0 items-center gap-1 md:hidden">
                <EntityIconBadge
                  icon={statusLabel.icon}
                  color={statusLabel.color}
                  size={12}
                />
              </span>

              <span className="shrink-0 text-muted-foreground/80">·</span>
              <span className="flex min-w-0 items-center gap-1">
                <span className="md:hidden">
                  <EntityIconBadge
                    icon={operator?.icon}
                    color={operator?.color ?? "#a3a3a3"}
                    size={12}
                  />
                </span>
                {operator ? (
                  <OperatorNameText
                    name={operator.name}
                    color={operator.color}
                    className="hidden truncate md:inline"
                  />
                ) : (
                  <span className="hidden truncate text-muted-foreground md:inline">
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

          {/* Fecha entrega — después de mensajes */}
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

        {/* Info + materiales: solo colapsado y con ancho; al expandir van junto a la zona de acciones */}
        {!expanded && (
          <div
            className="hidden shrink-0 items-center gap-1 pr-0.5 @[40rem]/prow:flex"
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <EntityAuditInfo
              createdAt={task.createdAt}
              updatedAt={task.updatedAt}
              createdBy={task.createdBy}
              updatedBy={task.updatedBy}
            />
            <TaskMaterialInfo task={task} alwaysShow />
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
              "text-muted-foreground transition-transform duration-200",
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
            <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-muted-foreground">
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: project.client.color }}
              />
              <span className="shrink-0 truncate">{project.client.name}</span>
              <span className="shrink-0 text-muted-foreground/80">·</span>
              <span className="flex shrink-0 items-center gap-1">
                <span className="md:hidden">
                  <EntityIconBadge icon={priority.icon} color={priority.color} size={13} />
                </span>
                <span className="hidden truncate md:inline" style={{ color: priorityInk }}>
                  {priority.name}
                </span>
              </span>
              <span className="shrink-0 text-muted-foreground/80">·</span>
              <span className="flex shrink-0 items-center gap-1">
                <span className="md:hidden">
                  <EntityIconBadge icon={statusLabel.icon} color={statusLabel.color} size={13} />
                </span>
                <span className="hidden truncate md:inline" style={{ color: statusInk }}>
                  {statusLabel.label}
                </span>
              </span>
            </span>
          )}
          <ChevronDown
            size={14}
            className={cn(
              "shrink-0 text-muted-foreground transition-transform duration-200",
              showFields && "rotate-180",
            )}
          />
        </button>

        <CollapsibleHeightSection open={showFields} className="flex flex-col gap-2">
          <ProcessOperatorCell
              processTask={processTask}
              triggerVariant="row"
              rowLabel="Asignar operario"
            />
        </CollapsibleHeightSection>

        {/* Debajo del selector de campos: auditoría + materiales */}
        <div
          className="flex items-center justify-start gap-1"
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          <EntityAuditInfo
            createdAt={task.createdAt}
            updatedAt={task.updatedAt}
            createdBy={task.createdBy}
            updatedBy={task.updatedBy}
          />
          <TaskMaterialInfo task={task} alwaysShow />
        </div>

        <ProcessExpandedRow processTask={processTask} />
      </CollapsibleHeightSection>
    </div>
  )
}
