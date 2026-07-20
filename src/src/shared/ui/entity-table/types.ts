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

  // Forma real que el skeleton de carga debe calcar para esta
  // columna — no un texto genérico. "badge": píldora redonda tipo
  // DynamicBadge (min-h-8, rounded-full). "icon": un solo ícono
  // cuadrado (DragCell/ExpandCell, h-9 w-9). "actions-pair": dos
  // íconos en fila con separación (TaskRowActions/ProjectRowActions/
  // UserRowActions, h-8 w-8 cada uno). "workflow-action": el botón
  // Iniciar/Completar de Procesos (WorkflowAction, h-9). "none":
  // no renderiza nada real ahí (ej. drag en Procesos). Sin esto,
  // cae en "text" (una barra angosta, para texto simple).
  skeletonShape?:
    |"badge"
    |"icon"
    |"actions-pair"
    |"workflow-action"
    |"text"
    |"none"

  render:(
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