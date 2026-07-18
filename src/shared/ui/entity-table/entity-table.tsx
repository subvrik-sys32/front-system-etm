"use client"

import { useLayoutEffect, useMemo, useRef, useState } from "react"

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
  TableScrollContainer,
} from "../horizontal-scroll/table-scroll-container"

import type {
  EntityTableProps,
} from "./types"

// Extrae el ancho mínimo en px de un string de columna — "70px" ->
// 70, "minmax(140px,2fr)" -> 140. Es lo mínimo real que esa columna
// puede llegar a ocupar (definido en TABLE_WIDTHS), no un número
// adivinado a mano.
function parseMinWidthPx(width:string):number{

  const minmaxMatch=
    /minmax\(\s*(\d+)px/.exec(width)

  if(minmaxMatch){
    return Number(minmaxMatch[1])
  }

  const pxMatch=
    /^(\d+)px$/.exec(width)

  if(pxMatch){
    return Number(pxMatch[1])
  }

  return 0

}

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

  const containerRef=
    useRef<HTMLDivElement>(null)

  const [containerWidth,setContainerWidth]=
    useState<number|null>(null)

  useLayoutEffect(()=>{

    const el=containerRef.current

    if(!el){
      return
    }

    // Medición sincrónica INMEDIATA, antes de que el navegador
    // pinte — sin esto, cada vez que el componente se monta de
    // nuevo (ej. cambiar de página y volver), containerWidth
    // arrancaba en null, se mostraba la grilla por default, y
    // recién attention al primer callback (asíncrono) del
    // ResizeObserver se recalculaba a modo card — ese hueco de
    // tiempo era el flash de la versión tabla que se veía.
    setContainerWidth(
      el.getBoundingClientRect().width,
    )

    const observer=new ResizeObserver(entries=>{

      const width=
        entries[0]?.contentRect.width

      if(width!==undefined){
        setContainerWidth(width)
      }

    })

    observer.observe(el)

    return ()=>observer.disconnect()

  },[])

  // Suma de los pisos mínimos REALES de cada columna (los mismos
  // números que ya definís en TABLE_WIDTHS) — no un umbral fijo
  // adivinado. Apenas el contenedor medido llega a este punto (el
  // momento exacto en que la grilla ya no puede encogerse más sin
  // necesitar scroll horizontal), se pasa a modo card — nunca se
  // llega a mostrar la scrollbar.
  const totalMinWidthPx=useMemo(
    ()=>columns.reduce(
      (sum,column)=>sum+parseMinWidthPx(column.width),
      0,
    ),
    [columns],
  )

  // null (primer render, todavía no midió) se trata como "no
  // compacto" — evita un parpadeo de cards -> grilla apenas carga.
  const isCompact=
    containerWidth!==null&&
    containerWidth<=totalMinWidthPx

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

      <TableScrollContainer>

        {/* Sin header de columnas en modo card — cada campo ya
            trae su propio label (ver EntityTableCardRow), un header
            de grilla ahí arriba no tendría con qué alinearse. */}
        {!isCompact&&(

          <EntityTableHeader
            columns={columns}
          />

        )}

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

          {isCompact

            ?data.map((item,rowIndex)=>{

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

                    // templateColumns vacío a propósito: en modo
                    // card el contenido maneja su propio layout
                    // (EntityTableCardRow), no hace falta que
                    // renderRow le fuerce un grid de columnas que
                    // no tienen nada que ver — ver el fix en
                    // useRowDragReorder.renderRow.
                    ?renderRow(item,cardContent,"",id)

                    :cardContent

                  }

                  {isExpanded&&renderExpandedRow?.(item)}

                </div>

              )

            })

            :data.map((item,rowIndex)=>(

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

            ))

          }

        </div>

      </TableScrollContainer>

    </div>

  )

}