"use client"

import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"

import { useEffect, useState, type ReactNode } from "react"
import { Activity, ArrowRight, Clock, MessageSquare, Puzzle } from "lucide-react"

import type { ProcessTask } from "../../types/process.types"

import {
  EntityExpandedContent,
  EntityExpandedRow,
  EntityExpandedToggle,
} from "@/shared/ui/entity-expanded-row"

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

type Props = {
  processTask: ProcessTask

  /**
   * Acciones de la derecha:
   * ojo / material / auditoría.
   */
  headerActions?: ReactNode

  /**
   * Acciones principales del workflow:
   * iniciar / pausar / completar.
   */
  workflowActions?: ReactNode
}

export function ProcessExpandedRow({
  processTask,
  headerActions,
  workflowActions,
}: Props) {
  const {
    isMobile,
    isCompact,
  } = useResponsive()

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
    route?.phase ===
    "arrived"

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
            size={
              cardSize
            }
            processTask={
              processTask
            }
          />,

          <ProcessMaterialCard
            key="material"
            size={
              cardSize
            }
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
            size={
              cardSize
            }
            processTask={
              processTask
            }
          />,

          <ProcessPaintCard
            key="paint"
            size={
              cardSize
            }
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
            size={
              cardSize
            }
            processTask={
              processTask
            }
          />,

          <ProcessPaintCard
            key="paint"
            size={
              cardSize
            }
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
            size={
              cardSize
            }
            processTask={
              processTask
            }
          />,

          <ProcessPaintCard
            key="paint"
            size={
              cardSize
            }
            processTask={
              processTask
            }
            readOnly
          />,
        ]
      : []),

    <ProcessTimeCard
      key="time"
      size={
        cardSize
      }
      processTask={
        processTask
      }
    />,

    <ProcessProgressCard
      key="progress"
      size={
        cardSize
      }
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
  ] = useState<ProcessView>(
    "kpis",
  )

  const [
    commentsDialogOpen,
    setCommentsDialogOpen,
  ] = useState(false)

  useEffect(() => {
    if (
      !isTarget ||
      !arrived
    ) {
      return
    }

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
      s =>
        s.setActiveTarget,
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

  return (
    <EntityExpandedRow
      rowId={
        processTask.task.id
      }
    >
      <EntityExpandedContent>

        {/* =====================================================
            MOBILE
            =====================================================

            Toggle:
              izquierda

            Workflow:
              CENTRO ABSOLUTO DE LA FILA

            Actions:
              derecha
            ===================================================== */}
        {isCompact ? (
          <div
            className="
              relative
              mb-2
              flex
              w-full
              min-w-0
              items-center
              select-none
            "
          >

            {/* =================================================
                IZQUIERDA — TOGGLE
                ================================================= */}
            <div
              className="
                relative
                z-10
                flex
                shrink-0
                items-center
              "
            >
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
                        label: string
                        icon: typeof MessageSquare
                        count?: number
                      }[])
                    : []),
                ]}
              />
            </div>

            {/* =================================================
                CENTRO — WORKFLOW ACTIONS
                =================================================

                ESTO ES LO QUE CAMBIA.

                El bloque se posiciona exactamente al 50%
                del ancho total de la fila.

                Por eso pausa/check quedan centrados
                independientemente del ancho del toggle
                o de los botones de la derecha.
                ================================================= */}
            {workflowActions ? (
              <div
                className="
                  absolute
                  left-1/2
                  top-1/2
                  z-10
                  flex
                  -translate-x-1/2
                  -translate-y-1/2
                  items-center
                  justify-center
                "
                onClick={e =>
                  e.stopPropagation()
                }
                onPointerDown={e =>
                  e.stopPropagation()
                }
              >
                <div
                  className="
                    flex
                    shrink-0
                    flex-nowrap
                    items-center
                    justify-center
                  "
                >
                  {workflowActions}
                </div>
              </div>
            ) : null}

            {/* =================================================
                DERECHA — OJO / CAPAS / INFO
                ================================================= */}
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

          </div>
        ) : (
          /* ===================================================
             DESKTOP / TABLET

             SIN CAMBIOS.
             =================================================== */
          <div className="mb-2 flex min-w-0 flex-nowrap items-center gap-2 select-none">

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
                className="
                  flex
                  shrink-0
                  items-center
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
        )}

        {/* =====================================================
            KPI BADGE
            ===================================================== */}
        {activeView ===
          "kpis" && (
          <div
            className="
              mb-2
              w-full
              min-w-0
            "
          >
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