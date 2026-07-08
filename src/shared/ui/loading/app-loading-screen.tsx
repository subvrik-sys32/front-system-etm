"use client"

import { useEffect,useState } from "react"

import type { ReactNode } from "react"

import { LoadingBackground } from "./loading-background"
import { LoadingLogo } from "./loading-logo"
import { LoadingProgress } from "./loading-progress"

type Props={
  logo?:ReactNode
  isReady?:boolean
  onComplete?:()=>void
}

export function AppLoadingScreen({
  logo,
  isReady=false,
  onComplete,
}:Props){

  const[
    progress,
    setProgress,
  ]=useState(0)

  useEffect(()=>{

    if(isReady){
      return
    }

    const interval=setInterval(()=>{

      setProgress(prev=>{

        if(prev>=92){
          return prev
        }

        const remaining=92-prev

        const step=Math.max(
          .5,
          remaining*.08,
        )

        return Math.min(
          92,
          prev+step,
        )

      })

    },120)

    return()=>clearInterval(
      interval,
    )

  },[
    isReady,
  ])

  useEffect(()=>{

    if(!isReady){
      return
    }

    const interval=setInterval(()=>{

      setProgress(prev=>{

        if(prev>=100){

          clearInterval(
            interval,
          )

          return 100

        }

        return Math.min(
          100,
          prev+4,
        )

      })

    },16)

    return()=>clearInterval(
      interval,
    )

  },[
    isReady,
  ])

  useEffect(()=>{

    if(
      progress<100||
      !onComplete
    ){
      return
    }

    const timeout=setTimeout(
      onComplete,
      250,
    )

    return()=>clearTimeout(
      timeout,
    )

  },[
    progress,
    onComplete,
  ])

  return(

    <div className="fixed inset-0 z-9999 bg-[#050505]">

      <LoadingBackground/>

      <div className="absolute bottom-10 right-10">

        <div className="w-[320px] overflow-hidden rounded-3xl bg-linear-to-b from-white/5 to-white/2.5 shadow-[0_24px_70px_rgba(0,0,0,.55)] backdrop-blur-3xl">

          <div className="flex flex-col items-center">

            <p className="mt-5 text-[18px] font-semibold tracking-tight text-white">
              Sincronizando datos
            </p>

            <p className="mt-1 text-[11px] text-neutral-500">
              Preparando el entorno de trabajo...
            </p>

          </div>

          <div className="px-7 pb-7 pt-6">

            <LoadingProgress
              progress={progress}
            />

          </div>

        </div>

      </div>

    </div>

  )

}