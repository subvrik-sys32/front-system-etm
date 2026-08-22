"use client"

import type { ReactNode } from "react"

import { cn } from "@/shared/utils/utils"

type ChatAvatarTone = "muted" | "inverse"

type ChatAvatarSize = "sm" | "md"

type ChatAvatarProps = {
  /** URL de foto. Si falta, se usa `fallback`. */
  src?: string | null
  alt?: string
  /** Contenido cuando no hay foto (icono Lucide o inicial). */
  fallback?: ReactNode
  /** muted = fondo bg-muted; inverse = bg-foreground (mensajes propios). */
  tone?: ChatAvatarTone
  size?: ChatAvatarSize
  className?: string
}

const SIZE: Record<ChatAvatarSize, string> = {
  sm: "size-7",
  md: "size-9",
}

/**
 * Avatar circular estándar del sistema de chat.
 *
 * Contrato anti-sierra (sin trucos):
 * 1. `overflow-hidden` + `rounded-full` — el browser clipea el bitmap.
 * 2. **Sin** `shadow-*` en el círculo — la sombra en el borde es la causa
 *    típica de aliasing (“dientes de sierra”) en retina.
 * 3. `img` a `size-full object-cover` dentro del clip — no escalar fuera.
 *
 * Mismo patrón que sidebar-profile (sin shadow-xs exterior).
 */
export function ChatAvatar({
  src,
  alt = "",
  fallback,
  tone = "muted",
  size = "md",
  className,
}: ChatAvatarProps) {
  return (
    <div
      className={cn(
        SIZE[size],
        "shrink-0 overflow-hidden rounded-full",
        tone === "inverse"
          ? "bg-foreground text-background"
          : "bg-muted text-foreground",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          draggable={false}
        />
      ) : (
        <span className="flex size-full items-center justify-center">
          {fallback}
        </span>
      )}
    </div>
  )
}
