"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Activity, ArrowRight, Clock, Clock3, MessageSquare, Package, Puzzle, Layers3 } from "lucide-react"

import type { ProcessTask } from "../../types/process.types"

import {
  EntityExpandedContent,
  EntityExpandedRow,
  EntityExpandedToggle,
  EntityExpandedSlider,
} from "@/shared/ui/entity-expanded-row"

import { KpiCarousel, type KpiItem } from "@/shared/ui/mini-card/kpi-carousel"
import { ProcessDesktopKpiStrip } from "./process-desktop-kpi-strip"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { getProcessProgress } from "@/features/processes/selectors/get-process-progress"
import { useActiveCommentContextStore } from "@/features/comments/store/active-comment-context-store"

import { ProcessProductionCard } from "./cards/process-production-card"
import { ProcessMaterialCard } from "./cards/process-material-card"
import { ProcessPaintCard } from "./cards/process-paint-card"
import { ProcessAssemblyCard } from "./cards/process-assembly-card"
import { ProcessDispatchCard } from "./cards/process-dispatch-card"
import { ProcessTimeCard } from "./cards/process-time-card"
import { ProcessProgressCard } from "./cards/process-progress-card"
import { CommentHistoryDialog } from "@/features/comments/components/comment-history-dialog"
import { useFocusSettleStore } from "@/shared/focus/store/focus-settle-store"
import { useFocusNavStore } from "@/shared/focus/store/focus-nav-store"
import { consumeCommentsTabParam } from "@/shared/hooks/consume-comments-tab"

type Props = {
  processTask: ProcessTask
  /** Ojo / materiales / auditoría — misma fila que toggle + KPIs. */
  headerActions?: ReactNode
}




