import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

import type {
  ProcessCode,
} from "@/features/tasks/types/task.types"

export type ProcessDefinition={

  code:ProcessCode

  label:string

  icon:EntityIcon

  color:string

}

export const PROCESS_DEFINITIONS:
Record<
  ProcessCode,
  ProcessDefinition
>={

  CT:{
    code:"CT",
    label:"Corte",
    icon:"scissors",
    color:"#06B6D4",
  },

  PL:{
    code:"PL",
    label:"Plegado",
    icon:"hammer",
    color:"#8B5CF6",
  },

  SD:{
    code:"SD",
    label:"Soldadura",
    icon:"flame",
    color:"#EF4444",
  },

  PT:{
    code:"PT",
    label:"Pintura",
    icon:"paint",
    color:"#22C55E",
  },

  EN:{
    code:"EN",
    label:"Ensamble",
    icon:"package",
    color:"#EC4899",
  },

  DS:{
    code:"DS",
    label:"Despacho",
    icon:"truck",
    color:"#3B82F6",
  },

}