"use client"

import {
  InspectionPanel,
} from "lucide-react"

import {
  ProcessMiniCard,
} from "@/shared/ui/mini-card/process-mini-card"

import type {
  ProcessTask,
} from "../../../types/process.types"

type Props={

  processTask:ProcessTask

}

export function ProcessMaterialCard({

  processTask,

}:Props){

  const material=
    processTask.task.material

  const thickness=
    processTask.task.thickness

  return(

    <ProcessMiniCard

      label="Material"

      icon={InspectionPanel}

      color={
        material?.color ??
        "#64748B"
      }

      rows={[

        {

          label:"Material",

          value:
            material?.name ??
            "-",

        },

        {

          label:"Espesor",

          value:
            thickness?.name ??
            "-",

        },

      ]}

    />

  )

}