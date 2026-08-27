"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
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
  TaskProductionPanel,
} from "./production/task-production-panel"

import { TaskRowActions } from "../actions/task-row-actions"
import { DetailAssetsEye } from "@/features/detail-assets/components/detail-assets-eye"
import { CommentHistoryDialog } from "@/features/comments/components/comment-history-dialog"
import { useActiveCommentContextStore } from "@/features/comments/store/active-comment-context-store"
import { useFocusSettleStore } from "@/shared/focus/store/focus-settle-store"
import { consumeCommentsTabParam } from "@/shared/hooks/consume-comments-tab"
import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

type Props = {
  task: Task
}


export function TaskExpandedRow({
  task,
}: Props) {
  const { isMobile, isCompact } = useResponsive()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

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

  // Reposo = badge compacto; el usuario abre indicadores con el badge entero.
  const [
    indicatorsExpanded,
    setIndicatorsExpanded,
  ] = useState(false)

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
      // Consumir tab: F5 no debe reabrir Mensajes.
      consumeCommentsTabParam(router, pathname, searchParams)
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
    router,
    pathname,
    searchParams,
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