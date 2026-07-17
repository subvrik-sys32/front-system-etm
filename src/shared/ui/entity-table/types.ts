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

  // Ancho REAL del contenedor de la tabla (no de la ventana) por
  // debajo del cual esta columna se oculta entera — header y celda
  // de cada fila. Sin este campo, la columna es "esencial" y nunca
  // se oculta. Se mide con ResizeObserver sobre el propio
  // contenedor de la tabla, así funciona igual si la tabla está en
  // pantalla completa o metida en un panel angosto.
  minWidth?:number

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