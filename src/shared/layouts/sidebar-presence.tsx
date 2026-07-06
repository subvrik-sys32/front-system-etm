"use client"

import { useMemo } from "react"

import { useAuthStore } from "@/features/auth/store/auth-store"
import { useUsersDirectory } from "@/features/users/hooks/use-users-directory"

const MAX_LIST_HEIGHT = 168

type Props = {

  collapsed?: boolean

  presenceRef?: (node: HTMLDivElement | null) => void
}

export function SidebarPresence({
  collapsed = false,
  presenceRef,
}: Props) {

  const currentUser =
    useAuthStore(s => s.user)

  const {
    users,
  } = useUsersDirectory()

  const onlineUsers = useMemo(
    () =>
      users
        .filter(user =>
          user.online &&
          user.id !== currentUser?.id,
        )
        .sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
    [users, currentUser?.id],
  )

  const hasOnlineUsers =
    onlineUsers.length > 0

  if (!currentUser) {

    return (

      <div className="border-t border-white/5 px-3 py-3">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
            En línea
          </span>

        </div>

        <div className="space-y-1.5">

          <div className="flex items-center gap-2 rounded-xl bg-white/3 px-2.5 py-2">
            <div className="h-5 w-5 shrink-0 rounded-full bg-white/5 animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-white/5 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/3 px-2.5 py-2">
            <div className="h-5 w-5 shrink-0 rounded-full bg-white/5 animate-pulse" />
            <div className="h-2.5 w-16 rounded bg-white/5 animate-pulse" />
          </div>

        </div>

      </div>

    )

  }

  if (collapsed || !hasOnlineUsers) {
    return null
  }

  return (

    <div ref={presenceRef} className="select-none px-3 py-3">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
          En línea
        </span>

        <span className="flex h-5 min-w-5 items-center justify-center rounded-lg bg-white/5 px-1.5 text-[11px] font-semibold text-neutral-400">
          {onlineUsers.length}
        </span>

      </div>

      <div
        className="erp-scrollbar space-y-1 overflow-y-auto pr-1"
        style={{ maxHeight: MAX_LIST_HEIGHT }}
      >

        {onlineUsers.map(user => (

          <div
            key={user.id}
            className="flex items-center gap-2 rounded-xl bg-white/3 px-2.5 py-2 transition-all duration-200 hover:bg-white/6"
          >

            <div className="relative h-5 w-5 shrink-0">

              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white/8 text-[10px] font-semibold text-white">

                {user.avatarUrl ? (

                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />

                ) : (

                  user.name[0]?.toUpperCase() ?? "?"

                )}

              </div>

              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0A0A]"
              />

            </div>

            <span className="truncate text-xs font-medium text-neutral-300">
              {user.name}
            </span>

          </div>

        ))}

      </div>

    </div>

  )

}