"use client"

import { memo } from "react"

type Props = {
  progress: number
}

export const LoadingProgress = memo(function LoadingProgress({
  progress,
}: Props) {

  const displayProgress =
    Math.round(progress)

  return (

    <div className="flex items-center gap-3">

      <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-white/70">

        {displayProgress}%

      </span>

      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/6">

        <div
          className="h-full rounded-full bg-white/40 transition-[width] duration-150 ease-out"
          style={{
            width: `${displayProgress}%`,
          }}
        />

      </div>

    </div>

  )

},
(prev, next) =>

  Math.round(prev.progress) ===
  Math.round(next.progress)

)