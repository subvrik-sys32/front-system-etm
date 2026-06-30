"use client"

import {
  RefObject,
  useLayoutEffect,
  useState,
} from "react"

const THRESHOLD=4

type Props={
  containerRef:RefObject<HTMLDivElement|null>
}

type FadeState={
  leftOpacity:number
  rightOpacity:number
}

export function useHorizontalFade({
  containerRef,
}:Props){

  const [
    fade,
    setFade,
  ]=useState<FadeState>({
    leftOpacity:0,
    rightOpacity:1,
  })

  useLayoutEffect(()=>{

    const container=
      containerRef.current

    if(!container){
      return
    }

    const updateFade=()=>{

      const {
        scrollLeft,
        clientWidth,
        scrollWidth,
      }=container

      const hasOverflow=
        scrollWidth>
        clientWidth+
        THRESHOLD

      if(
        !hasOverflow
      ){

        setFade({
          leftOpacity:0,
          rightOpacity:0,
        })

        return

      }

      const maxScroll=
        scrollWidth-
        clientWidth

      const atStart=
        scrollLeft<=
        THRESHOLD

      const atEnd=
        scrollLeft>=
        maxScroll-
        THRESHOLD

      setFade({

        leftOpacity:
          atStart
            ? 0
            : 1,

        rightOpacity:
          atEnd
            ? 0
            : 1,

      })

    }

    updateFade()

    container.addEventListener(
      "scroll",
      updateFade,
      {
        passive:true,
      }
    )

    const resizeObserver=
      new ResizeObserver(
        updateFade
      )

    resizeObserver.observe(
      container)

    return()=>{

      container.removeEventListener(
        "scroll",
        updateFade
      )

      resizeObserver.disconnect()

    }

  },[
    containerRef,
  ])

  return fade

}