export function ProcessExpandedRow({
  processTask,
  headerActions,
}: Props) {
  const { isMobile, isCompact, ready } = useResponsive()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const urlTaskId = searchParams.get("taskId")
  const isTarget = urlTaskId === processTask.task.id
  const tabParam = searchParams.get("tab") as "comments" | "kpis"

  const processCode =
    processTask.workflowStep?.processCode

  const workflowStepId =
    processTask.workflowStep?.id

  // activeView / dialog se declaran más abajo; el count del badge
  // no justifica fetch de todos los comentarios de cada fila.
  // CommentHistoryDialog / panel de mensajes hacen su propio fetch con enabled.
  const totalComments =
    processTask.workflowStep?.commentCount ?? 0

  const isMaterialProcess =
    processCode === "CT" ||
    processCode === "PL" ||
    processCode === "SD"

  const isPaintProcess =
    processCode === "PT"

  const isAssemblyProcess =
    processCode === "EN"

  const isDispatchProcess =
    processCode === "DS"

  const cardSize = isMobile ? "large" : "default"

  const cards: React.ReactNode[] = [
    ...(isMaterialProcess
      ? [
          <ProcessProductionCard
            key="production"
            size={cardSize}
            processTask={processTask}
          />,
          <ProcessMaterialCard
            key="material"
            size={cardSize}
            processTask={processTask}
          />,
        ]
      : []),

    ...(isPaintProcess
      ? [
          <ProcessProductionCard
            key="production"
            size={cardSize}
            processTask={processTask}
          />,
          <ProcessPaintCard
            key="paint"
            size={cardSize}
            processTask={processTask}
          />,
        ]
      : []),

    ...(isAssemblyProcess
      ? [
          <ProcessAssemblyCard
            key="assembly"
            size={cardSize}
            processTask={processTask}
          />,
          <ProcessPaintCard
            key="paint"
            size={cardSize}
            processTask={processTask}
            readOnly
          />,
        ]
      : []),

    ...(isDispatchProcess
      ? [
          <ProcessDispatchCard
            key="dispatch"
            size={cardSize}
            processTask={processTask}
          />,
          <ProcessPaintCard
            key="paint"
            size={cardSize}
            processTask={processTask}
            readOnly
          />,
        ]
      : []),

    <ProcessTimeCard
      key="time"
      size={cardSize}
      processTask={processTask}
    />,

    <ProcessProgressCard
      key="progress"
      size={cardSize}
      processTask={processTask}
    />,
  ]

  // Solo "kpis" es vista del slider; "comments" abre dialog y no cambia activeView.
  type ProcessView = "kpis" | "comments"
  const [
    activeView,
    setActiveView,
  ] = useState<ProcessView>("kpis")

  const [
    commentsDialogOpen,
    setCommentsDialogOpen,
  ] = useState(false)

  const urlFocusToken = searchParams.get("focus")
  const settledToken = useFocusSettleStore(s => s.settledToken)
  const navActive = useFocusNavStore(s => s.active)
  // Mensajes solo cuando la ruta terminó Y el overlay ya no está.
  const focusSettled =
    (!urlFocusToken || settledToken === urlFocusToken) && !navActive

  useEffect(() => {
    if (!isTarget) {
      return
    }

    if (tabParam === "comments") {
      if (!focusSettled) {
        return
      }

      setCommentsDialogOpen(true)
      setActiveView("kpis")
      // Consumir tab: F5 no debe reabrir Mensajes.
      consumeCommentsTabParam(router, pathname, searchParams)
      return
    }

    setActiveView("kpis")
  }, [
    isTarget,
    tabParam,
    focusSettled,
    navActive,
  ])

  const setActiveTarget = useActiveCommentContextStore(s => s.setActiveTarget)

  useEffect(() => {

    if (commentsDialogOpen && workflowStepId) {
      setActiveTarget({ scope: "workflowStep", workflowStepId })
    }

    return () => {
      setActiveTarget(null)
    }

  }, [commentsDialogOpen, workflowStepId, setActiveTarget])

  const { percent, statusLabel, nextProcessLabel, nextProcessCode } = getProcessProgress(processTask)

  const items: KpiItem[] = [
    {
      icon: Activity,
      color: "#22C55E",
      label: "Estado",
      value: statusLabel,
    },
    {
      icon: Activity,
      color: "#22C55E",
      label: "Avance",
      value: `${percent}%`,
    },
    {
      icon: ArrowRight,
      color: "#64748B",
      label: "Siguiente",
      value: nextProcessLabel,
    },
    {
      icon: Puzzle,
      color: "#3b9bb8",
      label: "Piezas",
      value: processTask.task.pieces,
    },
    {
      icon: Clock,
      color: "#b8a42a",
      label: "Lote",
      value: `L${processTask.task.lotNumber}`,
    },
  ]

  return (
    <EntityExpandedRow rowId={processTask.task.id}>
      <EntityExpandedContent>
        {/* Fila 1: toggle + actions (+ strip en desktop si cabe en la fila) */}
        <div className="mb-2 flex min-w-0 flex-nowrap items-center gap-2 select-none">
          <div className="shrink-0">
            <EntityExpandedToggle<ProcessView>
              value={activeView}
              onChange={(next) => {
                if (next === "comments") {
                  setCommentsDialogOpen(true)
                  return
                }
                setActiveView(next)
              }}
              className="w-auto"
              options={[
                {
                  value: "kpis",
                  label: "KPIs",
                  icon: Activity,
                },
                ...(workflowStepId
                  ? ([
                      {
                        value: "comments",
                        label: "Mensajes",
                        icon: MessageSquare,
                        ...(totalComments > 0 ? { count: totalComments } : {}),
                      },
                    ] as {
                      value: ProcessView
                      label: string
                      icon: typeof MessageSquare
                      count?: number
                    }[])
                  : []),
              ]}
            />
          </div>
          {headerActions ? (
            <div
              className="flex shrink-0 items-center gap-1"
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
            >
              {headerActions}
            </div>
          ) : null}
        </div>

        {/* Badge compacto: siempre debajo del toggle */}
        {activeView === "kpis" && (
          <div className="mb-2 w-full min-w-0">
            <ProcessDesktopKpiStrip
              processTask={processTask}
              percent={percent}
              statusLabel={statusLabel}
              nextProcessLabel={nextProcessLabel}
              nextProcessCode={nextProcessCode}
            />
          </div>
        )}

        <EntityExpandedSlider
          value={activeView}
          panels={[
            {
              value: "kpis" as const,
              // Desktop: KPIs en el header (cards completas). Móvil: carousel.
              content:
                !ready || !isMobile
                  ? null
                  : (
                      <KpiCarousel
                        cards={cards}
                        items={items}
                        summary={{
                          icon: Activity,
                          color: "#22C55E",
                          label: "Progreso",
                          values: [
                            { label: "Estado", value: statusLabel },
                            { label: "Avance", value: `${percent}%` },
                          ],
                        }}
                      />
                    ),
            },
          ]}
        />
      </EntityExpandedContent>

      {workflowStepId ? (
        <CommentHistoryDialog
          target={{ scope: "workflowStep", workflowStepId }}
          open={commentsDialogOpen}
          onOpenChange={setCommentsDialogOpen}
          readOnly={processTask.workflowStep?.status === "REVIEWED"}
        />
      ) : null}
    </EntityExpandedRow>
  )
}