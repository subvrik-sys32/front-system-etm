"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/shared/utils/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChromeInset } from "@/shared/responsive/layout/use-chrome-inset"

type Props = {
  children: React.ReactNode
  resetKey?: string
  className?: string
}

/**
 * Único dueño del scroll vertical de páginas lista.
 * Inset del chrome: useChromeInset (SSOT).
 */
export function AppListScroll({ children, resetKey, className }: Props) {
  const pathname = usePathname()
  const key = resetKey ?? pathname
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inset = useChromeInset()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [key])

  return (
    <ScrollArea
      ref={scrollRef}
      orientation="vertical"
      className="h-full min-h-0 min-w-0 flex-1"
    >
      <div
        className={cn("flex min-h-full flex-col", className)}
        style={inset}
      >
        {children}
      </div>
    </ScrollArea>
  )
}
