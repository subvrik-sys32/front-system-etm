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

      <div className="absolute bottom-8 right-8">

        <div className="w-85 rounded-2xl bg-white/4 p-6 shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur-2xl">

          <div className="flex items-center gap-4">

            <LoadingLogo
              logo={logo}
            />

            <div>

              <p className="text-sm font-semibold text-white">
                Sincronizando datos
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                Esto no tomará mucho...
              </p>

            </div>

          </div>

          <LoadingProgress
            progress={progress}
          />

        </div>

      </div>

    </div>

  )

}