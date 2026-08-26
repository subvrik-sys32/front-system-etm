"use client"

import {
  Hash,
  InspectionPanel,
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

import { getFinishMaterialSurface } from "@/shared/utils/material-surface"

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
    const dominantColor = hasPaintProcess ? (task.color?.color ?? "#64748B") : "#BBBBBB"
    const paintLabel = hasPaintProcess ? (task.color?.name.toUpperCase() ?? "—") : "NATURAL"
    const PaintIcon = hasPaintProcess ? Palette : Sparkles

    const materialLabel = [
      `L${task.lotNumber}`,
      task.material.name.toUpperCase(),
      hasAssemblyProcess && task.assemblyCount > 1
        ? `${task.pieces}·${task.assemblyCount}u`
        : String(task.pieces),
      task.thickness.name,
    ].join(" · ")

    return (
      <div
        className="flex h-8 w-fit items-center overflow-hidden rounded-full px-3.5 text-[11px] font-bold tracking-wide text-white shadow-sm"
        style={{ background: getFinishMaterialSurface(dominantColor) }}
      >
        {/* Lado izquierdo: Color */}
        <div className="flex items-center gap-1.5 opacity-90 drop-shadow-sm">
          <PaintIcon className="h-3.5 w-3.5" />
          <span>{paintLabel}</span>
        </div>

        {/* Divisor semitransparente ubicado exactamente donde termina el desvanecimiento */}
        <div className="mx-3 h-3.5 w-px bg-white/20 shrink-0" />

        {/* Lado derecho: Material y Producción (sobre la superficie oscura resultante) */}
        <div className="flex items-center gap-1.5 opacity-90 drop-shadow-sm">
          <Package className="h-3.5 w-3.5" />
          <span>{materialLabel}</span>
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