"use client"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { cn } from "@/shared/utils/utils"

import type { User } from "@/features/users/types/user.types"

type Props = {
  user: User
  selected: boolean
  onSelect: () => void
}

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
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span
          aria-hidden
          className={cn(
            "size-2 shrink-0 rounded-full",
            user.online
              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]"
              : "bg-neutral-600"
          )}
        />
        <div className="min-w-0 flex-1">
          <DynamicBadge
            label={user.name}
            icon={user.icon}
            color={user.color}
            width="field"
          />
        </div>
      </div>

      {!user.active && (
        <span className="shrink-0 text-xs text-neutral-500">Inactivo</span>
      )}
    </button>
  )
}