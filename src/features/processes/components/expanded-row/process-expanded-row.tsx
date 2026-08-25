"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { Activity, ArrowRight, Clock, Clock3, MessageSquare, Package, Puzzle, Layers3 } from "lucide-react"

import type { ProcessTask } from "../../types/process.types"

import {
  EntityExpandedContent,
  EntityExpandedRow,
  EntityExpandedToggle,
  EntityExpandedSlider,
} from "@/shared/ui/entity-expanded-row"

import { KpiCarousel, type KpiItem } from "@/shared/ui/mini-card/kpi-carousel"
import { ProcessEditableValue } from "./cards/process-editable-value"
import { useWorkflowStepField } from "@/features/workflow/hooks/use-workflow-step-field"
import { getWorkflowStepContext } from "@/features/workflow/utils/get-workflow-step-context"
import { useBadgeColors } from "@/shared/utils/use-badge-colors"
import { workflowAccess } from "@/features/workflow/access/workflow-access"
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

type Props = {
  processTask: ProcessTask
  /** Ojo / materiales / auditoría — misma fila que toggle + KPIs. */
  headerActions?: ReactNode
}



/** 4 chips KPI — look DynamicBadge; vacíos tipo Ingresar; editable sin estirar. */
function ProcessDesktopKpiStrip({
  processTask,
  percent,
  statusLabel,
  nextProcessLabel,
}: {
  processTask: ProcessTask
  percent: number
  statusLabel: string
  nextProcessLabel: string
}) {
  const task = processTask.task
  const step = processTask.workflowStep
  const code = step?.processCode
  const updateField = useWorkflowStepField()
  const { stepId, locked } = getWorkflowStepContext(processTask)

  const started = workflowAccess.startedAt(processTask)
  const completed = workflowAccess.completedAt(processTask)
  const fmtTime = (v: string | null) =>
    v
      ? new Date(v).toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null

  const showOutput = code != null && ["CT", "PL", "SD", "PT"].includes(code)
  const showPlRt = code === "CT"
  const plRtSuffix =
    task.plRt?.replace(/\d+/g, "").trim() ?? ""

  const toNumber = (value: unknown): number | null => {
    if (value == null) return null
    const text = String(value).trim()
    if (text === "") return null
    const n = Number(text)
    return Number.isFinite(n) ? n : null
  }

  /** Misma piel/altura que DynamicBadge (ruta). */
  function KpiBadgeShell({
    color,
    icon: Icon,
    title,
    children,
  }: {
    color: string
    icon: typeof Activity
    title: string
    children: ReactNode
  }) {
    const badge = useBadgeColors(color ?? "#64748B", "subtle")
    return (
      <div
        title={title}
        className="inline-flex h-8 max-w-full shrink-0 select-none items-center gap-1.5 overflow-hidden rounded-lg px-2.5 shadow-xs"
        style={{ backgroundColor: badge.background, color: badge.text }}
      >
        <Icon size={14} className="shrink-0 opacity-90" style={{ color: badge.text }} />
        <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold leading-none tracking-[0.06em]">
          {children}
        </div>
      </div>
    )
  }

  function mutedLabel(label: string) {
    return (
      <span className="text-[8px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </span>
    )
  }

  /** Vacío estilo Ingresar (sin guión). */
  function EmptyPill({ label }: { label: string }) {
    return (
      <span className="inline-flex max-w-full items-center truncate rounded-md bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
        {label}
      </span>
    )
  }

  const prodColor = "#f99d9d"
  const materialColor = task.material.color ?? "#64748B"
  const timeColor = "#0EA5E9"
  const progressColor = "#22C55E"

  const inQty = processTask.inputQuantity
  const startedLabel = fmtTime(started)
  const completedLabel = completed ? fmtTime(completed) : null

  return (
    <div className="flex h-8 min-w-0 flex-1 items-center justify-end gap-1.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
      {/* Producción */}
      <KpiBadgeShell color={prodColor} icon={Puzzle} title="Producción">
        {mutedLabel("In")}
        {inQty != null && String(inQty).trim() !== "" ? (
          <span className="tabular-nums">{inQty}</span>
        ) : (
          <EmptyPill label="Sin IN" />
        )}
        {showOutput && (
          <>
            <span className="opacity-50">→</span>
            {mutedLabel("Out")}
            <ProcessEditableValue
              inline
              numeric
              value={step?.piecesOutput ?? null}
              disabled={locked}
              placeholder="Ingresar"
              onSave={async value => {
                if (!stepId) return
                const piecesOutput = toNumber(value)
                await updateField(stepId, { piecesOutput }, { piecesOutput })
              }}
            />
          </>
        )}
        {showPlRt && (
          <>
            <span className="opacity-40">·</span>
            {mutedLabel("PL/RT")}
            <ProcessEditableValue
              inline
              numeric
              value={step?.plRtReal ?? null}
              suffix={plRtSuffix}
              disabled={locked}
              placeholder="Ingresar"
              onSave={async value => {
                if (!stepId) return
                const plRtReal = toNumber(value)
                await updateField(stepId, { plRtReal }, { plRtReal })
              }}
            />
          </>
        )}
      </KpiBadgeShell>

      {/* Material */}
      <KpiBadgeShell color={materialColor} icon={Package} title="Material">
        <span className="tabular-nums">{`L${task.lotNumber}`}</span>
        <span className="opacity-40">·</span>
        <span className="truncate">{task.material.name.toUpperCase()}</span>
        <span className="opacity-40">·</span>
        <span className="tabular-nums">{task.pieces}</span>
        <span className="opacity-40">·</span>
        <span className="truncate">{task.thickness.name}</span>
      </KpiBadgeShell>

      {/* Jornada */}
      <KpiBadgeShell color={timeColor} icon={Clock3} title="Jornada">
        {startedLabel ? (
          <>
            <span className="tabular-nums">{startedLabel}</span>
            <span className="opacity-50">→</span>
            {completedLabel ? (
              <span className="tabular-nums">{completedLabel}</span>
            ) : (
              <EmptyPill label="No finalizado" />
            )}
          </>
        ) : (
          <EmptyPill label="Sin empezar" />
        )}
      </KpiBadgeShell>

      {/* Progreso */}
      <KpiBadgeShell color={progressColor} icon={Activity} title="Progreso">
        <span className="tabular-nums">{`${percent}%`}</span>
        <span className="opacity-40">·</span>
        <span className="truncate">{statusLabel}</span>
        {nextProcessLabel && nextProcessLabel !== "-" && (
          <>
            <span className="opacity-40">·</span>
            <span className="truncate">{nextProcessLabel}</span>
          </>
        )}
      </KpiBadgeShell>
    </div>
  )
}

export function ProcessExpandedRow({
  processTask,
  headerActions,
}: Props) {
  const { isMobile, ready } = useResponsive()
  const searchParams = useSearchParams()

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
  const focusSettled = !urlFocusToken || settledToken === urlFocusToken

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
      return
    }

    setActiveView("kpis")
  }, [
    isTarget,
    tabParam,
    focusSettled,
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

  const { percent, statusLabel, nextProcessLabel } = getProcessProgress(processTask)

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
          {/* Desktop: chips en la misma fila (toggle · actions · KPIs) */}
          {!isMobile && activeView === "kpis" && (
            <div className="min-w-0 flex-1">
              <ProcessDesktopKpiStrip
                processTask={processTask}
                percent={percent}
                statusLabel={statusLabel}
                nextProcessLabel={nextProcessLabel}
              />
            </div>
          )}
        </div>

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