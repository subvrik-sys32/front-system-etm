"use client"

import type { RefObject } from "react"

import { useRouter } from "next/navigation"

import { useAuthStore } from "@/features/auth/store/auth-store"
import { ProfilePreviewPanel } from "@/features/profile"

import { cn } from "@/shared/utils/utils"

type SidebarProfileProps = {
  onEditProfile: () => void

  profileOpen: boolean
  setProfileOpen: (open: boolean) => void
  toggleProfile: () => void
  canOpenProfile: boolean

  containerRef: RefObject<HTMLDivElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  cardRef: RefObject<HTMLDivElement | null>
}

export function SidebarProfile({
  onEditProfile,
  profileOpen,
  setProfileOpen,
  toggleProfile,
  canOpenProfile,
  containerRef,
  panelRef,
  contentRef,
  cardRef,
}: SidebarProfileProps) {

  const router = useRouter()

  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)

  return (

    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl bg-white/3 transition-colors duration-200 hover:bg-white/6"
    >

      <div
        ref={panelRef}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
          profileOpen
            ? "grid-rows-[1fr]"
            : "grid-rows-[0fr]",
        )}
      >

        <div className="min-h-0">

          <ProfilePreviewPanel
            contentRef={contentRef}
            onEdit={() => {

              setProfileOpen(false)

              onEditProfile()

            }}
          />

        </div>

      </div>

      <div
        ref={cardRef}
        className={cn(
          "px-3 py-3",
          profileOpen && "border-t border-white/5",
        )}
      >

        <div className="flex items-center justify-between gap-2">

          <div className="flex min-w-0 items-center gap-2.5">

            <div className="relative h-9 w-9 shrink-0">

              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-white/10 to-white/3 text-sm font-semibold text-white shadow-inner">

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

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#0A0A0A]" />

            </div>

            {user ? (

              <p className="truncate text-sm font-semibold leading-tight text-white">
                {user.name}
              </p>

            ) : (

              <div className="h-3 w-28 animate-pulse rounded bg-white/5" />

            )}

          </div>

          <button
            onClick={toggleProfile}
            disabled={!canOpenProfile}
            className={cn(
              "shrink-0 rounded-md px-2 py-1 text-xs transition",
              canOpenProfile
                ? "text-neutral-400 hover:bg-white/5 hover:text-white"
                : "cursor-not-allowed text-neutral-700",
            )}
          >
            Mi perfil
          </button>

        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2">

          {user ? (

            <p className="min-w-0 truncate text-xs text-neutral-500">
              {user.email}
            </p>

          ) : (

            <div className="h-2 w-20 animate-pulse rounded bg-white/5" />

          )}

          <button
            onClick={() => {

              logout()

              requestAnimationFrame(() => {

                router.replace("/login")

              })

            }}
            className="shrink-0 rounded-md px-2 py-1 text-xs text-neutral-400 transition hover:bg-white/5 hover:text-white"
          >
            Salir
          </button>

        </div>

      </div>

    </div>

  )

}