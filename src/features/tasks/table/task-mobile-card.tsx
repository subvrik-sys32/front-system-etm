"use client"

import { useBadgeColors, useDomainInk } from "@/shared/utils/use-badge-colors"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFocusNavStore } from "@/shared/focus/store/focus-nav-store"
import { useSearchParams } from "next/navigation"
import { ChevronDown, MessageSquare } from "lucide-react"

import { CollapsibleHeightSection } from "@/shared/ui/collapsible-height-section"
import { cn } from "@/shared/utils/utils"
import { formatDate } from "@/shared/utils/date-format"
import { EntityAuditInfo } from "@/shared/ui/entity-audit-info/entity-audit-info"
import { displayProjectCode } from "@/features/projects/utils/display-project-code"
import {
  ENTITY_ICONS,
  type EntityIcon,
} from "@/shared/constants/entity-icons"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import type { Task } from "../types/task.types"
import { taskAccess } from "../access/task-access"

import { TaskPriorityCell } from "../components/cells/task-priority-cell"
import { TaskDialog } from "../components/dialog/task-dialog"
import { DetailAssetsEye } from "@/features/detail-assets/components/detail-assets-eye"
import { TaskExpandedRow } from "../components/expanded-row/task-expanded-row"
import { DragCell } from "@/shared/ui/entity-table-common/drag-cell"
import { useSortStore } from "@/shared/sorting/store/sort-store"
import { useLongPress } from "@/features/tasks/pipeline/hooks/use-long-press"

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
      task?: undefined
      expanded?: boolean
      dimOthers?: boolean
      onToggle?: () => void
    }
  | {
      loading?: false
      opacity?: number
      task: Task
      expanded: boolean
      dimOthers?: boolean
      onToggle: () => void
    }

/** Loading = mismo shell que la fila real (estilo bitácora). */

function taskDetailAssetCount(task: Task): number {
  if (typeof task.detailAssetCount === "number") return task.detailAssetCount
  const dxf =
    task.materialLines?.reduce(
      (n, l) => n + (l.detailAssets?.length ?? 0),
      0,
    ) ?? 0
  return dxf
}

