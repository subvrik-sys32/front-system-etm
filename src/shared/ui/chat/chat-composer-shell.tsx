"use client"

import type { ReactNode } from "react"

import { cn } from "@/shared/utils/utils"

type ChatComposerShellProps = {
  children: ReactNode
  className?: string
}

/**
 * Contenedor del input de chat — mismo shell que comment-composer:
 * `rounded-2xl bg-foreground/[0.06] px-2 py-1.5`.
 */
export function ChatComposerShell({
  children,
  className,
}: ChatComposerShellProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-2xl bg-foreground/[0.06] px-2 py-1.5",
        className,
      )}
    >
      {children}
    </div>
  )
}
