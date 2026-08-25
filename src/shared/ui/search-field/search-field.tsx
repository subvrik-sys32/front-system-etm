"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { cn } from "@/shared/utils/utils"

export type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  autoFocus?: boolean
  disabled?: boolean
  id?: string
  "aria-label"?: string
}

/**
 * Campo de búsqueda estándar del ERP.
 * Misma métrica que SidebarPresence: h-9, icon 14, text-base sm:text-sm.
 */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      value,
      onChange,
      placeholder = "Buscar...",
      className,
      inputClassName,
      autoFocus,
      disabled,
      id,
      "aria-label": ariaLabel,
    },
    ref,
  ) {
    return (
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-xl bg-foreground/5 px-2.5",
          className,
        )}
      >
        <Search size={14} className="shrink-0 text-muted-foreground" strokeWidth={2} />
        <input
          ref={ref}
          id={id}
          type="search"
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={ariaLabel ?? placeholder}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-base leading-none text-foreground outline-none placeholder:text-muted-foreground/80 sm:text-sm",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // sin chrome nativo de type=search
            "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
            inputClassName,
          )}
        />
      </div>
    )
  },
)
