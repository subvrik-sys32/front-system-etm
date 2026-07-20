import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

import type {
  FilterField,
  FilterModule,
} from "../types/filter.types"

export const filterConfig:
  Record<
    FilterModule,
    FilterField[]
  >={

    tasks:[
      "status",
      "stage",
      "priority",
      "client",
    ],

    processes:[
      "status",
      "operator",
      "priority",
      "client",
    ],

    projects:[
      "status",
      "stage",
      "pm",
      "client",
    ],

  }

export const filterFieldLabels:
  Record<
    FilterField,
    string
  >={

    status:"Estado",

    stage:"Etapa",

    priority:"Prioridad",

    client:"Cliente",

    operator:"Operario",

    pm:"PM",

  }

export const filterFieldIcons:
  Record<
    FilterField,
    EntityIcon
  >={

    status:"clock",

    stage:"factory",

    priority:"urgent",

    client:"factory",

    operator:"user",

    pm:"user",

  }

export const filterFieldColors:
  Record<
    FilterField,
    string
  >={

    status:"#3B82F6",

    stage:"#8B5CF6",

    priority:"#EF4444",

    client:"#14B8A6",

    operator:"#F97316",

    pm:"#06B6D4",

  }