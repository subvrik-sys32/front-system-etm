"use client"

import type { RefObject } from "react"

import { useState } from "react"
import { Camera, Mail, Phone, Briefcase, Loader2, ChevronRight } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { useAuthStore } from "@/features/auth/store/auth-store"

type Props = {
  onEdit: () => void
  onRemoveAvatar?: () => Promise<void> | void

  contentRef?: RefObject<HTMLDivElement | null>
}

export function ProfilePreviewPanel({
  onEdit,
  contentRef,
}: Props) {

  const user = useAuthStore(s => s.user)

  const [removingAvatar] = useState(false)

  return (

    <div
      ref={contentRef}
      className="px-4 py-4"
    >

      <div className="flex flex-col items-center">

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

        </button>

        <div className="mt-2.5 flex justify-center">

          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-medium text-green-400">

            <span className="h-2 w-2 rounded-full bg-green-400" />

            En línea

          </span>

        </div>

      </div>

      <div className="mt-1.5 space-y-1">

        <div className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/4">

          <Mail size={13} className="shrink-0 text-neutral-500" />

          <p className="truncate text-xs text-neutral-200">
            {user?.email}
          </p>

        </div>

        <div className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/4">

          <Phone size={13} className="shrink-0 text-neutral-500" />

          <p className="truncate text-xs text-neutral-200">
            {user?.phone || "Sin teléfono registrado"}
          </p>

        </div>

        <div className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-white/4">

          <Briefcase size={13} className="shrink-0 text-neutral-500" />

          <p className="truncate text-xs text-neutral-200">
            {user?.position || "Sin cargo registrado"}
          </p>

        </div>

      </div>

      <div className="mt-2 pt-2">

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

  )

}