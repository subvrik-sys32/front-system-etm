"use client"

import { useState } from "react"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { ProfileDialog } from "@/features/profile"
import { NotificationBell } from "@/features/notifications/components/notification-bell"
import { usePageTitleStore } from "@/shared/responsive/navigation/page-title-store"
import { cn } from "@/shared/utils/utils"

export function TopBar() {
  const title = usePageTitleStore(s => s.title)
  const user = useAuthStore(s => s.user)
  const [profileOpen, setProfileOpen] = useState(false)

  const avatar = (
    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-white/10 to-white/3 text-xs font-semibold text-white ring-1 ring-white/10">
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        user?.name?.[0]?.toUpperCase() ?? "?"
      )}
    </div>
  )

  return (
    <>
      <header 
        className={cn(
          "flex h-14 shrink-0 items-center gap-3 px-4",
          "bg-[#050505]/80 backdrop-blur-md",
          "transition-all duration-300"
        )}
      >
        {/* Notificaciones movidas a la izquierda (Premium feel) */}
        <div className="flex size-9 items-center justify-center">
          <NotificationBell variant="topbar" />
        </div>

        {/* Título centrado visualmente o con más espacio */}
        <span className="flex-1 text-sm font-medium tracking-tight text-neutral-200">
          {title}
        </span>

        {/* Perfil */}
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          aria-label="Perfil"
          disabled={!user}
          className="group flex size-9 shrink-0 items-center justify-center rounded-full transition hover:bg-white/5 active:scale-95 disabled:opacity-50"
        >
          <div className="relative size-8 shrink-0">
            {user ? (
              avatar
            ) : (
              <div className="size-8 animate-pulse rounded-full bg-white/5" />
            )}
          </div>
        </button>
      </header>

      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}