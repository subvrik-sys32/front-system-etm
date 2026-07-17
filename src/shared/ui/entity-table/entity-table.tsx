"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import {
  EntityTableHeader,
} from "./entity-table-header"

import {
  EntityTableItem,
} from "./entity-table-item"

import {
  EntityTableHiddenColumns,
} from "./entity-table-hidden-columns"

import {
  TableScrollContainer,
} from "../horizontal-scroll/table-scroll-container"

import type {
  EntityColumn,
  EntityTableProps,
} from "./types"

// Separa las columnas en "las que entran" y "las que no" según el
// ancho real medido. Las que tienen "minWidth" y no lo alcanzan se
// ocultan; las que no tienen "minWidth" son esenciales y nunca se
// filtran.
function splitColumns<T>(
  columns:EntityColumn<T>[],
  containerWidth:number|null,
):{
  visible:EntityColumn<T>[]
  hidden:EntityColumn<T>[]
}{

  // null = todavía no midió (primer render) — mostramos todo para
  // no hacer parpadear columnas que van a aparecer un instante
  // después de todos modos.
  if(containerWidth===null){
    return { visible:columns, hidden:[] }
  }

  const visible:EntityColumn<T>[]=[]
  const hidden:EntityColumn<T>[]=[]

  for(const column of columns){

    if(
      column.minWidth===undefined||
      containerWidth>=column.minWidth
    ){
      visible.push(column)
    }else{
      hidden.push(column)
    }

  }

  return { visible, hidden }

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

  useEffect(()=>{

    const el=containerRef.current

    if(!el){
      return
    }

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

  const { visible, hidden }=useMemo(
    ()=>splitColumns(columns,containerWidth),
    [columns,containerWidth],
  )

  // Cuando hay columnas ocultas, se agrega una columna "virtual"
  // al final — mismo mecanismo de renderizado que cualquier otra
  // columna (header vacío + una celda por fila), así que no hace
  // falta tocar EntityTableHeader/Item/Content para nada: solo
  // reciben un array de columnas un poco más largo.
  const tableColumns=useMemo(
    ():EntityColumn<T>[]=>{

      if(hidden.length===0){
        return visible
      }

      const indicatorColumn:EntityColumn<T>={
        id:"__hidden-columns",
        title:"",
        width:"44px",
        align:"center",
        render:(item,context)=>(
          <EntityTableHiddenColumns
            item={item}
            context={context}
            hiddenColumns={hidden}
          />
        ),
        renderOverlay:()=>null,
      }

      return [...visible,indicatorColumn]

    },
    [visible,hidden],
  )

  const templateColumns=useMemo(
    ()=>tableColumns.map(column=>column.width).join(" "),
    [tableColumns],
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

        <EntityTableHeader
          columns={tableColumns}
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
              columns={tableColumns}
              templateColumns={templateColumns}
              renderRow={renderRow}
              expandedRowId={expandedRowId}
              onExpandedRowChange={onExpandedRowChange}
              renderExpandedRow={renderExpandedRow}
            />

          ))}

        </div>

      </TableScrollContainer>

    </div>

  )

}