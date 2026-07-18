"use client"

import { useLayoutEffect, useMemo, useRef, useState } from "react"

import type { EntityColumn } from "./types"

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

// Antes esta lógica vivía SOLO adentro de EntityTable — pero el
// skeleton de carga se muestra ANTES de que EntityTable exista (el
// componente de página decide "loading ? <Skeleton/> : <EntityTable/>"),
// así que no tenía forma de saber si tocaba mostrar el skeleton de
// grilla o el de card. Extraído acá para que cualquiera de los dos
// (EntityTable real, o su skeleton) pueda medir su PROPIO contenedor
// y llegar a la misma decisión, usando el mismo array de columnas.
export function useTableCompactMode<T>(columns:EntityColumn<T>[]){

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
    // pinte — evita el flash de un modo mostrándose brevemente
    // antes de corregirse al otro.
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

  return { containerRef, isCompact }

}