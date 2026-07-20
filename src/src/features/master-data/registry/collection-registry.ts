import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

export type CollectionField =
  | "name"
  | "color"
  | "icon"

export type CollectionDefinition = {

  id:string

  label:string

  fields:CollectionField[]

  allowedIcons?:EntityIcon[]

  fixedIcon?:EntityIcon

  canCreate?:boolean

  canEdit?:boolean

  canDelete?:boolean

}

export type CollectionKey =
  | "clients"
  | "stages"
  | "statuses"
  | "priorities"
  | "materials"
  | "thicknesses"
  | "colors"

export const collectionRegistry:
  Record<
    CollectionKey,
    CollectionDefinition
  >={

    clients:{

      id:"clients",

      label:"Clientes",

      fields:[
        "name",
        "color",
      ],

      fixedIcon:
        "factory",

      canCreate:true,

      canEdit:true,

      canDelete:true,

    },

    stages:{

      id:"stages",

      label:"Etapas",

      fields:[
        "name",
        "color",
        "icon",
      ],

      allowedIcons:[

        "pencil",
        "drafting",
        "bolt",

        "measure",
        "document",
        "spreadsheet",
        "fileCog",

        "factory",
        "tool",
        "fold",
        "drill",

        "scissors",
        "flame",

        "boxes",
        "warehouse",
        "truck",

        "cable",
        "energy",

        "quality",
        "inspect",

        "construction",

        "check",

      ],

      canCreate:false,

      canEdit:true,

      canDelete:false,

    },

    statuses:{

      id:"statuses",

      label:"Estados",

      fields:[
        "name",
        "color",
        "icon",
      ],

      allowedIcons:[

        "clock",
        "pause",
        "check",

        "urgent",

        "inspect",
        "quality",

        "tool",
        "factory",

      ],

      canCreate:false,

      canEdit:true,

      canDelete:false,

    },

    priorities:{

      id:"priorities",

      label:"Prioridades",

      fields:[
        "name",
        "color",
        "icon",
      ],

      allowedIcons:[

        "urgent",
        "high",
        "medium",
        "low",

        "clock",

        "flame",

      ],

      canCreate:false,

      canEdit:true,

      canDelete:false,

    },

    materials:{

      id:"materials",

      label:"Materiales",

      fields:[
        "name",
        "color",
      ],

      fixedIcon:
        "material",

      canCreate:false,

      canEdit:false,

      canDelete:false,

    },

    thicknesses:{

      id:"thicknesses",

      label:"Espesores",

      fields:[
        "name",
        "color",
      ],

      fixedIcon:
        "measure",

      canCreate:false,

      canEdit:false,

      canDelete:false,

    },

    colors:{

      id:"colors",

      label:"Colores",

      fields:[
        "name",
        "color",
      ],

      canCreate:true,

      canEdit:true,

      canDelete:true,

    },

  }