"use client"

import {
  RefObject,
  useLayoutEffect,
  useState,
} from "react"

const THRESHOLD=4

type Props={
  containerRef:RefObject<HTMLElement|null>
}

export function useVerticalFade({
  containerRef,
}:Props){

  const [
    showTop,
    setShowTop,
  ]=useState(false)

  const [
    showBottom,
    setShowBottom,
  ]=useState(true)

  useLayoutEffect(()=>{

    const container=
      containerRef.current

    if(!container){
      return
    }

    const updateFade=()=>{

      const {
        scrollTop,
        clientHeight,
        scrollHeight,
      }=container

      const hasOverflow=
        scrollHeight>
        clientHeight+
        THRESHOLD

      if(
        !hasOverflow
      ){

        setShowTop(false)
        setShowBottom(false)

        return

      }

      const maxScroll=
        scrollHeight-
        clientHeight

      const atTop=
        scrollTop<=
        THRESHOLD

      const atBottom=
        scrollTop>=
        maxScroll-
        THRESHOLD

      setShowTop(
        !atTop
      )

      setShowBottom(
        !atBottom
      )

    }

    updateFade()

    const resizeObserver=
      new ResizeObserver(
        updateFade
      )

    resizeObserver.observe(
      container
    )

    container.addEventListener(
      "scroll",
      updateFade,
      {
        passive:true,
      }
    )

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

  return{

    showTop,
    showBottom,

  }

}