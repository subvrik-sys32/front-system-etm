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