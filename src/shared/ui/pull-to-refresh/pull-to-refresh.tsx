"use client"

import * as React from "react"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { TOP_BAR_HEIGHT_PX } from "@/shared/responsive/layout/chrome-constants"
import { cn } from "@/shared/utils/utils"

const THRESHOLD_PX = 70
const MAX_PULL_PX = 110

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => void | Promise<void>
  scrollRef: React.RefObject<HTMLElement | null>
  disabled?: boolean
}

export function PullToRefresh({
  children,
  onRefresh,
  scrollRef,
  disabled = false,
}: PullToRefreshProps) {
  const [refreshing, setRefreshing] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)

  const startY = React.useRef(0)
  const isDragging = React.useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || refreshing) return
    const el = scrollRef.current
    
    // Si no estamos arriba del todo, permitimos scroll nativo puro sin interferencias
    if (!el || el.scrollTop > 0) return

    startY.current = e.touches[0].clientY
    isDragging.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || refreshing) return
    const el = scrollRef.current
    
    if (!el || el.scrollTop > 0) {
      isDragging.current = false
      setPullDistance(0)
      return
    }

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff <= 0) {
      setPullDistance(0)
      return
    }

    // Amortiguación elástica suave
    const damped = Math.min(MAX_PULL_PX, diff * 0.45)
    setPullDistance(damped)
  }

  const handleTouchEnd = async () => {
    if (!isDragging.current) return
    isDragging.current = false

    if (pullDistance >= THRESHOLD_PX && !refreshing) {
      setRefreshing(true)
      setPullDistance(THRESHOLD_PX)
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  const progress = Math.min(1, pullDistance / THRESHOLD_PX)
  const showIndicator = pullDistance > 0 || refreshing

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Indicador superior flotante con sombra de token y sin bordes */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 right-0 z-50 flex justify-center transition-opacity duration-200",
          showIndicator ? "opacity-100" : "opacity-0",
        )}
        style={{ top: TOP_BAR_HEIGHT_PX }}
        aria-hidden
      >
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            "bg-muted/95 text-foreground shadow-lg backdrop-blur-md",
          )}
          style={{
            transform: refreshing
              ? "scale(1)"
              : `scale(${0.6 + progress * 0.4}) translateY(${pullDistance * 0.25}px)`,
          }}
        >
          <Spinner size={16} className={cn("text-foreground", refreshing && "animate-spin")} />
        </div>
      </div>

      {/* Contenedor con traslación elástica */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: isDragging.current ? "none" : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="w-full h-full"
      >
        {children}
      </div>
    </div>
  )
}