"use client"

import * as React from "react"
import { cn } from "@/shared/utils/utils"

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-1p-ignore
      data-lpignore="true"
      className={cn(
        "h-9 w-full min-w-0 rounded-xl px-3.5",
        "border border-transparent",
        "bg-foreground/5",
        "text-base font-medium text-foreground placeholder:text-muted-foreground/80 sm:text-sm",
        "outline-none focus:outline-none focus:ring-0",
        "focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)

Input.displayName = "Input"
