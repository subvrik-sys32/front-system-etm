"use client"

import { useEffect, useState, type RefObject } from "react"
import { useRouter } from "next/navigation"
import { User, LogOut, Settings2 } from "lucide-react"

import { useAuthStore } from "@/features/auth/store/auth-store"
import { useOverlayStore } from "@/shared/stores/overlay-store"
import { ProfilePreviewPanel } from "@/features/profile"
import { ProfileMentionBadge } from "@/features/notifications/components/profile-mention-badge"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { cn } from "@/shared/utils/utils"

type SidebarProfileProps = {
  collapsed?: boolean
  onEditProfile: () => void
  onOpenPreferences?: () => void
  profileOpen: boolean
  setProfileOpen: (open: boolean) => void
  toggleProfile: () => void
  canOpenProfile: boolean
  panelHeight: number
  containerRef: RefObject<HTMLDivElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  cardRef: RefObject<HTMLDivElement | null>
}

const OVERLAP = 24

export function SidebarProfile({
  collapsed,
  onEditProfile,
  onOpenPreferences,
  profileOpen,
  setProfileOpen,
  toggleProfile,
  canOpenProfile,
  panelHeight,
  containerRef,
  panelRef,
  contentRef,
  cardRef,
}: SidebarProfileProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const confirmLogout = () => {
    logout()
    router.replace("/login")
  }

  const handleLogoutClick = () => {
    setProfileOpen(false)
    useOverlayStore.getState().close()
    setLogoutOpen(true)
  }

  const avatar = (
    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-white/10 to-foreground/5 text-sm font-semibold text-foreground shadow-inner">
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        user?.name?.[0]?.toUpperCase() ?? "?"
      )}
    </div>
  )

  const logoutDialog = (
    <ActionDialog
      open={logoutOpen}
      variant="danger"
      title="Cerrar sesión"
      description="¿Estás seguro de que deseas cerrar tu sesión actual?"
      cancelLabel="Cancelar"
      confirmLabel="Cerrar sesión"
      onClose={() => setLogoutOpen(false)}
      onConfirm={confirmLogout}
    />
  )

  if (collapsed) {
    return (
      <>
        <div 
          ref={containerRef} 
          className="flex w-full shrink-0 flex-col items-center p-2.5 gap-2"
        >
          <Popover open={profileOpen} onOpenChange={setProfileOpen} modal={false}>
            <PopoverTrigger asChild>
              <button
                onClick={toggleProfile}
                disabled={!canOpenProfile}
                className={cn(
                  "relative size-9 shrink-0 rounded-full transition-transform hover:scale-105",
                  !canOpenProfile && "cursor-not-allowed opacity-60",
                )}
                aria-label="Mi perfil"
              >
                {avatar}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
                <ProfileMentionBadge className="absolute -top-1 -right-1" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="end"
              sideOffset={12}
              className="w-72 border-none p-0 shadow-xl"
            >
              <div ref={panelRef} className="overflow-hidden rounded-xl">
                <div ref={contentRef}>
                  <ProfilePreviewPanel
                    contentRef={contentRef}
                    onEdit={() => {
                      setProfileOpen(false)
                      onEditProfile()
                    }}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Botón Salir colapsado con idéntico contenedor y estilo que el de la versión expandida */}
          <div className="flex h-8 w-full items-center justify-center p-1 bg-sidebar-accent/30 rounded-lg backdrop-blur-sm">
            <button
              type="button"
              onClick={handleLogoutClick}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="flex h-full w-full items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
        {logoutDialog}
      </>
    )
  }

  return (
    <>
      <div ref={containerRef} className="relative w-full shrink-0">
        <div
          aria-hidden={!profileOpen}
          className={cn(
            "absolute inset-x-0 bottom-full z-0 overflow-hidden rounded-xl bg-popover shadow-xl",
            "transition-opacity duration-150 ease-out",
            profileOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          style={{
            height: panelHeight + OVERLAP + 30,
            transform: `translateY(${profileOpen ? OVERLAP : OVERLAP + 16}px)`,
          }}
        >
          <div
            ref={panelRef}
            className="absolute inset-x-0 bottom-0 overflow-hidden"
            style={{ height: panelHeight + OVERLAP + 30 }}
          >
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
          className="relative z-10 w-full overflow-hidden rounded-xl border-0 bg-card p-2.5 shadow-xs"
        >
          <div className="flex w-full items-center gap-2.5">
            <div className="relative size-9 shrink-0">
              {avatar}
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            
            <div className="min-w-0 flex-1">
              {user ? (
                <>
                  <p className="block w-full truncate text-sm font-semibold leading-tight text-foreground">
                    {user.name}
                  </p>
                  <p className="block w-full truncate text-[11px] leading-tight text-muted-foreground">
                    {user.email}
                  </p>
                </>
              ) : (
                <div className="space-y-1">
                  <div className="h-3 w-24 animate-pulse rounded bg-foreground/5" />
                  <div className="h-2.5 w-32 animate-pulse rounded bg-foreground/5" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex h-8 items-center gap-1.5 p-1 bg-sidebar-accent/30 rounded-lg backdrop-blur-sm">
            <button
              type="button"
              onClick={toggleProfile}
              disabled={!canOpenProfile}
              className={cn(
                "flex h-full flex-1 items-center justify-center gap-2 truncate rounded-md px-2 text-xs font-medium transition-all duration-200",
                canOpenProfile
                  ? "bg-sidebar-accent/50 hover:bg-sidebar-accent text-foreground"
                  : "cursor-not-allowed text-muted-foreground/70",
              )}
            >
              <User size={13} className="text-muted-foreground shrink-0" />
              <span className="truncate">Mi perfil</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false)
                onOpenPreferences?.()
              }}
              title="Ajustes"
              aria-label="Ajustes"
              className="flex h-full w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-foreground"
            >
              <Settings2 size={14} />
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="flex h-full w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
      {logoutDialog}
    </>
  )
}