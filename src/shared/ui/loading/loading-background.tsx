"use client"

import { memo } from "react"

export const LoadingBackground = memo(function LoadingBackground() {

  return (

    <div className="pointer-events-none absolute inset-0">

      <div className="absolute left-1/2 top-1/3 h-150 w-150 -translate-x-1/2 rounded-full bg-white/5 blur-[160px]" />

      <div className="absolute bottom-0 right-0 h-120 w-120 rounded-full bg-white/4 blur-[140px]" />

    </div>

  )

})