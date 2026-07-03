import type { EntityIcon } from "@/shared/constants/entity-icons"

export type ExportFormat=
  |"pdf"
  |"excel"

export type ExportScope=
  |"active"
  |"history"
  |"executive"
  |"all"

export type ExportFormatOption={
  value:ExportFormat
  label:string
  color:string
  icon:EntityIcon
}

export type ExportScopeOption={
  value:ExportScope
  label:string
  description:string
  color:string
  icon:EntityIcon
}

export type ExportSelection={
  format:ExportFormat
  scope:ExportScope
}