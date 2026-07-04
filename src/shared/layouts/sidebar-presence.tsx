"use client"

import { useMemo } from "react"

import { useAuthStore } from "@/features/auth/store/auth-store"
import { useUsersDirectory } from "@/features/users/hooks/use-users-directory"
import { cn } from "@/shared/utils/utils"

// Altura máxima del bloque de presencia antes de activar scroll interno.
// Ajusta este valor si quieres mostrar más o menos filas antes de scrollear.
const MAX_LIST_HEIGHT = 168

export function SidebarPresence() {

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

  // Mientras no haya un usuario actual resuelto (carga inicial o
  // logout en curso), no sabemos a quién excluir de la lista.
  // Mostrar un skeleton evita el parpadeo de vernos a nosotros mismos.
  if (!currentUser) {

    return (

      <div className="border-t border-white/5 px-3 py-3">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
            En línea
          </span>

        </div>

        <div className="space-y-1.5">

          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-5 w-5 shrink-0 rounded-full bg-white/5 animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-white/5 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-5 w-5 shrink-0 rounded-full bg-white/5 animate-pulse" />
            <div className="h-2.5 w-16 rounded bg-white/5 animate-pulse" />
          </div>

        </div>

      </div>

    )

  }

  return (

    <div className="border-t border-white/5 select-none px-3 py-3">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
          En línea
        </span>

        {hasOnlineUsers && (

          <span className="flex h-5 min-w-5 items-center justify-center rounded-lg bg-white/5 px-1.5 text-[11px] font-semibold text-neutral-400">
            {onlineUsers.length}
          </span>

        )}

      </div>

      {hasOnlineUsers ? (

        <div
          className="erp-scrollbar space-y-0.5 overflow-y-auto pr-1"
          style={{ maxHeight: MAX_LIST_HEIGHT }}
        >

          {onlineUsers.map(user => (

            <div
              key={user.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/4"
            >

              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-[10px] font-semibold text-white">

                {user.name[0]?.toUpperCase() ?? "?"}

                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0A0A]"
                />

              </span>

              <span className="truncate text-xs font-medium text-neutral-300">
                {user.name}
              </span>

            </div>

          ))}

        </div>

      ) : (

        <div className="flex items-center gap-2 px-2 py-1.5">

          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-neutral-600"
          />

          <span className="text-xs text-neutral-500">
            No hay nadie más en línea
          </span>

        </div>

      )}

    </div>

  )

}