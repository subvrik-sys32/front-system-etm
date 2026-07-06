"use client"

import { useState } from "react"
import { Camera, Mail, Phone, Briefcase, Loader2, ChevronRight } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { useAuthStore } from "@/features/auth/store/auth-store"

type Props = {
  open: boolean
  onEdit: () => void
  onRemoveAvatar?: () => Promise<void> | void
}

export function ProfilePreviewPanel({
  open,
  onEdit,
}: Props) {

  const user = useAuthStore(s => s.user)

  const [removingAvatar] = useState(false)

  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,margin] duration-300 ease-out",
        open
          ? "mb-2 grid-rows-[1fr]"
          : "mb-0 grid-rows-[0fr]",
      )}
    >

      <div className="overflow-hidden">

        <div
          className={cn(
            "rounded-xl bg-white/3 px-4 py-4 transition-[transform] duration-300 ease-out",
            open ? "scale-100" : "scale-[0.985]",
          )}
        >

          {/* AVATAR + BADGE — primero en abrir, último en cerrar */}
          <div
            className={cn(
              "flex flex-col items-center transition-all duration-300 ease-out",
              open
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0",
            )}
            style={{
              transitionDelay: open ? "120ms" : "0ms",
            }}
          >

            <button
              type="button"
              onClick={onEdit}
              className="group relative h-16 w-16 outline-none"
            >

              <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/10">

                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-white/10 to-white/3 text-xl font-semibold text-white shadow-inner">

                  {user?.avatarUrl && !removingAvatar ? (

                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    user?.name?.[0]?.toUpperCase() ?? "?"

                  )}

                </div>

                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
                    removingAvatar ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  )}
                >

                  {removingAvatar ? (

                    <Loader2 size={16} className="animate-spin text-white" />

                  ) : (

                    <Camera size={18} className="text-white" />

                  )}

                </div>

              </div>

              <span className="absolute bottom-0.5 right-0.5 z-20 h-3.5 w-3.5 rounded-full border-2 border-[#0A0A0A] bg-green-400" />

            </button>

            <div className="mt-2.5 flex justify-center">

              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-medium text-green-400">

                <span className="h-2 w-2 rounded-full bg-green-400" />

                En línea

              </span>

            </div>

          </div>

          {/* LISTA — segundo en ambas direcciones */}
          <div
            className={cn(
              "mt-3 space-y-1 transition-all duration-300 ease-out",
              open
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0",
            )}
            style={{
              transitionDelay: open ? "80ms" : "40ms",
            }}
          >

            <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/4">

              <Mail size={13} className="shrink-0 text-neutral-500" />

              <p className="truncate text-xs text-neutral-200">
                {user?.email}
              </p>

            </div>

            <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/4">

              <Phone size={13} className="shrink-0 text-neutral-500" />

              <p className="truncate text-xs text-neutral-200">
                {user?.phone || "Sin teléfono registrado"}
              </p>

            </div>

            <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/4">

              <Briefcase size={13} className="shrink-0 text-neutral-500" />

              <p className="truncate text-xs text-neutral-200">
                {user?.position || "Sin cargo registrado"}
              </p>

            </div>

          </div>

          {/* CONFIGURACIÓN — último en abrir, primero en cerrar */}
          <div
            className={cn(
              "mt-2 pt-2 transition-all duration-300 ease-out",
              open
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0",
            )}
            style={{
              transitionDelay: open ? "40ms" : "80ms",
            }}
          >

            <button
              onClick={onEdit}
              className="flex w-full items-center justify-between rounded-lg px-1.5 py-1.5 text-xs text-neutral-400 transition hover:bg-white/4 hover:text-white"
            >

              <span>
                Configuración del perfil
              </span>

              <ChevronRight size={14} />

            </button>

          </div>

        </div>

      </div>

    </div>

  )

}