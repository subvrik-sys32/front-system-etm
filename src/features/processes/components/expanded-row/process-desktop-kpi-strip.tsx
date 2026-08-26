"use client"

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  Activity,
  ArrowRight,
  Clock3,
  InspectionPanel,
  Layers3,
  PaintBucket,
  Puzzle,
  Truck,
} from "lucide-react"

import type { ProcessTask } from "../../types/process.types"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
import type { ProcessCode } from "@/features/tasks/types/task.types"
import { ProcessEditableValue } from "./cards/process-editable-value"
import { useWorkflowStepField } from "@/features/workflow/hooks/use-workflow-step-field"
import { getWorkflowStepContext } from "@/features/workflow/utils/get-workflow-step-context"
import { workflowAccess } from "@/features/workflow/access/workflow-access"
import { getBadgeColors } from "@/shared/utils/badge-colors"
import { getFinishMaterialSurface } from "@/shared/utils/material-surface"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

const ACCENT = {
  piezas: "#c4b5fd",
  produccion: "#e5e7eb",
  avance: "#4ade80",
  jornada: "#fbbf24",
  real: "#fb923c",
  salida: "#e5e7eb",
  despacho: "#67e8f9",
} as const

/**
 * Badge compacto unificado.
 * Compact: solo KPIs con Ingresar; pills sin border/ring.
 */
