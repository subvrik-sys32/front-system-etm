"use client"

import type { RefObject } from "react"
import { useState, useEffect, useRef } from "react"
import {
  Camera,
  Mail,
  Phone,
  Briefcase,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { useAuthStore } from "@/features/auth/store/auth-store"

type Props = {
  onEdit: () => void
  contentRef?: RefObject<HTMLDivElement | null>
}

export function ProfilePreviewPanel({
  onEdit,
  contentRef,
}: Props) {
  const user = useAuthStore((s) => s.user)
  const containerRef = useRef<HTMLDivElement>(null)

  const [copied, setCopied] = useState<string | null>(null)
  const [isTouched, setIsTouched] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsTouched(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
      setIsTouched(false)
    }
  }, [])

  const copyValue = async (value: string | null, key: string) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => {
      setCopied(null)
    }, 1200)
  }

  const handleAvatarClick = (e: React.MouseEvent) => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches

    if (isTouchDevice && !isTouched) {
      e.preventDefault()
      setIsTouched(true)
      return
    }

    setIsTouched(false)
    onEdit()
  }

  return (
    <div
      ref={contentRef}
      // Se blinda el contenedor principal
      className="w-full shrink-0 px-4 py-4"
    >
      <div ref={containerRef} className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleAvatarClick}
          className="group relative size-16 shrink-0 outline-none"
        >
          <div className="size-16 overflow-hidden rounded-full">
            <div className="flex size-full items-center justify-center bg-linear-to-br from-white/10 to-foreground/5 text-xl font-semibold text-foreground shadow-inner">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="size-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() ?? "?"
              )}
            </div>
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-[2px] opacity-0 transition-opacity duration-200 tablet:group-hover:opacity-100",
                isTouched && "opacity-100",
              )}
            >
              <Camera size={18} className="text-foreground" />
            </div>
          </div>
        </button>

        <span className="mt-2.5 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-medium text-green-700 dark:text-green-400">
          <span className="size-2 rounded-full bg-green-400" />
          En línea
        </span>
      </div>

      <div className="mt-3 w-full space-y-1">
        <ProfileRow
          icon={<Mail size={13} />}
          value={user?.email}
          placeholder="Sin correo registrado"
          copied={copied === "email"}
          onCopy={user?.email ? () => copyValue(user.email, "email") : undefined}
        />
        <ProfileRow
          icon={<Phone size={13} />}
          value={user?.phone}
          placeholder="Sin teléfono registrado"
          copied={copied === "phone"}
          onCopy={user?.phone ? () => copyValue(user.phone, "phone") : undefined}
        />
        <ProfileRow
          icon={<Briefcase size={13} />}
          value={user?.position}
          placeholder="Sin cargo registrado"
        />
      </div>

      <div className="mt-3 w-full">
        <button
          type="button"
          onClick={onEdit}
          className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-xs text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
        >
          <span className="truncate">Configuración del perfil</span>
          <ChevronRight size={14} className="shrink-0" />
        </button>
      </div>
    </div>
  )
}

function ProfileRow({
  icon,
  value,
  placeholder,
  copied,
  onCopy,
}: {
  icon: React.ReactNode
  value?: string | null
  placeholder: string
  copied?: boolean
  onCopy?: () => void
}) {
  const hasValue = !!value?.trim()

  return (
    <div className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-foreground/5">
      {/* Icono bloqueado */}
      <span className="shrink-0 text-muted-foreground">
        {icon}
      </span>

      {/* Texto fluido */}
      <p
        className={cn(
          "min-w-0 flex-1 truncate text-xs",
          hasValue ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {hasValue ? value : placeholder}
      </p>

      {/* Botón de acción bloqueado */}
      {onCopy && hasValue && (
        <button
          type="button"
          onClick={onCopy}
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
          title="Copiar"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      )}
    </div>
  )
}