"use client"

import {
  InspectionPanel,
  Layers3,
  PaintBucket,
  Puzzle,
} from "lucide-react"

import type {
  Task,
} from "../../types/task.types"

import {
  ProcessMiniCard,
} from "@/shared/ui/mini-card/process-mini-card"

type Props={
  task:Task
}

export function TaskKpisSection({
  task,
}:Props){

  const hasAssemblyProcess=
    task.route.includes("EN")

  const hasPaintProcess=
    task.route.includes("PT")

  return(

    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

      <ProcessMiniCard
        label="Lote"
        icon={Layers3}
        color={"#d4d2a6"}
        rows={[
          {
            label:"Asignación",
            value:`L${task.lotNumber}`,
          },
        ]}
      />

      <ProcessMiniCard
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
      />

      <ProcessMiniCard
        label="Piezas"
        icon={Puzzle}
        color={"#996666"}
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
      />

      <ProcessMiniCard
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
      />

    </div>

  )

}