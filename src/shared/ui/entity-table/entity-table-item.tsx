"use client"

import{
  Fragment,
  type ReactNode,
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

    <Fragment>

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
              data-expanded-row-id={id}
              className="grid min-w-0 items-center border-b border-white/5 transition-colors"
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

    </Fragment>

  )

}