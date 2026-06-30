"use client"

import {
  useCallback,
  useEffect,
  useRef,
} from "react"

const DRAG_THRESHOLD=6
const DRAG_SPEED=1.2
const WHEEL_MULTIPLIER=3.5

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