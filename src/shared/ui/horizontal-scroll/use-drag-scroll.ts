"use client"

import {
  useCallback,
  useEffect,
  useRef,
} from "react"

const DRAG_THRESHOLD=6
const DRAG_SPEED=1.2
const WHEEL_MULTIPLIER=3.5

const DRAG_SCROLL_IGNORE_SELECTOR =
  "[data-drag-scroll-ignore]"

// Se dispara apenas detectamos un scroll/drag horizontal real
// (no en cada click). Cualquier overlay abierto debe cerrarse
// al escuchar esto, para no quedar desconectado de su tarjeta.
export const PIPELINE_SCROLL_INTERACTION_EVENT =
  "pipeline-scroll-interaction"

function notifyScrollInteraction(){

  window.dispatchEvent(
    new Event(
      PIPELINE_SCROLL_INTERACTION_EVENT
    )
  )

}

export function useDragScroll(){

  const containerRef=
    useRef<HTMLDivElement>(null)

  const isDragging=
    useRef(false)

  const dragged=
    useRef(false)

  const suppressClick=
    useRef(false)

  const startX=
    useRef(0)

  const startScrollLeft=
    useRef(0)

  const handleMouseDown=
    useCallback((
      event:React.MouseEvent
    )=>{

      const target=
        event.target as HTMLElement

      if(
        target.closest(
          DRAG_SCROLL_IGNORE_SELECTOR
        )
      ){
        return
      }

      const container=
        containerRef.current

      if(!container){
        return
      }

      isDragging.current=true
      dragged.current=false

      startX.current=
        event.clientX

      startScrollLeft.current=
        container.scrollLeft

      document.body.style.userSelect=
        "none"

      document.body.style.cursor=
        "grabbing"

    },[])

  const handleMouseMove=
    useCallback((
      event:React.MouseEvent
    )=>{

      const container=
        containerRef.current

      if(
        !isDragging.current||
        !container
      ){
        return
      }

      const deltaX=
        event.clientX-
        startX.current

      if(
        Math.abs(deltaX)>
        DRAG_THRESHOLD
      ){

        // Recién al cruzar el threshold consideramos que es
        // un drag real (no un click con micro-temblor) y
        // avisamos para que cualquier overlay abierto se cierre.
        if(!dragged.current){
          notifyScrollInteraction()
        }

        dragged.current=true

      }

      container.scrollLeft=
        startScrollLeft.current-
        deltaX*
        DRAG_SPEED

    },[])

  const stopDragging=
    useCallback(()=>{

      if(
        dragged.current
      ){

        suppressClick.current=true

        window.setTimeout(()=>{

          suppressClick.current=false

        },200)

      }

      isDragging.current=false

      document.body.style.userSelect=""
      document.body.style.cursor=""

    },[])

  const handleClickCapture=
    useCallback((
      event:React.MouseEvent
    )=>{

      const target=
        event.target as HTMLElement

      if(
        target.closest(
          DRAG_SCROLL_IGNORE_SELECTOR
        )
      ){
        return
      }

      if(
        suppressClick.current
      ){

        event.preventDefault()
        event.stopPropagation()

      }

    },[])

  useEffect(()=>{

    const handleMouseUp=
      ()=>stopDragging()

    window.addEventListener(
      "mouseup",
      handleMouseUp
    )

    return()=>{

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      )

    }

  },[
    stopDragging,
  ])

  useEffect(()=>{

    const container=
      containerRef.current

    if(!container){
      return
    }

    let frame=0

    let notified=false

    const handleWheel=(
      event:WheelEvent
    )=>{

      if(
        Math.abs(event.deltaY)<=
        Math.abs(event.deltaX)
      ){
        return
      }

      event.preventDefault()

      if(!notified){

        notifyScrollInteraction()

        notified=true

        window.setTimeout(()=>{
          notified=false
        },250)

      }

      const delta=
        event.deltaY*
        WHEEL_MULTIPLIER

      cancelAnimationFrame(
        frame
      )

      frame=
        requestAnimationFrame(()=>{

          container.scrollLeft+=
            delta

        })

    }

    container.addEventListener(
      "wheel",
      handleWheel,
      {
        passive:false,
      }
    )

    return()=>{

      cancelAnimationFrame(
        frame
      )

      container.removeEventListener(
        "wheel",
        handleWheel
      )

    }

  },[])

  return{

    containerRef,

    isDragging,

    dragged,

    suppressClick,

    handleMouseDown,

    handleMouseMove,

    handleClickCapture,

    stopDragging,

  }

}