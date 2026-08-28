"use client"

import { useDomainInk } from "@/shared/utils/use-badge-colors"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { ChevronDown, MessageSquare, UserRound, UserX } from "lucide-react"

import { CollapsibleHeightSection } from "@/shared/ui/collapsible-height-section"
import { cn } from "@/shared/utils/utils"
import { formatDate } from "@/shared/utils/date-format"
import { EntityAuditInfo } from "@/shared/ui/entity-audit-info/entity-audit-info"
import {
  ENTITY_ICONS,
  type EntityIcon,
} from "@/shared/constants/entity-icons"

import type { Project } from "../types/project.types"
import type { Task } from "@/features/tasks/types/task.types"

import { isProjectCompleted } from "../selectors/is-project-completed"

import { ProjectClientCell } from "../components/cells/project-client-cell"
import { ProjectStageCell } from "../components/cells/project-stage-cell"
import { ProjectStatusCell } from "../components/cells/project-status-cell"
import { ProjectPmCell } from "../components/cells/project-pm-cell"
import { DetailAssetsEye } from "@/features/detail-assets/components/detail-assets-eye"
import { ProjectExpandedRow } from "../components/expanded-row/project-expanded-row"
import { DragCell } from "@/shared/ui/entity-table-common/drag-cell"
import { useSortStore } from "@/shared/sorting/store/sort-store"
import { TaskDialog } from "@/features/tasks/components/dialog/task-dialog"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { ProjectCodeChip } from "@/features/projects/components/project-code-chip"


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
      project?: undefined
      tasks?: undefined
      expanded?: boolean
      dimOthers?: boolean
      onToggle?: () => void
    }
  | {
      loading?: false
      opacity?: number
      project: Project
      tasks: Task[]
      expanded: boolean
      dimOthers?: boolean
      onToggle: () => void
    }

export function ProjectMobileCard(props: Props) {
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
          </div>
        </div>
      </div>
    )
  }
  return (
    <ProjectMobileCardReady
      project={props.project}
      tasks={props.tasks}
      expanded={props.expanded}
      dimOthers={props.dimOthers}
      onToggle={props.onToggle}
    />
  )
}

