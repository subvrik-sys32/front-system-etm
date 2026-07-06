"use client"

import { useMemo } from "react"

import { useAuthStore } from "@/features/auth/store/auth-store"
import { useUsersDirectory } from "@/features/users/hooks/use-users-directory"

import { SidebarSection } from "./sidebar-section"

const MAX_LIST_HEIGHT = 168

type Props = {
  collapsed?: boolean
}

export function SidebarPresence({
  collapsed = false,
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

  if (collapsed) {
    return null
  }

  return (

    <SidebarSection title="En línea">

      {!currentUser ? (

        <div className="space-y-1.5">

          <div className="flex items-center gap-2 rounded-xl bg-white/3 px-2.5 py-2">

            <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-white/5" />

            <div className="h-2.5 w-20 animate-pulse rounded bg-white/5" />

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/3 px-2.5 py-2">

            <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-white/5" />

            <div className="h-2.5 w-16 animate-pulse rounded bg-white/5" />

          </div>

        </div>

      ) : hasOnlineUsers ? (

        <>

          <div className="mb-2 flex justify-end">

            <span className="flex h-5 min-w-5 items-center justify-center rounded-lg bg-white/5 px-1.5 text-[11px] font-semibold text-neutral-400">

              {onlineUsers.length}

            </span>

          </div>

          <div
            className="erp-scrollbar space-y-1 overflow-y-auto"
            style={{
              maxHeight: MAX_LIST_HEIGHT,
            }}
          >

            {onlineUsers.map(user => (

              <div
                key={user.id}
                className="flex items-center gap-2 rounded-xl bg-white/3 px-2.5 py-2 transition-colors hover:bg-white/6"
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

                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0A0A]" />

                </div>

                <span className="truncate text-xs font-medium text-neutral-300">

                  {user.name}

                </span>

              </div>

            ))}

          </div>

        </>

      ) : (

        <div className="rounded-xl bg-white/3 px-2.5 py-2 text-xs text-neutral-500">

          No hay nadie más en línea

        </div>

      )}

    </SidebarSection>

  )

}