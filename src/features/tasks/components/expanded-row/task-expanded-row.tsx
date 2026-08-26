"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ClipboardList, MessageSquare } from "lucide-react"

import type {
  Task,
} from "../../types/task.types"

import {
  EntityExpandedContent,
  EntityExpandedRow,
  EntityExpandedToggle,
  EntityExpandedSlider,
} from "@/shared/ui/entity-expanded-row"

import {
  useResponsive,
} from "@/shared/responsive/hooks/use-responsive"
import { useComments } from "@/features/comments/hooks/use-comments"

import {
  TaskKpisSection,
} from "./task-kpis-section"

import {
  TaskProductionPanel,
} from "./production/task-production-panel"

import { TaskRowActions } from "../actions/task-row-actions"
import { TaskRouteViewer } from "./production/task-route-viewer"
import { getCurrentStep } from "@/features/workflow/selectors/get-current-step"
import { createWorkflowView } from "@/features/workflow/view/create-workflow-view"
import { WORKFLOW_STATUS_DEFINITIONS } from "@/features/workflow/constants/workflow-status-definitions"
import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
import { DetailAssetsEye } from "@/features/detail-assets/components/detail-assets-eye"
import { CommentHistoryDialog } from "@/features/comments/components/comment-history-dialog"
import { useActiveCommentContextStore } from "@/features/comments/store/active-comment-context-store"
import { useFocusSettleStore } from "@/shared/focus/store/focus-settle-store"
import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"
import { cn } from "@/shared/utils/utils"

type Props = {
  task: Task
}


function TaskDesktopRouteStrip({ task }: { task: Task }) {
  const currentStep = getCurrentStep(task.workflowSteps)
  const workflowView = createWorkflowView(task.workflowSteps)
  const statusDef = currentStep
    ? WORKFLOW_STATUS_DEFINITIONS[currentStep.status]
    : null
  const StatusIcon = statusDef?.icon
    ? ENTITY_ICONS[statusDef.icon]
    : undefined

  return (
    <div className="flex min-h-8 min-w-0 flex-wrap items-center justify-end gap-2">
      <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        <TaskRouteViewer
          variant="inline"
          taskId={task.id}
          route={task.route}
          currentProcess={currentStep?.processCode}
        />
      </div>
      <div className="flex h-8 min-h-8 w-full min-w-[9rem] max-w-[16rem] shrink-0 items-center gap-2 self-center rounded-lg bg-foreground/5 px-2.5 shadow-xs sm:w-auto">
        <div className="flex min-w-0 shrink items-center gap-1">
          {StatusIcon && (
            <StatusIcon size={12} className="shrink-0 text-muted-foreground" />
          )}
          <span className="truncate text-[10px] font-bold uppercase tracking-wide text-foreground">
            {statusDef?.label ?? "—"}
          </span>
        </div>
        <div className="h-1.5 min-w-[2rem] flex-1 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all"
            style={{ width: `${workflowView.progress}%` }}
          />
        </div>
        <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold tabular-nums text-muted-foreground">
          {workflowView.completedSteps}/{workflowView.totalSteps}
          <span className="text-foreground"> · {workflowView.progress}%</span>
        </span>
      </div>
    </div>
  )
}