export function TaskMobileCard(props: Props) {
  if (props.loading) {
    const opacity = props.opacity ?? 1
    return (
      <div
        className="@container/trow rounded-xl bg-foreground/5"
        style={{ opacity }}
        aria-hidden
      >
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
    <TaskMobileCardReady
      task={props.task}
      expanded={props.expanded}
      dimOthers={props.dimOthers}
      onToggle={props.onToggle}
    />
  )
}

function TaskMobileCardReady({
  task,
  expanded,
  dimOthers = false,
  onToggle,
}: {
  task: Task
  expanded: boolean
  dimOthers?: boolean
  onToggle: () => void
}) {
  const [showFields, setShowFields] = useState(false)
  const [showPipeline, setShowPipeline] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const { isMobile } = useResponsive()
  const isManualMode = useSortStore(s => s.taskSortMode === "manual")
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToProject = useCallback(() => {
    useFocusNavStore.getState().start("Abriendo proyecto…")
    router.push(`/projects?projectId=${task.project.id}`)
  }, [router, task.project.id])

  const { bind: projectChipLongPress, pressed: projectChipPressed } =
    useLongPress({
      onLongPress: goToProject,
      threshold: 320,
    })

  const isTarget = searchParams.get("taskId") === task.id
  const projectChipBadge = useBadgeColors(
    task.project?.client?.color ?? "#64748B",
    "subtle",
  )

  useEffect(() => {
    if (expanded) {
      setShowPipeline(true)
      return
    }
    setShowFields(false)
    setShowPipeline(false)
  }, [expanded])

  function handleRowToggle() {
    onToggle()
  }

  useEffect(() => {
    if (expanded && isTarget) {
      setShowPipeline(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, isTarget])

  const stage = taskAccess.stageLabel(task)
  const status = taskAccess.statusLabel(task)
  const priorityInk = useDomainInk(task.priority.color)
  const stageInk = useDomainInk(stage.color)
  const statusInk = useDomainInk(status.color)

  const isCompleted = taskAccess.isCompleted(task)
  const isDimmed = isCompleted || (dimOthers && !expanded)

  const openEditMaterials = () => setEditOpen(true)

  return (
    <div
      className={cn(
        "@container/trow rounded-xl bg-foreground/5",
        isDimmed && "opacity-50",
      )}
    >
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
            // Sin drag: misma holgura izquierda que process (pl-2)
            !isManualMode && "pl-2",
          )}
        >
          {/* Chip código: desktop click → proyecto; móvil long-press → proyecto */}
          <span
            role="link"
            tabIndex={0}
            title={
              isMobile
                ? "Mantén pulsado para abrir el proyecto"
                : "Abrir proyecto"
            }
            onClick={e => {
              e.stopPropagation()
              if (!isMobile) goToProject()
            }}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                e.stopPropagation()
                if (!isMobile) goToProject()
              }
            }}
            onPointerDown={e => e.stopPropagation()}
            {...(isMobile
              ? {
                  onTouchStart: (e: React.TouchEvent) => {
                    e.stopPropagation()
                    projectChipLongPress.onTouchStart(e)
                  },
                  onTouchMove: projectChipLongPress.onTouchMove,
                  onTouchEnd: projectChipLongPress.onTouchEnd,
                }
              : {})}
            className={cn(
              "shrink-0 select-none rounded-md px-2 py-1 text-[11px] font-semibold tracking-wide transition-opacity",
              isMobile ? "cursor-default" : "cursor-pointer hover:opacity-80",
              projectChipPressed && "opacity-60 scale-95",
            )}
            style={{
              backgroundColor: projectChipBadge.background,
              color: projectChipBadge.text,
            }}
          >
            {displayProjectCode(task.project.projectCode)}
          </span>

          <div className="flex min-w-0 flex-1 flex-col items-start">
            {/* md+: referencia · solo iconos (16px). Mobile: solo referencia */}
            <div className="flex min-w-0 max-w-full items-center gap-1.5">
              <p className="max-w-full truncate text-sm font-semibold leading-none text-foreground">
                {task.reference}
              </p>
              <span className="hidden shrink-0 self-center text-muted-foreground/80 md:inline">
                ·
              </span>
              <span
                className="hidden size-5 shrink-0 items-center justify-center self-center md:inline-flex"
                title={stage.label}
              >
                <EntityIconBadge
                  icon={stage.icon}
                  color={stage.color}
                  size={16}
                />
              </span>
              <span className="hidden shrink-0 self-center text-muted-foreground/80 md:inline">
                ·
              </span>
              <span
                className="hidden size-5 shrink-0 items-center justify-center self-center md:inline-flex"
                title={status.label}
              >
                <EntityIconBadge
                  icon={status.icon}
                  color={status.color}
                  size={16}
                />
              </span>
            </div>

            {/* Mobile: cliente · iconos · prioridad | md+: cliente · prioridad */}
            <div
              className={cn(
                "mt-0.5 flex min-w-0 max-w-full items-center gap-1.5 text-xs",
                expanded && "hidden",
              )}
            >
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: task.project.client.color }}
              />
              <span className="min-w-0 truncate text-muted-foreground">
                {task.project.client.name}
              </span>

              <span className="shrink-0 text-muted-foreground/80 md:hidden">
                ·
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 md:hidden">
                <EntityIconBadge
                  icon={stage.icon}
                  color={stage.color}
                  size={12}
                />
              </span>
              <span className="shrink-0 text-muted-foreground/80 md:hidden">
                ·
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 md:hidden">
                <EntityIconBadge
                  icon={status.icon}
                  color={status.color}
                  size={12}
                />
              </span>

              <span className="shrink-0 text-muted-foreground/80">·</span>
              <span className="flex min-w-0 items-center gap-1">
                <span className="md:hidden">
                  {task.priority.icon ? (
                    <EntityIconBadge
                      icon={task.priority.icon}
                      color={task.priority.color ?? "#a3a3a3"}
                      size={12}
                    />
                  ) : (
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: priorityInk }}
                    >
                      {task.priority.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span
                  className="hidden min-w-0 truncate md:inline"
                  style={{ color: priorityInk }}
                >
                  {task.priority.name}
                </span>
              </span>
            </div>
          </div>

          {/* Mensajes solo colapsado y solo si hay */}
          {!expanded && (task.commentCount ?? 0) > 0 && (
            <span
              title={
                task.commentCount === 1
                  ? "1 mensaje"
                  : `${task.commentCount} mensajes`
              }
              className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center gap-0.5 rounded-full bg-sky-500/15 px-1.5 text-[10px] font-semibold tabular-nums text-sky-700 dark:text-sky-300"
            >
              <MessageSquare size={10} strokeWidth={2.5} />
              {task.commentCount}
            </span>
          )}

          <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground @[40rem]/trow:inline">
            {formatDate(task.deliveryDate)}
          </span>
        </div>

        {!expanded && (
          <div
            className="flex shrink-0 items-center gap-1 pr-0.5"
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <DetailAssetsEye
              taskId={task.id}
              count={taskDetailAssetCount(task)}
              onEditTask={openEditMaterials}
            />
            <span className="hidden items-center gap-1 md:inline-flex">
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
          aria-label={expanded ? "Colapsar" : "Expandir"}
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

      <CollapsibleHeightSection
        open={expanded}
        className="space-y-3 px-3 pb-3 pt-3"
      >
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
                style={{ backgroundColor: task.project.client.color }}
              />
              <span className="shrink-0 truncate">
                {task.project.client.name}
              </span>
              <span className="shrink-0 text-muted-foreground/80">·</span>
              <span
                className="hidden truncate md:inline"
                style={{ color: stageInk }}
              >
                {stage.label}
              </span>
              <span className="inline-flex md:hidden">
                <EntityIconBadge
                  icon={stage.icon}
                  color={stage.color}
                  size={13}
                />
              </span>
              <span className="shrink-0 text-muted-foreground/80">·</span>
              <span
                className="hidden truncate md:inline"
                style={{ color: statusInk }}
              >
                {status.label}
              </span>
              <span className="inline-flex md:hidden">
                <EntityIconBadge
                  icon={status.icon}
                  color={status.color}
                  size={13}
                />
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

        <CollapsibleHeightSection
          open={showFields}
          className="flex flex-col gap-2"
        >
          <TaskPriorityCell
            task={task}
            triggerVariant="row"
            rowLabel="Prioridad"
          />
        </CollapsibleHeightSection>

        <CollapsibleHeightSection open={showPipeline}>
          <TaskExpandedRow task={task} />
        </CollapsibleHeightSection>
      </CollapsibleHeightSection>

      <TaskDialog
        open={editOpen}
        task={task}
        onClose={() => setEditOpen(false)}
      />
    </div>
  )
}