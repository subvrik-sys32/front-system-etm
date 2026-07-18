"use client"

import type{
  ReactNode,
}from"react"

import{
  EntityTableContent,
}from"./entity-table-content"

import type{
  EntityColumn,
}from"./types"

type Props<T>={
  id:string
  item:T
  rowIndex:number
  columns:EntityColumn<T>[]
  templateColumns:string
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

export function EntityTableItem<T>({
  id,
  item,
  rowIndex,
  columns,
  templateColumns,
  renderRow,
  expandedRowId,
  onExpandedRowChange,
  renderExpandedRow,
}:Props<T>){

  const isExpanded=
    expandedRowId===id

  const content=(

    <EntityTableContent
      item={item}
      rowIndex={rowIndex}
      columns={columns}
      isExpanded={isExpanded}
      toggleExpanded={()=>onExpandedRowChange?.(
        isExpanded
          ?null
          :id,
      )}
    />

  )

  return(

    // Antes esto era un Fragment (sin elemento propio), y
    // "data-expanded-row-id" vivía en la fila colapsada misma —
    // useFocusedRow buscaba ESE elemento y centraba el scroll
    // respecto a él, sin contar el contenido expandido que se
    // renderiza como hermano JUSTO DEBAJO. Resultado: al enfocar
    // una fila y expandirla, el scroll centraba la fila sola, no el
    // bloque fila+contenido expandido junto. Ahora este div externo
    // (que sí envuelve a los dos) es el que tiene el atributo.
    <div data-expanded-row-id={id}>

      {

        renderRow

          ?renderRow(
            item,
            content,
            templateColumns,
            id,
          )

          :(

            <div
              className="grid min-w-0 items-center rounded-xl border-b border-white/5 px-2 transition-colors hover:bg-white/2"
              style={{
                gridTemplateColumns:templateColumns,
              }}
            >

              {content}

            </div>

          )

      }

      {

        isExpanded&&
        renderExpandedRow?.(
          item,
        )

      }

    </div>

  )

}