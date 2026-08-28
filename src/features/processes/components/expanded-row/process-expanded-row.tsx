"use client"

import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"

import {
  useEffect,
  useState,
  type ReactNode,
} from "react"

import {
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation"

import {
  Activity,
  ArrowRight,
  Clock,
  MessageSquare,
  Puzzle,
} from "lucide-react"

import type { ProcessTask } from "../../types/process.types"

import {
  EntityExpandedContent,
  EntityExpandedRow,
  EntityExpandedToggle,
} from "@/shared/ui/entity-expanded-row"

import {
  KpiCarousel,
  type KpiItem,
} from "@/shared/ui/mini-card/kpi-carousel"

import { ProcessDesktopKpiStrip } from "./process-desktop-kpi-strip"

import {
  useResponsive,
} from "@/shared/responsive/hooks/use-responsive"

import {
  getProcessProgress,
} from "@/features/processes/selectors/get-process-progress"

import {
  useActiveCommentContextStore,
} from "@/features/comments/store/active-comment-context-store"

import { ProcessProductionCard } from "./cards/process-production-card"
import { ProcessMaterialCard } from "./cards/process-material-card"
import { ProcessPaintCard } from "./cards/process-paint-card"
import { ProcessAssemblyCard } from "./cards/process-assembly-card"
import { ProcessDispatchCard } from "./cards/process-dispatch-card"
import { ProcessTimeCard } from "./cards/process-time-card"
import { ProcessProgressCard } from "./cards/process-progress-card"

import {
  CommentHistoryDialog,
} from "@/features/comments/components/comment-history-dialog"

type Props = {
  processTask: ProcessTask

  /** Ojo / materiales / auditoría — misma fila que toggle + KPIs. */
  headerActions?: ReactNode
}

export function ProcessExpandedRow({
  processTask,
  headerActions,
}: Props) {
  const {
    isMobile,
    isCompact,
    ready,
  } = useResponsive()

  const searchParams =
    useSearchParams()

  const router =
    useRouter()

  const pathname =
    usePathname()

  const route =
    useDeepLinkRoute(
      s => s.route,
    )

  const isTarget =
    route?.taskId ===
    processTask.task.id

  const tabParam =
    route?.tab

  const arrived =
    route?.phase === "arrived"

  const processCode =
    processTask.workflowStep
      ?.processCode

  const workflowStepId =
    processTask.workflowStep
      ?.id

  const totalComments =
    processTask.workflowStep
      ?.commentCount ?? 0

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

  const cardSize =
    isMobile
      ? "large"
      : "default"

  const cards: React.ReactNode[] = [
    ...(isMaterialProcess
      ? [
          <ProcessProductionCard
            key="production"
            size={cardSize}
            processTask={
              processTask
            }
          />,

          <ProcessMaterialCard
            key="material"
            size={cardSize}
            processTask={
              processTask
            }
          />,
        ]
      : []),

    ...(isPaintProcess
      ? [
          <ProcessProductionCard
            key="production"
            size={cardSize}
            processTask={
              processTask
            }
          />,

          <ProcessPaintCard
            key="paint"
            size={cardSize}
            processTask={
              processTask
            }
          />,
        ]
      : []),

    ...(isAssemblyProcess
      ? [
          <ProcessAssemblyCard
            key="assembly"
            size={cardSize}
            processTask={
              processTask
            }
          />,

          <ProcessPaintCard
            key="paint"
            size={cardSize}
            processTask={
              processTask
            }
            readOnly
          />,
        ]
      : []),

    ...(isDispatchProcess
      ? [
          <ProcessDispatchCard
            key="dispatch"
            size={cardSize}
            processTask={
              processTask
            }
          />,

          <ProcessPaintCard
            key="paint"
            size={cardSize}
            processTask={
              processTask
            }
            readOnly
          />,
        ]
      : []),

    <ProcessTimeCard
      key="time"
      size={cardSize}
      processTask={
        processTask
      }
    />,

    <ProcessProgressCard
      key="progress"
      size={cardSize}
      processTask={
        processTask
      }
    />,
  ]

  type ProcessView =
    | "kpis"
    | "comments"

  const [
    activeView,
    setActiveView,
  ] =
    useState<ProcessView>(
      "kpis",
    )

  const [
    commentsDialogOpen,
    setCommentsDialogOpen,
  ] =
    useState(false)

  useEffect(() => {
    if (
      !isTarget ||
      !arrived
    )
      return

    if (
      tabParam ===
      "comments"
    ) {
      setCommentsDialogOpen(
        true,
      )

      setActiveView(
        "kpis",
      )

      useDeepLinkRoute
        .getState()
        .finish()

      return
    }

    setActiveView(
      "kpis",
    )
  }, [
    isTarget,
    arrived,
    tabParam,
  ])

  const setActiveTarget =
    useActiveCommentContextStore(
      s => s.setActiveTarget,
    )

  useEffect(() => {
    if (
      commentsDialogOpen &&
      workflowStepId
    ) {
      setActiveTarget({
        scope:
          "workflowStep",
        workflowStepId,
      })
    }

    return () => {
      setActiveTarget(
        null,
      )
    }
  }, [
    commentsDialogOpen,
    workflowStepId,
    setActiveTarget,
  ])

  const {
    percent,
    statusLabel,
    nextProcessLabel,
    nextProcessCode,
  } =
    getProcessProgress(
      processTask,
    )

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
      value:
        nextProcessLabel,
    },

    {
      icon: Puzzle,
      color: "#3b9bb8",
      label: "Piezas",
      value:
        processTask.task
          .pieces,
    },

    {
      icon: Clock,
      color: "#b8a42a",
      label: "Lote",
      value:
        `L${processTask.task.lotNumber}`,
    },
  ]

  return (
    <EntityExpandedRow
      rowId={
        processTask.task.id
      }
    >
      <EntityExpandedContent>

        {/* =====================================================
            FILA SUPERIOR

            IZQUIERDA:
            Toggle KPIs / Mensajes

            DERECHA:
            Eye / Layers / Info
            ===================================================== */}
        <div className="mb-2 flex w-full min-w-0 items-center select-none">

          {/* -----------------------------------------------
              CONTROLES DE VISTA — IZQUIERDA
              ----------------------------------------------- */}
          <div className="shrink-0">
            <EntityExpandedToggle<ProcessView>
              value={
                activeView
              }
              onChange={(
                next,
              ) => {
                if (
                  next ===
                  "comments"
                ) {
                  setCommentsDialogOpen(
                    true,
                  )

                  return
                }

                setActiveView(
                  next,
                )
              }}
              className="w-auto"
              options={[
                {
                  value:
                    "kpis",
                  label:
                    "KPIs",
                  icon:
                    Activity,
                },

                ...(workflowStepId
                  ? ([
                      {
                        value:
                          "comments",
                        label:
                          "Mensajes",
                        icon:
                          MessageSquare,

                        ...(totalComments >
                        0
                          ? {
                              count:
                                totalComments,
                            }
                          : {}),
                      },
                    ] as {
                      value:
                        ProcessView
                      label:
                        string
                      icon:
                        typeof MessageSquare
                      count?: number
                    }[])
                  : []),
              ]}
            />
          </div>

          {/* -----------------------------------------------
              ACTIONS — DERECHA

              ml-auto = empuja TODO el grupo
              hasta el extremo derecho.

              Aquí están:
              👁
              capas
              info
              ----------------------------------------------- */}
          {headerActions ? (
            <div
              className="
                ml-auto
                flex
                shrink-0
                items-center
                justify-end
                gap-1
              "
              onClick={e =>
                e.stopPropagation()
              }
              onPointerDown={e =>
                e.stopPropagation()
              }
            >
              {headerActions}
            </div>
          ) : null}
        </div>

        {/* =====================================================
            BADGE KPI
            ===================================================== */}
        {activeView ===
          "kpis" && (
          <div className="mb-2 w-full min-w-0">
            <ProcessDesktopKpiStrip
              processTask={
                processTask
              }
              percent={
                percent
              }
              statusLabel={
                statusLabel
              }
              nextProcessLabel={
                nextProcessLabel
              }
              nextProcessCode={
                nextProcessCode
              }
            />
          </div>
        )}

      </EntityExpandedContent>

      {/* =====================================================
          COMMENTS
          ===================================================== */}
      {workflowStepId ? (
        <CommentHistoryDialog
          target={{
            scope:
              "workflowStep",
            workflowStepId,
          }}
          open={
            commentsDialogOpen
          }
          onOpenChange={open => {
            setCommentsDialogOpen(
              open,
            )

            if (!open) {
              setActiveView(
                "kpis",
              )
            }
          }}
          readOnly={
            processTask
              .workflowStep
              ?.status ===
            "REVIEWED"
          }
        />
      ) : null}
    </EntityExpandedRow>
  )
}