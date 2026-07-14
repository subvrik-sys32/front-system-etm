"use client"

import { Bell, Menu } from "lucide-react"
import { useState } from "react"

import { useAuthStore } from "@/features/auth/store/auth-store"
import { ProfileDialog } from "@/features/profile"
import { usePageTitleStore } from "@/shared/responsive/navigation/page-title-store"
import { useMobileNavStore } from "@/shared/responsive/navigation/mobile-nav-store"

export function TopBar() {

  const toggleDrawer = useMobileNavStore(s => s.toggleDrawer)
  const title = usePageTitleStore(s => s.title)

  const user = useAuthStore(s => s.user)

  const [profileOpen, setProfileOpen] = useState(false)

  const avatar = (
    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-white/10 to-white/3 text-xs font-semibold text-white">
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="h-full w-full object-cover"
        />
      ) : (
        user?.name?.[0]?.toUpperCase() ?? "?"
      )}
    </div>
  )

  return (

    <>

      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-white/5 px-2">

        <button
          type="button"
          onClick={toggleDrawer}
          aria-label="Abrir navegación"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-300 transition hover:bg-white/5 active:bg-white/10"
        >
          <Menu size={18} strokeWidth={2.2} />
        </button>

        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-100">
          {title}
        </span>

        {/*
          Notificaciones: trigger sin panel todavía — el panel
          "pantalla completa" en mobile es Sprint 14 de la spec.
          No conecto ProfileMentionBadge acá porque es un dato de
          menciones de perfil, no un contador general de notificaciones;
          mezclarlos sería incorrecto semánticamente.
        */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex size-9 shrink-0 items-center justify-center rounded-lg text-neutral-300 transition hover:bg-white/5 active:bg-white/10"
        >
          <Bell size={17} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          aria-label="Perfil"
          disabled={!user}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/5 active:bg-white/10 disabled:opacity-50"
        >
          <div className="relative size-7 shrink-0">
            {user ? (
              avatar
            ) : (
              <div className="size-7 animate-pulse rounded-full bg-white/5" />
            )}
          </div>
        </button>

      </header>

      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />

    </>

  )

}