export function TaskExpandedRow({
  task,
}: Props) {
  const { isMobile, isCompact } = useResponsive()
  const searchParams = useSearchParams()

  const urlTaskId = searchParams.get("taskId")
  const isTarget = urlTaskId === task.id
  const tabParam = searchParams.get("tab")

  const [
    activeView,
    setActiveView,
  ] = useState<"workflow" | "comments">("workflow")

  const [
    commentsDialogOpen,
    setCommentsDialogOpen,
  ] = useState(false)

  // Ruta / indicadores: abiertos al expandir la tarea; el usuario decide cerrar.
  const [
    indicatorsExpanded,
    setIndicatorsExpanded,
  ] = useState(true)

  // Solo fetch al ver mensajes — no por cada fila de la lista.
  const commentsEnabled =
    activeView === "comments" || commentsDialogOpen

  const { comments } = useComments(
    { scope: "task", taskId: task.id },
    commentsEnabled,
  )
  // Solo comentarios de la TAREA (scope task). Los de proceso
  // viven en workflowStep.commentCount — no mezclar.
  const totalComments = commentsEnabled
    ? comments.length
    : (task.commentCount ?? 0)

  const urlFocusToken = searchParams.get("focus")
  const settledToken = useFocusSettleStore(s => s.settledToken)
  // Si no hay token en la URL (no vino de un deep-link), no hay nada
  // que esperar — se abre directo, como antes.
  const focusSettled = !urlFocusToken || settledToken === urlFocusToken

  useEffect(() => {
    if (!isTarget) {
      return
    }

    if (tabParam === "comments") {
      // Esperar scroll+expand del deep-link; luego abrir dialog en
      // todos los breakpoints (ya no hay panel inline de mensajes).
      if (!focusSettled) {
        return
      }

      setActiveView("comments")
      setCommentsDialogOpen(true)
      return
    }

    if (tabParam === "kpis") {
      setActiveView("workflow")
      return
    }

    setActiveView("workflow")
  }, [
    isTarget,
    tabParam,
    isMobile,
    focusSettled,
  ])

  const setActiveTarget = useActiveCommentContextStore(s => s.setActiveTarget)

  useEffect(() => {

    const isViewingComments =
      (!isMobile && activeView === "comments") ||
      (isMobile && commentsDialogOpen)

    if (isViewingComments) {
      setActiveTarget({ scope: "task", taskId: task.id })
    }

    return () => {
      setActiveTarget(null)
    }

  }, [activeView, commentsDialogOpen, isMobile, task.id, setActiveTarget])

  const handleViewChange = (
    next: "workflow" | "comments",
  ) => {
    // Mensajes: siempre dialog (sin panel inline summary/composer).
    if (next === "comments") {
      setCommentsDialogOpen(true)
      return
    }

    setActiveView(next)
  }

  return (
    <EntityExpandedRow
      rowId={task.id}
    >
      <EntityExpandedContent>
        <div className="mb-2 flex flex-wrap items-center gap-2 select-none">
          <div className="min-w-0 shrink-0">
            <EntityExpandedToggle
              value={activeView}
              onChange={handleViewChange}
              className="w-auto"
              options={[
                {
                  value: "workflow",
                  label: isCompact ? "Detalle" : "Workflow",
                  icon: ClipboardList,
                },
                {
                  value: "comments",
                  label: "Mensajes",
                  icon: MessageSquare,
                  count: totalComments,
                },
              ]}
            />
          </div>
          <div
            className="flex shrink-0 items-center gap-1"
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
          >
            <DetailAssetsEye
              taskId={task.id}
              count={task.detailAssetCount ?? 0}
            />
            <TaskRowActions task={task} className="gap-1" showAudit />
          </div>
          {/*
            Misma fila del toggle, a la derecha:
            - Desktop: ruta + barra + chips KPI
            - Compact: solo chips KPI (sin ruta ni barra)
          */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            {!isCompact && task.route?.length > 0 && (
              <div className="min-w-0 max-w-full">
                <TaskDesktopRouteStrip task={task} />
              </div>
            )}
            <div className="min-w-0 max-w-full">
              <TaskKpisSection task={task} density="compact" />
            </div>
          </div>
        </div>

        <EntityExpandedSlider
          value={activeView}
          panels={[
            {
              value: "workflow",
              content: (
                <TaskProductionPanel
                  task={task}
                  indicatorsExpanded={indicatorsExpanded}
                  onIndicatorsExpandedChange={setIndicatorsExpanded}
                  showCollapseButton
                />
              ),
            },
          ]}
        />
      </EntityExpandedContent>

      <CommentHistoryDialog
        target={{ scope: "task", taskId: task.id }}
        open={commentsDialogOpen}
        onOpenChange={setCommentsDialogOpen}
        readOnly={isWorkflowCompleted(task.workflowSteps)}
      />
    </EntityExpandedRow>
  )
}