"use client"

import { useEffect, useState } from "react"

type Props = {
  logo?: React.ReactNode
  isReady?: boolean
  onComplete?: () => void
  mode?: "init" | "refresh"
}

export function AppLoadingScreen({ logo, isReady = false, onComplete, mode = "init" }: Props) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isReady) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev
        const remaining = 92 - prev
        const step = Math.max(0.5, remaining * 0.08)
        return Math.min(92, prev + step)
      })
    }, 120)

    return () => clearInterval(interval)
  }, [isReady])

  useEffect(() => {
    if (!isReady) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return Math.min(100, prev + 4)
      })
    }, 16)

    return () => clearInterval(interval)
  }, [isReady])

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timeout = setTimeout(onComplete, 250)
      return () => clearTimeout(timeout)
    }
  }, [progress, onComplete])

  const displayProgress = Math.round(progress)

  const title = mode === "refresh" ? "Actualizando ERP" : "Inicializando ERP"
  const subtitle =
    mode === "refresh"
      ? "Sincronizando datos..."
      : "Restaurando sesión y sincronizando datos..."

  return (
    <div className="fixed inset-0 z-9999 bg-[#050505]">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-150 w-150 -translate-x-1/2 rounded-full bg-white/5 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-120 w-120 rounded-full bg-white/4 blur-[140px]" />
      </div>

      <div className="absolute bottom-8 right-8">
        <div className="w-85 rounded-2xl bg-white/4 p-6 shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur-2xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              {logo ?? (
                <span className="text-lg font-bold tracking-widest text-white">
                  ETM
                </span>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                {title}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-white/70">
              {displayProgress}%
            </span>

            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-white/40 transition-[width] duration-150 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}