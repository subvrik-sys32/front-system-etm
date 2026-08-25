"use client"

import * as React from "react"
import { cn } from "@/shared/utils/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Opcional: si necesitas un callback optimizado o control externo opcional
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null)

    // Unificar refs (la externa que te pasen y la interna)
    React.useImperativeHandle(ref, () => internalRef.current!)

    return (
      <textarea
        ref={internalRef}
        data-slot="textarea"
        onChange={onChange}
        className={cn(
          "min-h-24 w-full rounded-xl border border-transparent bg-foreground/5 px-4 py-3",
          "text-[15px] font-medium leading-snug text-foreground",
          "placeholder:text-muted-foreground/80 outline-none",
          "transition-colors duration-200 resize-none", // Quitamos 'transition-all' para evitar cálculos innecesarios de layout por frame
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-red-500/30 aria-invalid:bg-red-500/5",
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"