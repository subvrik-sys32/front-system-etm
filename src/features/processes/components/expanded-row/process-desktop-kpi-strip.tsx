"use client"

import type { ReactNode } from "react"
import { Activity, Clock3, Package, PaintBucket, Puzzle, Truck } from "lucide-react"

import type { ProcessTask } from "../../types/process.types"
import { ProcessEditableValue } from "./cards/process-editable-value"
import { useWorkflowStepField } from "@/features/workflow/hooks/use-workflow-step-field"
import { getWorkflowStepContext } from "@/features/workflow/utils/get-workflow-step-context"
import { useBadgeColors } from "@/shared/utils/use-badge-colors"
import { workflowAccess } from "@/features/workflow/access/workflow-access"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

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
  const { isCompact } = useResponsive()
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

  const showOutput = code != null && ["CT", "PL", "SD", "PT", "EN", "DS"].includes(code)
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
        className="inline-flex min-h-8 w-full min-w-0 select-none items-center justify-center gap-1 rounded-lg px-2 py-1 shadow-xs"
        style={{ backgroundColor: badge.background, color: badge.text }}
      >
        <Icon size={14} className="shrink-0 opacity-90" style={{ color: badge.text }} />
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-xs font-semibold leading-none tracking-[0.04em]">
          {children}
        </div>
      </div>
    )
  }

  /** Label y valor misma altura de línea → centrado óptico real. */
  function Metric({
    label,
    children,
  }: {
    label: string
    children: ReactNode
  }) {
    return (
      <span className="inline-flex items-center gap-1 leading-none">
        <span className="font-bold uppercase tracking-wide opacity-55">
          {label}
        </span>
        <span className="inline-flex items-center tabular-nums leading-none">
          {children}
        </span>
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

  const isMaterialProcess =
    code === "CT" || code === "PL" || code === "SD"
  const isPaintProcess = code === "PT"
  const isAssemblyProcess = code === "EN"
  const isDispatchProcess = code === "DS"

  const paintHex = task.color?.color?.trim() || null
  const paintDomain = paintHex ?? "#F97316"
  const paintKgReal = step?.paintKgReal ?? null

  const inQty = processTask.inputQuantity
  const startedLabel = fmtTime(started)
  const completedLabel = completed ? fmtTime(completed) : null

  return (
    <div className="grid w-full grid-cols-2 gap-1.5 laptop:grid-cols-4">
      {/* Producción: ancho completo en 2-col si hay OUT/PLRT (no aplastar Ingresar) */}
      <div
        className={
          showOutput || showPlRt
            ? "col-span-2 min-w-0 laptop:col-span-1"
            : "min-w-0"
        }
      >
      <KpiBadgeShell color={prodColor} icon={Puzzle} title="Producción">
        <Metric label="In">
          {inQty != null && String(inQty).trim() !== "" ? (
            <span className="max-w-[4rem] truncate">{inQty}</span>
          ) : (
            <span className="text-[10px] font-semibold opacity-55">Sin entrada</span>
          )}
        </Metric>
        {showOutput && (
          <>
            <span className="opacity-50">→</span>
            <Metric label="Out">
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
            </Metric>
          </>
        )}
        {showPlRt && (
          <>
            <span className="opacity-40">·</span>
            <Metric label="PL/RT">
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
            </Metric>
          </>
        )}
      </KpiBadgeShell>
      </div>

      {/* Dominio: material | pintura | ensamble | despacho */}
      {isMaterialProcess && (
        <KpiBadgeShell color={materialColor} icon={Package} title="Material">
          <span className="tabular-nums">{`L${task.lotNumber}`}</span>
          <span className="opacity-40">·</span>
          <span className="max-w-[5rem] truncate">{task.material.name.toUpperCase()}</span>
          <span className="opacity-40">·</span>
          <span className="tabular-nums">{task.pieces}</span>
          <span className="opacity-40">·</span>
          <span className="max-w-[4rem] truncate">{task.thickness.name}</span>
        </KpiBadgeShell>
      )}

      {isPaintProcess && (
        <KpiBadgeShell color={paintDomain} icon={PaintBucket} title="Pintura">
          {paintHex ? (
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full border border-black/15 dark:border-white/20"
              style={{ backgroundColor: paintHex }}
            />
          ) : null}
          <span className="max-w-[4.5rem] truncate">
            {task.color?.name?.toUpperCase() ?? "—"}
          </span>
          <span className="opacity-40">·</span>
          <span className="tabular-nums opacity-80">{`${task.paintKg ?? "—"} KG`}</span>
          <span className="opacity-40">·</span>
          <ProcessEditableValue
            inline
            numeric
            value={paintKgReal}
            suffix="KG"
            disabled={locked}
            placeholder="Ingresar"
            onSave={async value => {
              if (!stepId) return
              const next = toNumber(value)
              await updateField(stepId, { paintKgReal: next }, { paintKgReal: next })
            }}
          />
        </KpiBadgeShell>
      )}

      {isAssemblyProcess && (
        <KpiBadgeShell color="#8B5CF6" icon={Puzzle} title="Ensamble">
          <Metric label="Und">
            <span>{task.assemblyCount}</span>
          </Metric>
          <span className="opacity-40">·</span>
          <Metric label="Out">
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
          </Metric>
        </KpiBadgeShell>
      )}

      {isDispatchProcess && (
        <KpiBadgeShell color="#06B6D4" icon={Truck} title="Despacho">
          <Metric label="Desp">
            <ProcessEditableValue
              inline
              numeric
              value={step?.piecesOutput ?? null}
              suffix="UND"
              disabled={locked}
              placeholder="Ingresar"
              onSave={async value => {
                if (!stepId) return
                const piecesOutput = toNumber(value)
                await updateField(stepId, { piecesOutput }, { piecesOutput })
              }}
            />
          </Metric>
        </KpiBadgeShell>
      )}

      {/* Progreso — en compact sube (antes del celeste) */}
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

      {/* Jornada — en compact abajo a ancho completo; siempre inicio → fin */}
      <div className={isCompact ? "col-span-2 min-w-0" : "min-w-0"}>
        <KpiBadgeShell color={timeColor} icon={Clock3} title="Jornada">
          {startedLabel ? (
            <span className="tabular-nums">{startedLabel}</span>
          ) : (
            <EmptyPill label="Sin inicio" />
          )}
          <span className="opacity-50">→</span>
          {completedLabel ? (
            <span className="tabular-nums">{completedLabel}</span>
          ) : (
            <EmptyPill label={startedLabel ? "No finalizado" : "Sin fin"} />
          )}
        </KpiBadgeShell>
      </div>
    </div>
  )
}
