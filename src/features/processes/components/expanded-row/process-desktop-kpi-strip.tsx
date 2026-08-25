"use client"

import type { ReactNode } from "react"
import { Activity, Clock3, Package, Puzzle } from "lucide-react"

import type { ProcessTask } from "../../types/process.types"
import { ProcessEditableValue } from "./cards/process-editable-value"
import { useWorkflowStepField } from "@/features/workflow/hooks/use-workflow-step-field"
import { getWorkflowStepContext } from "@/features/workflow/utils/get-workflow-step-context"
import { useBadgeColors } from "@/shared/utils/use-badge-colors"
import { workflowAccess } from "@/features/workflow/access/workflow-access"

/** 4 chips KPI — look DynamicBadge; vacíos tipo Ingresar; editable sin estirar. */
export function ProcessDesktopKpiStrip({
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

  /** Misma tipografía/pill que ProcessEditableValue placeholder "Ingresar". */
  function EmptyPill({ label }: { label: string }) {
    return (
      <span
        className={
          "inline-flex max-w-full items-center truncate rounded-md " +
          "bg-foreground/10 px-1.5 py-0.5 font-inherit text-[length:inherit] " +
          "font-semibold leading-inherit text-inherit"
        }
      >
        {label}
      </span>
    )
  }

  const prodColor = "#4F46E5"
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
          <span className="text-[10px] font-semibold opacity-55">Sin entrada</span>
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
