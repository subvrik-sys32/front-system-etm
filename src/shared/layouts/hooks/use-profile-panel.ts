"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

const SAFE_MARGIN = 16

export function useProfilePanel() {

  const [profileOpen,setProfileOpen]=useState(false)
  const [canOpenProfile,setCanOpenProfile]=useState(true)
  const [presenceCollapsed,setPresenceCollapsed]=useState(false)

  const containerRef=useRef<HTMLDivElement|null>(null)
  const panelRef=useRef<HTMLDivElement|null>(null)
  const contentRef=useRef<HTMLDivElement|null>(null)
  const cardRef=useRef<HTMLDivElement|null>(null)

  const pendingOpenRef=useRef(false)

  const fitsInViewport=useCallback(()=>{

    const container=containerRef.current
    const content=contentRef.current
    const card=cardRef.current

    if(!container||!content||!card){
      return true
    }

    const aside=container.closest("aside")

    if(!aside){
      return true
    }

    const asideRect=aside.getBoundingClientRect()
    const cardRect=card.getBoundingClientRect()

    const availableHeight=
      cardRect.top-
      asideRect.top-
      SAFE_MARGIN

    const requiredHeight=
      content.getBoundingClientRect().height

    return requiredHeight<=availableHeight

  },[])

  const closeProfile=useCallback(()=>{

    setProfileOpen(false)
    setPresenceCollapsed(false)

  },[])

  const update=useCallback(()=>{

    const canOpen=fitsInViewport()

    setCanOpenProfile(canOpen)

    if(profileOpen&&!canOpen){
      closeProfile()
    }

  },[
    fitsInViewport,
    profileOpen,
    closeProfile,
  ])

  function toggleProfile(){

    if(profileOpen){
      closeProfile()
      return
    }

    if(fitsInViewport()){
      setCanOpenProfile(true)
      setProfileOpen(true)
      return
    }

    pendingOpenRef.current=true
    setPresenceCollapsed(true)

  }

  useLayoutEffect(()=>{

    if(!pendingOpenRef.current){
      return
    }

    pendingOpenRef.current=false

    const fitsNow=fitsInViewport()

    setCanOpenProfile(fitsNow)

    if(fitsNow){
      setProfileOpen(true)
    }else{
      setPresenceCollapsed(false)
    }

  },[
    presenceCollapsed,
    fitsInViewport,
  ])

  useEffect(()=>{

    update()

  },[update])

  useEffect(()=>{

    const aside=
      containerRef.current?.closest("aside")

    if(!aside){
      return
    }

    const observer=
      new ResizeObserver(update)

    observer.observe(aside)

    return()=>observer.disconnect()

  },[update])

  useEffect(()=>{

    const content=contentRef.current

    if(!content){
      return
    }

    const observer=
      new ResizeObserver(update)

    observer.observe(content)

    return()=>observer.disconnect()

  },[update])

  useEffect(()=>{

    window.addEventListener(
      "resize",
      update,
    )

    return()=>window.removeEventListener(
      "resize",
      update,
    )

  },[update])

  useEffect(()=>{

    if(!window.visualViewport){
      return
    }

    const viewport=window.visualViewport

    let lastScale=viewport.scale
    let lastWidth=viewport.width
    let lastHeight=viewport.height

    function handleViewportChange(){

      if(
        viewport.scale!==lastScale||
        viewport.width!==lastWidth||
        viewport.height!==lastHeight
      ){

        lastScale=viewport.scale
        lastWidth=viewport.width
        lastHeight=viewport.height

        closeProfile()

        requestAnimationFrame(update)

      }

    }

    viewport.addEventListener(
      "resize",
      handleViewportChange,
    )

    return()=>viewport.removeEventListener(
      "resize",
      handleViewportChange,
    )

  },[
    closeProfile,
    update,
  ])

  useEffect(()=>{

    if(!profileOpen){
      return
    }

    function handlePointerDown(
      e:PointerEvent,
    ){

      if(
        containerRef.current&&
        !containerRef.current.contains(
          e.target as Node,
        )
      ){
        closeProfile()
      }

    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    )

    return()=>document.removeEventListener(
      "pointerdown",
      handlePointerDown,
    )

  },[
    profileOpen,
    closeProfile,
  ])

  return{

    profileOpen,
    setProfileOpen,
    toggleProfile,
    canOpenProfile,
    presenceCollapsed,

    containerRef,
    panelRef,
    contentRef,
    cardRef,

  }

}