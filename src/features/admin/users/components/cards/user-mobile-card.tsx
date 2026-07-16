"use client"

import {
  DynamicBadge,
} from "@/shared/ui/badge/dynamic-badge"

import type {
  User,
} from "@/features/users/types/user.types"

import {
  UserRowActions,
} from "../actions/user-row-actions"

type Props = {
  user: User
  index: number
}

export function UserMobileCard({
  user,
  index,
}: Props) {
  return (
    <article className="overflow-hidden rounded-2xl bg-[#101012]">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-xs font-semibold tracking-[0.12em] text-neutral-500">
          USUARIO {String(index + 1).padStart(3, "0")}
        </span>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400">
          <span
            aria-hidden
            className={
              user.online
                ? "h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]"
                : "h-1.5 w-1.5 rounded-full bg-neutral-600"
            }
          />

          {user.online ? "En línea" : "Desconectado"}
        </span>
      </header>

      <div className="space-y-4 px-4 py-4">
        <div className="flex items-center gap-2">

          <div className="min-w-0 flex-1">
            <DynamicBadge
              label={user.name}
              icon={user.icon}
              color={user.color}
              width="field"
            />
          </div>

          <div className="shrink-0">
            <UserRowActions userId={user.id} />
          </div>

        </div>

        <dl className="space-y-3 text-sm">
          <div className="min-w-0">
            <dt className="mb-1 text-[10px] font-semibold tracking-[0.12em] text-neutral-500">
              USERNAME
            </dt>

            <dd className="truncate text-neutral-200">
              {user.username ?? "Sin username"}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="mb-1 text-[10px] font-semibold tracking-[0.12em] text-neutral-500">
              EMAIL
            </dt>

            <dd className="truncate text-neutral-300">
              {user.email}
            </dd>
          </div>
        </dl>
      </div>

      <footer className="px-4 py-3">
        <DynamicBadge
          label={user.role.name}
          icon={user.role.icon}
          color={user.role.color}
          width="field"
        />
      </footer>
    </article>
  )
}