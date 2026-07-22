"use client"

import { cn } from "@/shared/utils/utils"

import type { User } from "@/features/users/types/user.types"

type Props = {
  user: User
  selected: boolean
  onSelect: () => void
}

// Fila de usuario en DESKTOP -- calco exacto de RoleDesktopRow (punto
// de color + texto, sin badge), para que Usuarios y Roles luzcan
// idénticos. El punto usa el color del usuario; un anillo claro
// indica que está online, en vez de un segundo punto aparte.
export function UserDesktopRow({ user, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        selected
          ? "bg-white/10 text-white"
          : "hover:bg-white/4 text-neutral-300"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden
          className={cn(
            "size-2.5 shrink-0 rounded-full",
            user.online && "ring-2 ring-emerald-400/50"
          )}
          style={{ backgroundColor: user.color || "#71717a" }}
        />
        <span className="truncate text-sm font-medium">
          {user.name}
        </span>
      </div>

      {!user.active && (
        <span className="shrink-0 text-xs text-neutral-500">Inactivo</span>
      )}
    </button>
  )
}