function ProjectMobileCardReady({
  project,
  tasks,
  expanded,
  dimOthers = false,
  onToggle,
}: {
  project: Project
  tasks: Task[]
  expanded: boolean
  dimOthers?: boolean
  onToggle: () => void
}) {
  const [showFields, setShowFields] = useState(false)
  const [newTaskOpen, setNewTaskOpen] = useState(false)

  const { isMobile } = useResponsive()
  const isManualMode = useSortStore(s => s.projectSortMode === "manual")
  const { has } = usePermissions()
  const canCreateTask = has(PermissionCode.TASK_CREATE)
  const searchParams = useSearchParams()
  const isTarget = searchParams.get("projectId") === project.id

  useEffect(() => {
    if (!expanded) setShowFields(false)
  }, [expanded])

  function handleRowToggle() {
    onToggle()
  }

  const isCompleted = isProjectCompleted(project)
  const isDimmed = isCompleted || (dimOthers && !expanded)
  
  const stageInk = useDomainInk(project.stage.color)
  const statusInk = useDomainInk(project.status.color)
  const pmInk = useDomainInk(project.pm.color)

  return (
    <div className={cn("@container/prow rounded-xl bg-foreground/5", isDimmed && "opacity-50")}>
      <div className="flex items-center gap-1 px-1">
        <DragCell hidden={!isManualMode} />

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
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-3 pr-2 text-left",
            !isManualMode && "pl-3",
          )}
        >
          <ProjectCodeChip
            code={project.projectCode}
            color={project.client.color}
          />

          <div className="flex min-w-0 flex-1 flex-col items-start">
            {/* Fila superior: Nombre separado por puntos con los iconos de Etapa y Estado */}
            <div className="flex min-w-0 max-w-full items-center gap-1.5">
              <span className="max-w-full truncate text-sm font-semibold leading-none text-foreground">
                {project.name}
              </span>

              <span className="shrink-0 text-muted-foreground/85">·</span>

              <span className="inline-flex shrink-0 items-center" title={project.stage.name}>
                <EntityIconBadge
                  icon={project.stage.icon}
                  color={stageInk}
                  size={14}
                />
              </span>

              <span className="shrink-0 text-muted-foreground/85">·</span>

              <span className="inline-flex shrink-0 items-center" title={project.status.name}>
                <EntityIconBadge
                  icon={project.status.icon}
                  color={statusInk}
                  size={14}
                />
              </span>
            </div>

            {/* Fila inferior colapsada: Cliente y PM */}
            <div
              className={cn(
                "mt-1 flex min-w-0 items-center gap-1.5 text-xs",
                expanded && "hidden",
              )}
            >
              <span className="inline-flex min-w-0 shrink items-center gap-1.5 text-muted-foreground">
                <EntityIconBadge
                  icon={project.client.icon ?? "client"}
                  color={project.client.color}
                  size={12}
                />
                <span className="truncate">{project.client.name}</span>
              </span>

              <span className="shrink-0 text-muted-foreground/85">·</span>

              <span className="flex min-w-0 items-center gap-1.5">
                <span className="inline-flex items-center">
                  <UserRound size={12} strokeWidth={2.25} className="shrink-0" style={{ color: pmInk }} />
                </span>
                <span className="truncate font-medium" style={{ color: pmInk }}>
                  {project.pm.name}
                </span>
              </span>
            </div>
          </div>

          {/* Contadores si existen */}
          {!expanded &&
            ((project.taskCount ?? 0) > 0 ||
              (project.commentCount ?? 0) > 0) && (
            <span className="flex shrink-0 items-center gap-1">
              {(project.taskCount ?? 0) > 0 && (
                <span
                  title={
                    project.taskCount === 1
                      ? "1 tarea activa"
                      : `${project.taskCount} tareas activas`
                  }
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600/20 px-1.5 text-[10px] font-bold tabular-nums text-green-900 dark:bg-green-500/15 dark:text-green-300"
                >
                  {project.taskCount}
                </span>
              )}
              {(project.commentCount ?? 0) > 0 && (
                <span
                  title={
                    project.commentCount === 1
                      ? "1 mensaje"
                      : `${project.commentCount} mensajes`
                  }
                  className="inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-full bg-sky-500/15 px-1.5 text-[10px] font-semibold tabular-nums text-sky-700 dark:text-sky-300"
                >
                  <MessageSquare size={10} strokeWidth={2.5} />
                  {project.commentCount}
                </span>
              )}
            </span>
          )}

          {/* Fecha */}
          <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground @[40rem]/prow:inline">
            {formatDate(project.deliveryDate)}
          </span>
        </div>

        {/* Ojo de activos y auditoría en modo compacto */}
        {!expanded && (
          <div
            className="flex shrink-0 items-center gap-1 pr-0.5"
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <DetailAssetsEye projectId={project.id} count={project.detailAssetCount ?? 0} />
            <span className="hidden items-center gap-1 md:inline-flex">
              <EntityAuditInfo
                createdAt={project.createdAt}
                updatedAt={project.updatedAt}
                createdBy={project.createdBy}
                updatedBy={project.updatedBy}
              />
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleRowToggle}
          className="shrink-0 p-2"
          aria-label={expanded ? "Colapsar" : "Expandir"}
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
        {/* Barra desplegable de Etapa y Estado */}
        <button
          type="button"
          onClick={() => setShowFields(v => !v)}
          className="flex w-full items-center justify-between rounded-lg bg-foreground/5 px-3 py-2.5 transition hover:bg-foreground/5"
        >
          <div className="flex min-w-0 items-center gap-3 text-sm">
            {/* Etapa */}
            <span
              className="inline-flex min-w-0 items-center gap-1.5 font-medium"
              style={{ color: stageInk }}
            >
              <EntityIconBadge
                icon={project.stage.icon}
                color={stageInk}
                size={14}
              />
              <span className="truncate">{project.stage.name}</span>
            </span>

            <span className="shrink-0 text-muted-foreground/50">·</span>

            {/* Estado */}
            <span
              className="inline-flex min-w-0 items-center gap-1.5 font-medium"
              style={{ color: statusInk }}
            >
              <EntityIconBadge
                icon={project.status.icon}
                color={statusInk}
                size={14}
              />
              <span className="truncate">{project.status.name}</span>
            </span>
          </div>

          <ChevronDown
            size={14}
            className={cn(
              "shrink-0 text-muted-foreground transition-transform duration-200",
              showFields && "rotate-180",
            )}
          />
        </button>

        {/* Contenido colapsable interno */}
        <CollapsibleHeightSection open={showFields} className="flex flex-col gap-2">
          <ProjectClientCell project={project} triggerVariant="row" rowLabel="Cliente" />
          <ProjectStageCell project={project} triggerVariant="row" rowLabel="Etapa" />
          <ProjectStatusCell project={project} triggerVariant="row" rowLabel="Estado" />
          <ProjectPmCell project={project} triggerVariant="row" rowLabel="PM" />
        </CollapsibleHeightSection>

        <ProjectExpandedRow project={project} tasks={tasks} />
      </CollapsibleHeightSection>

      {newTaskOpen && (
        <TaskDialog
          open
          projectId={project.id}
          promptOpenAfterCreate
          onClose={() => setNewTaskOpen(false)}
        />
      )}
    </div>
  )
}