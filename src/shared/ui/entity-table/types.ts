import type{
  ReactNode,
}from"react"

export type EntityColumnContext<T>={
  item:T
  rowIndex:number
  isExpanded:boolean
  toggleExpanded:()=>void
}

export type EntityColumn<T>={
  id:string
  title:string
  width:string
  align?:"left"|"center"|"right"

  // Orden dentro de la card compacta (menor = aparece antes) —
  // independiente del orden en la grilla normal de la tabla, que
  // no cambia. Sin esto, cae al final, en su orden natural.
  cardOrder?:number

  // Agrupa visualmente varios campos como un solo bloque dentro de
  // la card (con un separador entre grupos distintos) — por ejemplo
  // "Cliente/Etapa/Estado/PM" como un conjunto aparte de
  // "ID/Proyecto/Código/Entrega". Columnas sin grupo caen en un
  // grupo default sin nombre.
  cardGroup?:string

  render:(
    item:T,
    context:EntityColumnContext<T>,
  )=>ReactNode

  renderOverlay?:(
    item:T,
    context:EntityColumnContext<T>,
  )=>ReactNode
}

export type EntityTableProps<T>={
  data:T[]
  columns:EntityColumn<T>[]
  rowId:(item:T)=>string
  emptyMessage?:string

  renderRow?:(
    item:T,
    content:ReactNode,
    templateColumns:string,
    rowId:string,
  )=>ReactNode

  expandedRowId?:string|null

  onExpandedRowChange?:(
    rowId:string|null,
  )=>void

  renderExpandedRow?:(
    item:T,
  )=>ReactNode
}