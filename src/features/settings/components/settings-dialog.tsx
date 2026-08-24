"use client"

import { useState } from "react"
import {
  FileStack,
  ListOrdered,
  Palette,
  Settings2,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormDialogHeader } from "@/shared/ui/dialogs/form-dialog/form-dialog-header"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { ThemeToggle } from "@/shared/theme"
import { FilesPreferencesSection } from "@/features/user-preferences"
import { ListPreferencesSection } from "@/features/settings/components/list-preferences-section"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { cn } from "@/shared/utils/utils"

type SectionId = "account" | "appearance" | "lists" | "files"

const SECTIONS: {
  id: SectionId
  label: string
  icon: LucideIcon
  group?: string
}[] = [
  { id: "account", label: "Cuenta", icon: UserRound, group: "General" },
  { id: "appearance", label: "Apariencia", icon: Palette, group: "General" },
  { id: "lists", label: "Listas", icon: ListOrdered, group: "General" },
  { id: "files", label: "Archivos", icon: FileStack, group: "General" },
]

type Props = {
  open: boolean
  onClose: () => void
}

/**
 * Ajustes = dialog (no página suelta).
 * Mobile: shell tipo FormDialog (header + scroll a pantalla).
 * Desktop: rail izquierdo + panel (patrón tipo Grok / VS Code).
 */
export function SettingsDialog({ open, onClose }: Props) {
  const { isMobile } = useResponsive()
  const user = useAuthStore(s => s.user)
  const [section, setSection] = useState<SectionId>("appearance")

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) onClose()
      }}
    >
      <DialogContent
        size="large"
        className={cn(
          "flex flex-col gap-0 overflow-hidden rounded-2xl border-none p-0 text-foreground shadow-xs [&>button]:hidden",
          isMobile
            ? "max-h-dvh h-[100dvh] w-full max-w-full rounded-none bg-popover"
            : "h-[min(85vh,640px)] w-full max-w-3xl bg-popover",
        )}
      >
        {isMobile ? (
          <>
            <div className="shrink-0">
              <FormDialogHeader title="Ajustes" icon={Settings2} />
            </div>
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border/50 px-3 py-2 [scrollbar-width:none]">
              {SECTIONS.map(s => {
                const Icon = s.icon
                const active = section === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      active
                        ? "bg-foreground/15 text-foreground"
                        : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground",
                    )}
                  >
                    <Icon size={14} strokeWidth={2.2} />
                    {s.label}
                  </button>
                )
              })}
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="px-4 py-4">
                  <SectionBody section={section} user={user} />
                </div>
              </ScrollArea>
            </div>
            <div className="shrink-0 border-t border-border/50 px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-foreground/10 py-2.5 text-sm font-semibold text-foreground"
              >
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <div className="flex min-h-0 flex-1">
            <aside className="flex w-48 shrink-0 flex-col gap-1 border-r border-border/50 bg-muted/20 p-3">
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                General
              </p>
              {SECTIONS.map(s => {
                const Icon = s.icon
                const active = section === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSection(s.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition",
                      active
                        ? "bg-foreground/12 text-foreground"
                        : "text-muted-foreground hover:bg-foreground/6 hover:text-foreground",
                    )}
                  >
                    <Icon size={16} strokeWidth={2.2} className="shrink-0" />
                    {s.label}
                  </button>
                )
              })}
            </aside>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {SECTIONS.find(s => s.id === section)?.label}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
                >
                  Cerrar
                </button>
              </div>
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full w-full">
                  <div className="px-5 py-4">
                    <SectionBody section={section} user={user} />
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SectionBody({
  section,
  user,
}: {
  section: SectionId
  user: { name?: string; email?: string; avatarUrl?: string | null } | null
}) {
  if (section === "account") {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xs font-semibold text-foreground">Perfil</h3>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Datos de la sesión actual
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 dark:bg-muted/40">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground/10 text-xs font-semibold">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                (user?.name?.[0] ?? "?").toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {user?.name ?? "Usuario"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Edita nombre y foto desde{" "}
            <span className="font-medium text-foreground">Mi perfil</span> en la
            barra lateral.
          </p>
        </section>
      </div>
    )
  }

  if (section === "appearance") {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xs font-semibold text-foreground">Tema</h3>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Tema de la interfaz. En móvil reemplaza el toggle del drawer.
            </p>
          </div>
          <ThemeToggle />
        </section>
      </div>
    )
  }

  if (section === "lists") {
    return <ListPreferencesSection />
  }

  return <FilesPreferencesSection />
}