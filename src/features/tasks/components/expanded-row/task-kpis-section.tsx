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
import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"

import {
  KpiCarousel,
  type KpiItem,
} from "@/shared/ui/mini-card/kpi-carousel"

import {
  useResponsive,
} from "@/shared/responsive/hooks/use-responsive"

type Props = {
  task: Task
  /** compact: fila h-8 para header desktop (junto a toggle/ruta). */
  density?: "default" | "compact"
}

const PIEZAS_COLOR = "#c44a4a"


/** Mismo lenguaje visual que chips de ruta (DynamicBadge). */
function KpiSignalChip({
  icon: Icon,
  color,
  value,
  title,
  variant = "subtle",
}: {
  icon: typeof Layers3
  color: string
  value: string
  title: string
  /** colors en dialog usan solid — misma fuente visual. */
  variant?: "subtle" | "solid"
}) {
  return (
    <span title={title} className="inline-flex shrink-0">
      <DynamicBadge
        label={value}
        color={color}
        iconComponent={Icon}
        variant={variant}
        width="content"
      />
    </span>
  )
}

export function TaskKpisSection({
  task,
  density = "default",
}: Props) {
  const { isMobile, ready } = useResponsive()
  const isCompact = density === "compact"

  const hasAssemblyProcess=
    task.route.includes("EN")

  const hasPaintProcess=
    task.route.includes("PT")

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
          label:"Lote",
          value:`L${task.lotNumber}`,
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
          label:"Material",
          value:task.material.name.toUpperCase(),
        },
        {
          label:"Espesor",
          value:task.thickness.name,
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
          ?[
              {
                label:"Piezas",
                value:task.pieces,
              },
              {
                label:"UNIDADES",
                value:task.assemblyCount,
              },
              {
                label:"Entrega",
                value:`${task.assemblyCount} UND`,
              },
            ]
          :[
              {
                label:"Piezas",
                value:task.pieces,
              },
            ]
      }
    />,

    <ProcessMiniCard
      key="acabado"
      size={cardSize}
      label={
        hasPaintProcess
          ?"Pintura"
          :"Acabado"
      }
      icon={PaintBucket}
      color={
        hasPaintProcess
          ? task.color?.color ??
            "#64748B"
          : "#BBBBBB"
      }
      rows={
        hasPaintProcess
          ?[
              {
                label:"Color",
                value:task.color?.name.toUpperCase() ?? "-",
              },
              {
                label:"Pedido",
                value:`${task.paintKg} KG`,
              },
            ]
          :[
              {
                label:"Tipo",
                value:"NATURAL",
              },
            ]
      }
    />,

  ]

  // Mismo dato que las cards de arriba, pero aplanado en filas
  // sueltas (una por métrica) para el carousel mobile — ahí no se
  // muestra como card sino como ítem compacto tipo stepper. Cada
  // fila tiene su propio ícono (antes Material/Espesor compartían
  // uno, y Piezas/Unidades/Entrega otro, y Color/Tipo/Pedido otro
  // más — en la card no se notaba porque ahí es UN ícono por card
  // completa, pero acá cada fila es su propio chip y quedaban
  // repetidos entre sí).
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
    ...(hasAssemblyProcess ? [
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
    ] : []),

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
    ...(hasPaintProcess ? [
      {
        icon: PaintBucket,
        color: task.color?.color ?? "#64748B",
        label: "Pedido",
        value: `${task.paintKg} KG`,
      },
    ] : []),

  ]

  if (!ready) {
    return null
  }

  // Header desktop: solo señal (valor), sin labels duplicados.
  if (isCompact) {
    const signal: {
      key: string
      icon: typeof Layers3
      color: string
      value: string
      title: string
      variant?: "subtle" | "solid"
    }[] = [
      {
        key: "lote",
        icon: Layers3,
        color: "#b8a42a",
        value: `L${task.lotNumber}`,
        title: "Lote",
      },
      {
        key: "material",
        icon: Package,
        color: task.material.color,
        value: `${task.material.name.toUpperCase()} · ${task.thickness.name}`,
        title: "Material / espesor",
      },
      {
        key: "piezas",
        icon: Puzzle,
        color: PIEZAS_COLOR,
        value:
          hasAssemblyProcess && task.assemblyCount > 1
            ? `${task.pieces} · ${task.assemblyCount} und`
            : `${task.pieces}`,
        title: "Piezas",
      },
      hasPaintProcess
        ? {
            key: "pintura",
            icon: Palette,
            // Misma fuente que EntitySelect colors (task.color.color) + solid como el dialog
            color: task.color?.color ?? "#64748B",
            value: task.color?.name.toUpperCase() ?? "—",
            title: task.paintKg ? `Pintura · ${task.paintKg} KG` : "Pintura",
            variant: "solid" as const,
          }
        : {
            key: "acabado",
            icon: Sparkles,
            color: "#BBBBBB",
            value: "NATURAL",
            title: "Acabado",
          },
    ]

    return (
      <div className="flex min-h-8 min-w-0 max-w-full flex-wrap items-center gap-1.5">
        {signal.map(({ key, ...chip }) => (
          <KpiSignalChip key={key} {...chip} />
        ))}
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