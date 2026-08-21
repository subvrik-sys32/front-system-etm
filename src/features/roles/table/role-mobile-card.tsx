"use client"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"

import type { Role } from "../types/role.types"

type Props =
  | {
      loading: true
      opacity?: number
      role?: undefined
      index?: number
      onSelect?: () => void
    }
  | {
      loading?: false
      opacity?: number
      role: Role
      index: number
      onSelect: () => void
    }

function RoleMobileCardPulse({ opacity = 1 }: { opacity?: number }) {
  return (
    <article
      className="overflow-hidden rounded-xl bg-foreground/5"
      style={{ opacity }}
      aria-hidden
    >
      <div className="w-full text-left">
        <header className="flex animate-pulse items-center justify-between gap-2.5 px-3 py-3">
          <span className="h-4 w-24 rounded bg-foreground/10" />
          <span className="h-4 w-14 rounded bg-foreground/10" />
        </header>
        <div className="flex animate-pulse items-center gap-2.5 px-3 pb-3">
          <div className="min-w-0 flex-1">
            <span className="block h-8 w-full rounded-full bg-foreground/5" />
          </div>
        </div>
      </div>
    </article>
  )
}

export function RoleMobileCard(props: Props) {
  if (props.loading) {
    return <RoleMobileCardPulse opacity={props.opacity} />
  }

  const { role, index, onSelect } = props

  return (
    <article className="overflow-hidden rounded-xl bg-foreground/5">
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left"
      >
        <header className="flex items-center justify-between gap-2.5 px-3 py-3">
          <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">
            ROL {String(index + 1).padStart(3, "0")}
          </span>

          {!role.active && (
            <span className="text-xs font-medium text-muted-foreground">
              Inactivo
            </span>
          )}
        </header>

        <div className="flex items-center gap-2.5 px-3 pb-3">
          <div className="min-w-0 flex-1">
            <DynamicBadge
              label={role.name}
              icon={role.icon}
              color={role.color}
              width="field"
            />
          </div>
        </div>
      </button>
    </article>
  )
}
