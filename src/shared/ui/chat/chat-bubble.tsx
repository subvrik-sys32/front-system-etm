"use client"

import type { ReactNode } from "react"

import { cn } from "@/shared/utils/utils"

type ChatBubbleProps = {
  /** Mensaje del usuario (derecha / fill inverse). */
  own?: boolean
  /** Centrar texto en mensajes cortos sin meta extra. */
  centered?: boolean
  children: ReactNode
  className?: string
}

/**
 * Burbuja de mensaje — paridad comments / CAD AI.
 * `w-fit` + padding simétrico; fill inverse para propios.
 */
export function ChatBubble({
  own = false,
  centered = false,
  children,
  className,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "w-fit max-w-[min(85%,22rem)] min-h-9 rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-xs",
        own
          ? "bg-foreground text-background"
          : "bg-muted/80 text-foreground dark:bg-foreground/[0.06]",
        centered && "text-center",
        className,
      )}
    >
      {children}
    </div>
  )
}
