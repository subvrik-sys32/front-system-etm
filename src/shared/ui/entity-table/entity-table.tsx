"use client"

import { useMemo } from "react"

import {
  EntityTableHeader,
} from "./entity-table-header"

import {
  EntityTableItem,
} from "./entity-table-item"

import {
  EntityTableCardRow,
} from "./entity-table-card-row"

import {
  useTableCompactMode,
} from "./use-table-compact-mode"

import {
  TableScrollContainer,
} from "../horizontal-scroll/table-scroll-container"

import type {
  EntityTableProps,
} from "./types"

export function EntityTable<T>({
  data,
  columns,
  rowId,
  emptyMessage="Sin registros",
  renderRow,
  expandedRowId,
  onExpandedRowChange,
  renderExpandedRow,
}:EntityTableProps<T>){

  const { containerRef, isCompact } =
    useTableCompactMode(columns)

  const templateColumns=useMemo(
    ()=>columns.map(column=>column.width).join(" "),
    [columns],
  )

  return(

    // Antes: h-[calc(100vh-240px)] — número mágico calculado a mano
    // para el chrome de UNA página en desktop. Se rompía en cualquier
    // otro layout (mobile con TopBar/BottomNav, u otra página con
    // distinto header). Ahora: h-full, y quien realmente sabe cuánto
    // espacio sobra es el padre vía flexbox (min-h-0 flex-1) — la
    // altura queda correcta automáticamente sin importar el chrome
    // que la rodee, en cualquier breakpoint.
    <div
      ref={containerRef}
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[#101012] ring-1 ring-white/6"
    >

      {isCompact ? (

        // Sin TableScrollContainer acá: ese contenedor está pensado
        // para el ancho FIJO de las columnas de grilla (w-fit,
        // overflow-x-auto) — las cards no necesitan nada de eso,
        // siempre ocupan el ancho completo. Compartir ese contenedor
        // (con su lógica de "ancho según contenido") es lo que hacía
        // que la altura total se calculara de forma inconsistente en
        // modo card.
        <div className="flex h-full min-h-0 flex-col">

          <div
            data-entity-table-scroll
            className="erp-scrollbar min-h-0 flex-1 overflow-y-auto"
            style={{
              scrollbarGutter:"stable",
            }}
          >

            {data.length===0&&(

              <div className="flex h-60 items-center justify-center text-neutral-500">
                {emptyMessage}
              </div>

            )}

            {data.map((item,rowIndex)=>{

              const id=rowId(item)
              const isExpanded=expandedRowId===id

              const cardContent=(

                <EntityTableCardRow
                  item={item}
                  rowIndex={rowIndex}
                  columns={columns}
                  isExpanded={isExpanded}
                  toggleExpanded={()=>
                    onExpandedRowChange?.(
                      isExpanded?null:id,
                    )
                  }
                />

              )

              return(

                <div key={id} data-expanded-row-id={id}>

                  {renderRow

                    ?renderRow(item,cardContent,"",id)

                    :cardContent

                  }

                  {isExpanded&&renderExpandedRow?.(item)}

                </div>

              )

            })}

          </div>

        </div>

      ) : (

        <TableScrollContainer>

          <EntityTableHeader
            columns={columns}
          />

          <div
            data-entity-table-scroll
            className="erp-scrollbar flex-1 overflow-y-auto"
            style={{
              scrollbarGutter:"stable",
            }}
          >

            {data.length===0&&(

              <div className="flex h-60 items-center justify-center text-neutral-500">
                {emptyMessage}
              </div>

            )}

            {data.map((item,rowIndex)=>(

              <EntityTableItem
                key={rowId(item)}
                id={rowId(item)}
                item={item}
                rowIndex={rowIndex}
                columns={columns}
                templateColumns={templateColumns}
                renderRow={renderRow}
                expandedRowId={expandedRowId}
                onExpandedRowChange={onExpandedRowChange}
                renderExpandedRow={renderExpandedRow}
              />

            ))}

          </div>

        </TableScrollContainer>

      )}

    </div>

  )

}