export function ProcessDesktopKpiStrip({
  processTask,
  percent,
  statusLabel,
  nextProcessLabel,
  nextProcessCode,
}: {
  processTask: ProcessTask
  percent: number
  statusLabel: string
  nextProcessLabel: string
  nextProcessCode?: ProcessCode
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

  const showOutput =
    code != null && ["CT", "PL", "SD", "PT", "EN", "DS"].includes(code)
  const showPlRt = code === "CT"
  const plRtSuffix = task.plRt?.replace(/\d+/g, "").trim() ?? ""

  const toNumber = (value: unknown): number | null => {
    if (value == null) return null
    const text = String(value).trim()
    if (text === "") return null
    const n = Number(text)
    return Number.isFinite(n) ? n : null
  }

  const isMaterialProcess =
    code === "CT" || code === "PL" || code === "SD"
  const isPaintProcess = code === "PT"
  const isAssemblyProcess = code === "EN"
  const isDispatchProcess = code === "DS"

  const materialColor = task.material.color ?? "#64748B"
  const paintHex = task.color?.color?.trim() || null
  const paintDomain = paintHex ?? "#F97316"
  const paintKgReal = step?.paintKgReal ?? null

  const domainColor = isPaintProcess
    ? paintDomain
    : isAssemblyProcess
      ? "#8B5CF6"
      : isDispatchProcess
        ? "#06B6D4"
        : materialColor

  const finishInk = getBadgeColors(domainColor, "solid").text

  const inQty = processTask.inputQuantity
  const startedLabel = fmtTime(started)
  const completedLabel = completed ? fmtTime(completed) : null

  const lotValue = `L${task.lotNumber}`
  const materialValue = `${task.material.name.toUpperCase()} · ${task.thickness.name}`
  const piecesValue = String(task.pieces)

  const badgeRef = useRef<HTMLDivElement>(null)
  const [sepPct, setSepPct] = useState(32)

  useLayoutEffect(() => {
    const root = badgeRef.current
    if (!root) return

    const measure = () => {
      const sep = root.querySelector("[data-finish-sep]")
      if (!(sep instanceof HTMLElement)) return
      const rb = root.getBoundingClientRect()
      const sb = sep.getBoundingClientRect()
      if (rb.width <= 0) return
      const pct = ((sb.left + sb.width * 0.5 - rb.left) / rb.width) * 100
      setSepPct(Math.min(88, Math.max(12, pct)))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    return () => ro.disconnect()
  }, [code, lotValue, materialValue])

  const leftLabelClass =
    "truncate text-[9px] font-bold uppercase tracking-[0.14em] sm:text-[10px]"
  const leftValueClass =
    "truncate text-xs font-bold leading-tight sm:text-sm"

  function LeftCol({
    icon: Icon,
    label,
    children,
  }: {
    icon: typeof Activity
    label: string
    children: ReactNode
  }) {
    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <Icon
          className="h-3.5 w-3.5 shrink-0 opacity-80"
          style={{ color: finishInk }}
        />
        <div className="min-w-0 text-center">
          <p
            className={cn(leftLabelClass, "text-center")}
            style={{ color: finishInk, opacity: 0.7 }}
          >
            {label}
          </p>
          <div
            className={cn(leftValueClass, "flex justify-center")}
            style={{ color: finishInk }}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }

  /** Pill sin border ni ring. */
  function KpiBadge({
    icon: Icon,
    label,
    accent,
    children,
  }: {
    icon: typeof Activity
    label: string
    accent?: string
    children: ReactNode
  }) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-xl",
          "bg-white/[0.06] px-2.5 py-1.5",
        )}
      >
        <Icon
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: accent ?? "rgba(255,255,255,0.75)" }}
        />
        <div className="min-w-0 text-center">
          <p className="truncate text-center text-[9px] uppercase tracking-[0.14em] text-white/55 sm:text-[10px]">
            {label}
          </p>
          <div
            className="flex min-w-0 items-center justify-center overflow-visible text-xs font-bold leading-tight sm:text-sm"
            style={{ color: accent ?? "#fff" }}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }

  type Col = { key: string; node: ReactNode; hasIngresar?: boolean }

  const productionCol: Col | null =
    showOutput || showPlRt || inQty != null
      ? {
          key: "produccion",
          hasIngresar: true,
          node: (
            <KpiBadge
              icon={Puzzle}
              label="Producción"
              accent={ACCENT.produccion}
            >
              <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-white">
                <span className="text-white/60">Recibido</span>
                <span className="tabular-nums text-white">
                  {inQty != null && String(inQty).trim() !== ""
                    ? inQty
                    : "—"}
                </span>
                {showOutput && (
                  <>
                    <span className="text-white/40">→</span>
                    <span className="text-white/60">Salida</span>
                    <ProcessEditableValue
                      inline
                      onDark
                      numeric
                      value={step?.piecesOutput ?? null}
                      disabled={locked}
                      placeholder="Ingresar"
                      stepId={stepId}
                      fieldKey="piecesOutput"
                      onSave={async value => {
                        if (!stepId) return
                        const piecesOutput = toNumber(value)
                        await updateField(
                          stepId,
                          { piecesOutput },
                          { piecesOutput },
                        )
                      }}
                    />
                  </>
                )}
                {showPlRt && (
                  <>
                    <span className="text-white/35">·</span>
                    <span className="text-white/60">PL/RT</span>
                    <ProcessEditableValue
                      inline
                      onDark
                      numeric
                      value={step?.plRtReal ?? null}
                      suffix={plRtSuffix}
                      disabled={locked}
                      placeholder="Ingresar"
                      stepId={stepId}
                      fieldKey="plRtReal"
                      onSave={async value => {
                        if (!stepId) return
                        const plRtReal = toNumber(value)
                        await updateField(
                          stepId,
                          { plRtReal },
                          { plRtReal },
                        )
                      }}
                    />
                  </>
                )}
              </span>
            </KpiBadge>
          ),
        }
      : null

  const piecesCol: Col | null = isMaterialProcess
    ? {
        key: "piezas",
        node: (
          <KpiBadge icon={Puzzle} label="Piezas" accent={ACCENT.piezas}>
            <span className="tabular-nums">{piecesValue}</span>
          </KpiBadge>
        ),
      }
    : null

  const avanceCol: Col = {
    key: "avance",
    node: (
      <KpiBadge icon={Activity} label="Avance" accent={ACCENT.avance}>
        <span className="inline-flex flex-wrap items-center gap-x-1.5 text-white">
          <span className="tabular-nums" style={{ color: ACCENT.avance }}>
            {percent}%
          </span>
          <span className="text-white/35">·</span>
          <span className="truncate text-white/90">{statusLabel}</span>
          {nextProcessCode && PROCESS_DEFINITIONS[nextProcessCode] && (
            <>
              <span className="text-white/35">·</span>
              <span
                className="inline-flex items-center gap-1"
                title={PROCESS_DEFINITIONS[nextProcessCode].label}
              >
                <ArrowRight
                  size={12}
                  strokeWidth={2.75}
                  className="shrink-0 text-white/70"
                />
                {(() => {
                  const def = PROCESS_DEFINITIONS[nextProcessCode]
                  const NextIcon = ENTITY_ICONS[def.icon]
                  return NextIcon ? (
                    <NextIcon
                      size={14}
                      className="shrink-0"
                      style={{ color: def.color }}
                    />
                  ) : null
                })()}
              </span>
            </>
          )}
        </span>
      </KpiBadge>
    ),
  }

  const jornadaCol: Col = {
    key: "jornada",
    node: (
      <KpiBadge icon={Clock3} label="Jornada" accent={ACCENT.jornada}>
        <span className="inline-flex items-center gap-x-1.5 tabular-nums">
          <span style={{ color: startedLabel ? "#fff" : ACCENT.jornada }}>
            {startedLabel ?? "Sin inicio"}
          </span>
          <span className="text-white/40">→</span>
          <span
            style={{
              color: completedLabel ? "#fff" : ACCENT.jornada,
            }}
          >
            {completedLabel ??
              (startedLabel ? "No finalizado" : "Sin fin")}
          </span>
        </span>
      </KpiBadge>
    ),
  }

  const paintRealCol: Col | null = isPaintProcess
    ? {
        key: "real",
        hasIngresar: true,
        node: (
          <KpiBadge icon={PaintBucket} label="Real" accent={ACCENT.real}>
            <ProcessEditableValue
              inline
              onDark
              numeric
              value={paintKgReal}
              suffix="KG"
              disabled={locked}
              placeholder="Ingresar"
              stepId={stepId}
              fieldKey="paintKgReal"
              onSave={async value => {
                if (!stepId) return
                const next = toNumber(value)
                await updateField(
                  stepId,
                  { paintKgReal: next },
                  { paintKgReal: next },
                )
              }}
            />
          </KpiBadge>
        ),
      }
    : null

  const ensambleSalidaCol: Col | null = isAssemblyProcess
    ? {
        key: "salida",
        hasIngresar: true,
        node: (
          <KpiBadge icon={Puzzle} label="Salida" accent={ACCENT.salida}>
            <ProcessEditableValue
              inline
              onDark
              numeric
              value={step?.piecesOutput ?? null}
              disabled={locked}
              placeholder="Ingresar"
              stepId={stepId}
              fieldKey="piecesOutput"
              onSave={async value => {
                if (!stepId) return
                const piecesOutput = toNumber(value)
                await updateField(
                  stepId,
                  { piecesOutput },
                  { piecesOutput },
                )
              }}
            />
          </KpiBadge>
        ),
      }
    : null

  const despachoCol: Col | null = isDispatchProcess
    ? {
        key: "despacho",
        hasIngresar: true,
        node: (
          <KpiBadge icon={Truck} label="Despacho" accent={ACCENT.despacho}>
            <ProcessEditableValue
              inline
              onDark
              numeric
              value={step?.piecesOutput ?? null}
              suffix="UND"
              disabled={locked}
              placeholder="Ingresar"
              stepId={stepId}
              fieldKey="piecesOutput"
              onSave={async value => {
                if (!stepId) return
                const piecesOutput = toNumber(value)
                await updateField(
                  stepId,
                  { piecesOutput },
                  { piecesOutput },
                )
              }}
            />
          </KpiBadge>
        ),
      }
    : null

  const allRight: Col[] = (
    isMaterialProcess
      ? [piecesCol, productionCol, avanceCol, jornadaCol]
      : isPaintProcess
        ? [productionCol, paintRealCol, avanceCol, jornadaCol]
        : isAssemblyProcess
          ? [productionCol, ensambleSalidaCol, avanceCol, jornadaCol]
          : isDispatchProcess
            ? [productionCol, despachoCol, avanceCol, jornadaCol]
            : [productionCol, avanceCol, jornadaCol]
  ).filter((c): c is Col => c != null)

  // Compact: solo columnas con Ingresar
  const rightCols = isCompact
    ? allRight.filter(c => c.hasIngresar)
    : allRight

  return (
    <div
      ref={badgeRef}
      className={cn(
        "flex w-full min-w-0 items-center rounded-2xl pr-2 shadow-sm",
        isCompact ? "min-h-[70.5px] py-2" : "h-[70.5px]",
      )}
      style={{
        background: getFinishMaterialSurface(domainColor, sepPct),
      }}
    >
      <div className="flex shrink-0 items-center gap-3 pl-4 pr-4 tablet:gap-4">
        {isMaterialProcess ? (
          <>
            <LeftCol icon={Layers3} label="Lote">
              <span className="tabular-nums">{lotValue}</span>
            </LeftCol>
            <LeftCol icon={InspectionPanel} label="Material">
              {materialValue}
            </LeftCol>
          </>
        ) : isPaintProcess ? (
          <LeftCol icon={PaintBucket} label="Pintura">
            {task.color?.name?.toUpperCase() ?? "—"}
          </LeftCol>
        ) : isAssemblyProcess ? (
          <LeftCol icon={Puzzle} label="Ensamble">
            {task.assemblyCount} und
          </LeftCol>
        ) : isDispatchProcess ? (
          <LeftCol icon={Truck} label="Despacho">
            UND
          </LeftCol>
        ) : (
          <LeftCol icon={Layers3} label="Lote">
            <span className="tabular-nums">{lotValue}</span>
          </LeftCol>
        )}
      </div>

      <div
        data-finish-sep
        aria-hidden
        className="h-5 w-px shrink-0 self-center bg-white/20"
      />

      <div
        className={cn(
          "ml-auto flex min-w-0 items-center gap-2 pl-3 pr-2",
          isCompact
            ? "overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "overflow-hidden",
        )}
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
      >
        {rightCols.map(col => (
          <div key={col.key} className="shrink-0">
            {col.node}
          </div>
        ))}
      </div>
    </div>
  )
}
