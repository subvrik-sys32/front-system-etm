"use client"

import { memo } from "react"

export const LoadingBackground = memo(function LoadingBackground() {

  return (

    <div className="pointer-events-none absolute inset-0 bg-[#050505]" />

  )

})