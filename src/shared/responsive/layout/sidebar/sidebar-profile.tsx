"use client"

import { useEffect, useState, type RefObject } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

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
        {/* Usamos p-2.5 idéntico al card expandido */}
        <div 
          ref={containerRef} 
          className="flex w-full shrink-0 flex-col items-center p-2.5"
        >
          <Popover open={profileOpen} onOpenChange={setProfileOpen} modal={false}>
            <PopoverTrigger asChild>
              <button
                onClick={toggleProfile}
                disabled={!canOpenProfile}
                className={cn(
                  "relative size-9 shrink-0 rounded-full",
                  !canOpenProfile && "cursor-not-allowed opacity-60",
                )}
                aria-label="Mi perfil"
              >
                {avatar}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <ProfileMentionBadge className="absolute -top-1 -right-1" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="end"
              sideOffset={12}
              className="w-72 border-none p-0"
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

          {/* Forzamos contenedor h-8 y mt-2 para igualar el estado expandido */}
          <div className="mt-2 flex h-8 w-full shrink-0 items-center justify-center">
            <button
              onClick={handleLogoutClick}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
              aria-label="Cerrar sesión"
            >
              <LogOut className="size-4" />
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
            "absolute inset-x-0 bottom-full z-0 overflow-hidden rounded-xl bg-popover",
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

        {/* Usamos p-2.5 idéntico al contenedor colapsado */}
        <div
          ref={cardRef}
          className="relative z-10 w-full overflow-hidden rounded-xl border-0 bg-card p-2.5 shadow-xs"
        >
          <div className="flex w-full items-center gap-2.5">
            <div className="relative size-9 shrink-0">
              {avatar}
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500" />
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

          {/* Forzamos h-8 y flex h-full en los botones para igualar alturas */}
          <div className="mt-2 flex h-8 w-full shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={toggleProfile}
              disabled={!canOpenProfile}
              className={cn(
                "flex h-full flex-1 items-center justify-center truncate rounded-md px-2 text-xs transition",
                canOpenProfile
                  ? "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  : "cursor-not-allowed text-muted-foreground/70",
              )}
            >
              Mi perfil
            </button>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex h-full shrink-0 items-center justify-center rounded-md px-2 text-xs text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
      {logoutDialog}
    </>
  )
}