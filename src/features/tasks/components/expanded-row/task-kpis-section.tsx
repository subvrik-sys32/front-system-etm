"use client"

import {
  Hash,
  InspectionPanel,
  Layers2,
  Layers3,
  Package,
  PaintBucket,
  Palette,
  Puzzle,
  Ruler,
  Sparkles,
} from "lucide-react"

import type {
  Task,
} from "../../types/task.types"

import {
  ProcessMiniCard,
} from "@/shared/ui/mini-card/process-mini-card"

import {
  KpiCarousel,
  type KpiItem,
} from "@/shared/ui/mini-card/kpi-carousel"

import {
  useResponsive,
} from "@/shared/responsive/hooks/use-responsive"

import { getBadgeColors } from "@/shared/utils/badge-colors"

type Props = {
  task: Task
  /** compact: fila h-8 para header desktop (junto a toggle/ruta). */
  density?: "default" | "compact"
}

const PIEZAS_COLOR = "#c44a4a"

export function TaskKpisSection({
  task,
  density = "default",
}: Props) {
  const { isMobile, ready } = useResponsive()
  const isCompact = density === "compact"

  const hasAssemblyProcess = task.route.includes("EN")
  const hasPaintProcess = task.route.includes("PT")

  const cardSize = isCompact ? "compact" : isMobile ? "large" : "default"

  const cards = [
    <ProcessMiniCard
      key="lote"
      size={cardSize}
      label="Lote"
      icon={Layers3}
      color={"#b8a42a"}
      rows={[
        {
          label: "Lote",
          value: `L${task.lotNumber}`,
        },
      ]}
    />,
    <ProcessMiniCard
      key="material"
      size={cardSize}
      label="Material"
      icon={InspectionPanel}
      color={task.material.color}
      rows={[
        {
          label: "Material",
          value: task.material.name.toUpperCase(),
        },
        {
          label: "Espesor",
          value: task.thickness.name,
        },
      ]}
    />,
    <ProcessMiniCard
      key="piezas"
      size={cardSize}
      label="Piezas"
      icon={Puzzle}
      color={PIEZAS_COLOR}
      rows={
        hasAssemblyProcess
          ? [
              {
                label: "Piezas",
                value: task.pieces,
              },
              {
                label: "UNIDADES",
                value: task.assemblyCount,
              },
              {
                label: "Entrega",
                value: `${task.assemblyCount} UND`,
              },
            ]
          : [
              {
                label: "Piezas",
                value: task.pieces,
              },
            ]
      }
    />,
    <ProcessMiniCard
      key="acabado"
      size={cardSize}
      label={hasPaintProcess ? "Pintura" : "Acabado"}
      icon={PaintBucket}
      color={
        hasPaintProcess
          ? task.color?.color ?? "#64748B"
          : "#BBBBBB"
      }
      rows={
        hasPaintProcess
          ? [
              {
                label: "Color",
                value: task.color?.name.toUpperCase() ?? "-",
              },
              {
                label: "Pedido",
                value: `${task.paintKg} KG`,
              },
            ]
          : [
              {
                label: "Tipo",
                value: "NATURAL",
              },
            ]
      }
    />,
  ]

  const items: KpiItem[] = [
    {
      icon: Layers3,
      color: "#b8a42a",
      label: "Lote",
      value: `L${task.lotNumber}`,
    },
    {
      icon: Package,
      color: task.material.color,
      label: "Material",
      value: task.material.name.toUpperCase(),
    },
    {
      icon: Ruler,
      color: task.material.color,
      label: "Espesor",
      value: task.thickness.name,
    },
    {
      icon: Puzzle,
      color: PIEZAS_COLOR,
      label: "Piezas",
      value: task.pieces,
    },
    ...(hasAssemblyProcess
      ? [
          {
            icon: Hash,
            color: PIEZAS_COLOR,
            label: "Unidades",
            value: task.assemblyCount,
          },
          {
            icon: InspectionPanel,
            color: PIEZAS_COLOR,
            label: "Entrega",
            value: `${task.assemblyCount} UND`,
          },
        ]
      : []),
    hasPaintProcess
      ? {
          icon: Palette,
          color: task.color?.color ?? "#64748B",
          label: "Color",
          value: task.color?.name.toUpperCase() ?? "-",
        }
      : {
          icon: Sparkles,
          color: "#BBBBBB",
          label: "Tipo",
          value: "NATURAL",
        },
    ...(hasPaintProcess
      ? [
          {
            icon: PaintBucket,
            color: task.color?.color ?? "#64748B",
            label: "Pedido",
            value: `${task.paintKg} KG`,
          },
        ]
      : []),
  ]

  if (!ready) {
    return null
  }

  if (isCompact) {
    const dominantColor = hasPaintProcess
      ? (task.color?.color ?? "#64748B")
      : "#BBBBBB"
    const paintLabel = hasPaintProcess
      ? (task.color?.name.toUpperCase() ?? "—")
      : "NATURAL"
    const PaintIcon = hasPaintProcess ? Palette : Sparkles

    const lotValue = `L${task.lotNumber}`
    // Material + espesor juntos; piezas/unidades después
    const materialValue = `${task.material.name.toUpperCase()} · ${task.thickness.name}`
    const piecesValue =
      hasAssemblyProcess && task.assemblyCount > 1
        ? `${task.pieces}·${task.assemblyCount}u`
        : String(task.pieces)

    const finishInk = getBadgeColors(dominantColor, "solid").text

    const kpiLabelClass =
      "text-[9px] font-bold uppercase tracking-[0.14em] text-white/70 sm:text-[10px]"
    const kpiValueClass =
      "whitespace-nowrap text-xs font-bold leading-tight text-white sm:text-sm"

    // Divisor entre KPIs — nunca después del último
    const Dot = () => (
      <span
        aria-hidden
        className="mx-1 h-1 w-1 shrink-0 rounded-full bg-white/40 tablet:mx-1.5"
      />
    )

    return (
      <div className="flex h-full min-w-0 flex-1 items-center overflow-hidden">
        <div
          className="flex max-w-[36%] shrink-0 items-center gap-2 pl-3 pr-2 text-[13px] font-bold tracking-wide tablet:max-w-none tablet:gap-2.5 tablet:pl-4 tablet:pr-5"
          style={{ color: finishInk }}
        >
          <PaintIcon className="hidden h-4 w-4 shrink-0 tablet:block" />
          <span className="truncate">{paintLabel}</span>
        </div>

        <div
          data-finish-sep
          aria-hidden
          className="h-4 w-px shrink-0 bg-white/20"
        />

        {/*
          Lote · Material · Piezas
          Móvil: solo valores + puntos (sin icono ni subtítulo).
          Punto solo ENTRE items, no tras el último.
        */}
        <div
          className={
            "ml-auto flex min-w-0 items-center pl-2 pr-1 " +
            "overflow-x-auto overflow-y-hidden " +
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
            "tablet:overflow-visible tablet:pl-4"
          }
        >
          <div className="flex shrink-0 items-center gap-1.5">
            <Layers3 className="hidden h-3.5 w-3.5 shrink-0 text-white/80 tablet:block" />
            <div className="shrink-0">
              <p className={`hidden tablet:block ${kpiLabelClass}`}>Lote</p>
              <p className={kpiValueClass}>{lotValue}</p>
            </div>
          </div>

          <Dot />

          <div className="flex shrink-0 items-center gap-1.5">
            <InspectionPanel className="hidden h-3.5 w-3.5 shrink-0 text-white/80 tablet:block" />
            <div className="shrink-0">
              <p className={`hidden tablet:block ${kpiLabelClass}`}>Material</p>
              <p className={kpiValueClass}>{materialValue}</p>
            </div>
          </div>

          <Dot />

          <div className="flex shrink-0 items-center gap-1.5">
            <Puzzle className="hidden h-3.5 w-3.5 shrink-0 text-white/80 tablet:block" />
            <div className="shrink-0">
              <p className={`hidden tablet:block ${kpiLabelClass}`}>Piezas</p>
              <p className={kpiValueClass}>{piecesValue}</p>
            </div>
          </div>
        </div>
      </div>
    )

  }

  return (
    <KpiCarousel
      cards={cards}
      items={items}
      summary={{
        icon: Layers3,
        color: "#b8a42a",
        label: "Producción",
        values: [
          { label: "Lote", value: `L${task.lotNumber}` },
          { label: "Piezas", value: task.pieces },
        ],
      }}
    />
  )
}