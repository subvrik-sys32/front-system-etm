"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import { LoadingBackground } from "./loading-background"

type Props = {
  isReady?: boolean
  onComplete?: () => void
}

export function AppLoadingScreen({
  isReady = false,
  onComplete,
}: Props) {

  const [progress, setProgress] = useState(0)

  useEffect(() => {

    if (isReady) {
      return
    }

    const interval = setInterval(() => {

      setProgress(prev => {

        if (prev >= 92) {
          return prev
        }

        const remaining = 92 - prev

        const step = Math.max(
          0.5,
          remaining * 0.08,
        )

        return Math.min(
          92,
          prev + step,
        )

      })

    },120)

    return () => clearInterval(interval)

  },[
    isReady,
  ])


  useEffect(() => {

    if (!isReady) {
      return
    }

    const interval = setInterval(() => {

      setProgress(prev => {

        if (prev >= 100) {

          clearInterval(interval)

          return 100
        }

        return Math.min(
          100,
          prev + 4,
        )

      })

    },16)


    return () => clearInterval(interval)

  },[
    isReady,
  ])


  useEffect(() => {

    if (
      progress < 100 ||
      !onComplete
    ) {
      return
    }


    const timeout = setTimeout(
      onComplete,
      250,
    )


    return () => clearTimeout(timeout)

  },[
    progress,
    onComplete,
  ])



  return (

    <div className="
      fixed
      inset-0
      z-[9999]
      flex
      flex-col
      items-center
      justify-center
      bg-[#050505]
    ">


      <LoadingBackground />


      <div className="
        flex
        flex-col
        items-center
      ">


        {/* LOGO */}

        <div className="
          relative
          h-24
          w-24
        ">

          <Image
            src="/icon.svg"
            alt="Logo"
            fill
            priority
            className="
              object-contain
            "
          />

        </div>



        {/* TEXTO */}

        <div className="
          mt-8
          flex
          items-center
          gap-1
        ">


          <span className="
            text-[12px]
            font-medium
            uppercase
            tracking-[0.2em]
            text-[#FCD34D]
          ">
            Cargando
          </span>


          <div className="
            flex
            gap-1
          ">

            <span className="
              h-1
              w-1
              animate-bounce
              rounded-full
              bg-[#FCD34D]
              [animation-delay:-0.3s]
            "/>


            <span className="
              h-1
              w-1
              animate-bounce
              rounded-full
              bg-[#FCD34D]
              [animation-delay:-0.15s]
            "/>


            <span className="
              h-1
              w-1
              animate-bounce
              rounded-full
              bg-[#FCD34D]
            "/>


          </div>


        </div>


      </div>


    </div>

  )
}