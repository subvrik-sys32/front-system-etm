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
  /** ms antes de notificar al padre (filtro). Default 160. */
  debounceMs?: number
}

/**
 * Búsqueda del ERP.
 * El input es local: cada tecla no re-renderiza la lista.
 * El padre recibe el valor debounceado para filtrar.
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
      debounceMs = 160,
    },
    ref,
  ) {
    const [draft, setDraft] = React.useState(value)
    const onChangeRef = React.useRef(onChange)
    onChangeRef.current = onChange

    React.useEffect(() => {
      setDraft(value)
    }, [value])

    React.useEffect(() => {
      if (draft === value) return
      const t = window.setTimeout(() => {
        onChangeRef.current(draft)
      }, debounceMs)
      return () => window.clearTimeout(t)
    }, [draft, value, debounceMs])

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
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          value={draft}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={ariaLabel ?? placeholder}
          onChange={e => setDraft(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-xs leading-none text-foreground outline-none placeholder:text-muted-foreground/80",
            "disabled:cursor-not-allowed disabled:opacity-50",
            inputClassName,
          )}
        />
      </div>
    )
  },
)
