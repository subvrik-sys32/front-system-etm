import type{
  ExportFormat,
  ExportFormatOption,
  ExportScopeOption,
}from"../types/export.types"

export const EXPORT_FORMATS:ExportFormatOption[]=[

  {
    value:"pdf",
    label:"PDF",
    color:"#EF4444",
    icon:"document",
  },

  {
    value:"excel",
    label:"Excel",
    color:"#22C55E",
    icon:"spreadsheet",
  },

]

export const REPORT_EXPORT_SCOPES:Record<
  ExportFormat,
  ExportScopeOption[]
>={

  pdf:[

    {
      value:"active",
      label:"Trabajos actuales",
      description:"Pendientes, en proceso y pausados",
      color:"#06B6D4",
      icon:"clock",
    },

    {
      value:"history",
      label:"Histórico",
      description:"Completados y revisados",
      color:"#8B5CF6",
      icon:"clipboard",
    },

    {
      value:"executive",
      label:"Reporte ejecutivo",
      description:"KPIs y resumen gerencial",
      color:"#F59E0B",
      icon:"gauge",
    },

  ],

  excel:[

    {
      value:"active",
      label:"Trabajos actuales",
      description:"Solo producción pendiente",
      color:"#06B6D4",
      icon:"clock",
    },

    {
      value:"history",
      label:"Histórico",
      description:"Solo producción terminada",
      color:"#8B5CF6",
      icon:"clipboard",
    },

    {
      value:"all",
      label:"Completo",
      description:"Toda la información",
      color:"#22C55E",
      icon:"spreadsheet",
    },

  ],

}

export const PRODUCTION_EXPORT_SCOPES:Record<
  ExportFormat,
  ExportScopeOption[]
>={

  pdf:[

    {
      value:"active",
      label:"Trabajos actuales",
      description:"Orden de producción vigente",
      color:"#06B6D4",
      icon:"clock",
    },

    {
      value:"history",
      label:"Histórico",
      description:"Producción completada",
      color:"#8B5CF6",
      icon:"clipboard",
    },

  ],

  excel:[

    {
      value:"active",
      label:"Trabajos actuales",
      description:"Orden de producción vigente",
      color:"#06B6D4",
      icon:"clock",
    },

    {
      value:"history",
      label:"Histórico",
      description:"Producción completada",
      color:"#8B5CF6",
      icon:"clipboard",
    },

  ],

}