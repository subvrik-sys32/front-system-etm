"use client"

import { Check } from "lucide-react"

import { cn } from "@/shared/utils/utils"

type Props = {
  label: string
  checked: boolean
  onToggle: () => void
}

// Checkbox accesible propio en vez de <input type="checkbox"> con
// className de color pisado por encima. role="checkbox" +
// aria-checked + soporte de teclado (Enter/Espacio) para que siga
// siendo un checkbox real para lectores de pantalla, solo que
// dibujado a mano para que combine con el resto del diseño.
export function PermissionToggle({ label, checked, onToggle }: Props) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onToggle()
        }
      }}
      className={cn(
        "flex min-w-0 cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors",
        checked ? "bg-gray-500/10" : "hover:bg-white/4",
      )}
    >
      <span
        className={cn(
          "flex size-4.5 shrink-0 items-center justify-center rounded-md border transition-colors",
          checked
            ? "border-cyan-500 bg-cyan-500"
            : "border-white/15 bg-white/4",
        )}
      >
        {checked && <Check size={11} strokeWidth={3} className="text-black" />}
      </span>

      <span
        className={cn(
          "min-w-0 truncate text-sm transition-colors",
          checked ? "text-neutral-100" : "text-neutral-400",
        )}
      >
        {label}
      </span>
    </div>
  )
}
