"use client"

import { cn } from "@/shared/utils/utils"

import type { Role } from "../types/role.types"

type Props =
  | {
      loading: true
      opacity?: number
      role?: undefined
      selected?: boolean
      onSelect?: () => void
    }
  | {
      loading?: false
      opacity?: number
      role: Role
      selected: boolean
      onSelect: () => void
    }

function RoleDesktopRowPulse({ opacity = 1 }: { opacity?: number }) {
  return (
    <div
      className="flex w-full animate-pulse items-center justify-between gap-3 px-3 py-2.5"
      style={{ opacity }}
      aria-hidden
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="size-2.5 shrink-0 rounded-full bg-foreground/10" />
        <span className="h-4 w-28 rounded bg-foreground/10" />
      </div>
    </div>
  )
}

export function RoleDesktopRow(props: Props) {
  if (props.loading) {
    return <RoleDesktopRowPulse opacity={props.opacity} />
  }

  const { role, selected, onSelect } = props

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        selected
          ? "bg-foreground/10 text-foreground"
          : "hover:bg-foreground/5 text-muted-foreground"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: role.color || "#71717a" }}
        />
        <span className="truncate text-sm font-medium">
          {role.name}
        </span>
      </div>

      {!role.active && (
        <span className="shrink-0 text-xs text-muted-foreground">Inactivo</span>
      )}
    </button>
  )
}
