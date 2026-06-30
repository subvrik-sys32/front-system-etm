"use client"

import { EntityTableCell } from "./entity-table-cell"

import type {
  EntityColumn,
} from "./types"

type Props<T>={
  item:T
  rowIndex:number
  columns:EntityColumn<T>[]
  isExpanded:boolean
  toggleExpanded:()=>void
  mode?:"table"|"overlay"
}

export function EntityTableContent<T>({
  item,
  rowIndex,
  columns,
  isExpanded,
  toggleExpanded,
  mode="table",
}:Props<T>){

  return(

    <>

      {columns.map(column=>{

        const renderer=

          mode==="overlay" &&
          column.renderOverlay

            ? column.renderOverlay

            : column.render

        return(

          <EntityTableCell
            key={column.id}
            align={column.align}
          >

            {renderer(
              item,
              {
                item,
                rowIndex,
                isExpanded,
                toggleExpanded,
              }
            )}

          </EntityTableCell>

        )

      })}

    </>

  )

}