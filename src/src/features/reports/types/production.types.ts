import type{
  EntityIcon,
}from"@/shared/constants/entity-icons"

export type ProductionFormat=
  |"pdf"
  |"excel"

export type ProductionScope=
  |"active"
  |"history"

export type ProductionFormatOption={

  value:ProductionFormat

  label:string

  color:string

  icon:EntityIcon

}

export type ProductionScopeOption={

  value:ProductionScope

  label:string

  description:string

  color:string

  icon:EntityIcon

}

export type ProductionSelection={

  format:ProductionFormat

  scope:ProductionScope

}