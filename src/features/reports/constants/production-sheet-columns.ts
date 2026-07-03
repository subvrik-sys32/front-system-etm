import type{
  ProcessCode,
}from"@/features/tasks/types/task.types"

import type{
  ProductionSheetRow,
}from"../types/production-sheet.types"

export interface ProductionSheetColumn{

  key:keyof ProductionSheetRow

  label:string

  width:number

  align?:
    |"left"
    |"center"
    |"right"

}

export const PRODUCTION_SHEET_COLUMNS:Record<
  ProcessCode,
  ProductionSheetColumn[]
>={

  CT:[

    {
      key:"taskNumber",
      label:"#",
      width:40,
      align:"center",
    },

    {
      key:"client",
      label:"CLIENTE",
      width:90,
    },

    {
      key:"projectCode",
      label:"PROYECTO",
      width:85,
    },

    {
      key:"reference",
      label:"REFERENCIA",
      width:120,
    },

    {
      key:"lotNumber",
      label:"LOTE",
      width:50,
      align:"center",
    },

    {
      key:"material",
      label:"MATERIAL",
      width:70,
      align:"center",
    },

    {
      key:"thickness",
      label:"ESP.",
      width:45,
      align:"center",
    },

    {
      key:"pieces",
      label:"PZS",
      width:45,
      align:"center",
    },

    {
      key:"status",
      label:"ESTADO",
      width:70,
      align:"center",
    },

  ],

  PL:[

    {
      key:"taskNumber",
      label:"#",
      width:40,
      align:"center",
    },

    {
      key:"client",
      label:"CLIENTE",
      width:90,
    },

    {
      key:"projectCode",
      label:"PROYECTO",
      width:85,
    },

    {
      key:"reference",
      label:"REFERENCIA",
      width:120,
    },

    {
      key:"lotNumber",
      label:"LOTE",
      width:50,
      align:"center",
    },

    {
      key:"plRt",
      label:"PL/RT",
      width:65,
      align:"center",
    },

    {
      key:"pieces",
      label:"PZS",
      width:45,
      align:"center",
    },

    {
      key:"status",
      label:"ESTADO",
      width:70,
      align:"center",
    },

  ],

  SD:[

    {
      key:"taskNumber",
      label:"#",
      width:40,
      align:"center",
    },

    {
      key:"client",
      label:"CLIENTE",
      width:90,
    },

    {
      key:"projectCode",
      label:"PROYECTO",
      width:85,
    },

    {
      key:"reference",
      label:"REFERENCIA",
      width:120,
    },

    {
      key:"lotNumber",
      label:"LOTE",
      width:50,
      align:"center",
    },

    {
      key:"priority",
      label:"PRIORIDAD",
      width:70,
      align:"center",
    },

    {
      key:"operator",
      label:"OPERADOR",
      width:90,
    },

    {
      key:"status",
      label:"ESTADO",
      width:70,
      align:"center",
    },

  ],

  PT:[

    {
      key:"taskNumber",
      label:"#",
      width:40,
      align:"center",
    },

    {
      key:"client",
      label:"CLIENTE",
      width:90,
    },

    {
      key:"projectCode",
      label:"PROYECTO",
      width:85,
    },

    {
      key:"reference",
      label:"REFERENCIA",
      width:120,
    },

    {
      key:"lotNumber",
      label:"LOTE",
      width:50,
      align:"center",
    },

    {
      key:"paint",
      label:"PINTURA",
      width:90,
    },

    {
      key:"pieces",
      label:"PZS",
      width:45,
      align:"center",
    },

    {
      key:"status",
      label:"ESTADO",
      width:70,
      align:"center",
    },

  ],

  EN:[

    {
      key:"taskNumber",
      label:"#",
      width:40,
      align:"center",
    },

    {
      key:"client",
      label:"CLIENTE",
      width:90,
    },

    {
      key:"projectCode",
      label:"PROYECTO",
      width:85,
    },

    {
      key:"reference",
      label:"REFERENCIA",
      width:120,
    },

    {
      key:"lotNumber",
      label:"LOTE",
      width:50,
      align:"center",
    },

    {
      key:"priority",
      label:"PRIORIDAD",
      width:70,
      align:"center",
    },

    {
      key:"pieces",
      label:"PZS",
      width:45,
      align:"center",
    },

    {
      key:"status",
      label:"ESTADO",
      width:70,
      align:"center",
    },

  ],

  DS:[

    {
      key:"taskNumber",
      label:"#",
      width:40,
      align:"center",
    },

    {
      key:"client",
      label:"CLIENTE",
      width:90,
    },

    {
      key:"projectCode",
      label:"PROYECTO",
      width:85,
    },

    {
      key:"reference",
      label:"REFERENCIA",
      width:120,
    },

    {
      key:"lotNumber",
      label:"LOTE",
      width:50,
      align:"center",
    },

    {
      key:"priority",
      label:"PRIORIDAD",
      width:70,
      align:"center",
    },

    {
      key:"pieces",
      label:"PZS",
      width:45,
      align:"center",
    },

    {
      key:"status",
      label:"ESTADO",
      width:70,
      align:"center",
    },

  ],

}