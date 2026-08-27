"use client"

import { useEffect, useState } from "react"

import { Spinner } from "@/shared/ui/spinner/spinner"
import { cn } from "@/shared/utils/utils"

type Props = {
  src: string
  alt: string
  className?: string
}

/** Preview de chat: siempre 12.8rem × 16rem (4:5), nunca barra fina al cargar. */
const BOX =
  "relative isolate block h-64 w-[12.8rem] max-w-full shrink-0 overflow-hidden rounded-xl bg-muted"

/**
 * Thumbnail: caja de tamaño fijo = máximo del preview.
 * Mientras carga o falla la red: placeholder muted + Spinner (react).
 * Nunca colapsa al ancho del avatar ni a una franja vertical.
 */
export function CommentMediaImage({ src, alt, className }: Props) {
  const [ready, setReady] = useState(false)

  // Nuevo src → volver a estado loading (mismo componente reutilizado en lista).
  useEffect(() => {
    setReady(false)
  }, [src])

  return (
    <span
      className={cn(BOX, className)}
      style={{ minWidth: "min(12.8rem, 100%)", minHeight: "16rem" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-[opacity,filter] duration-200 ease-out",
          ready ? "opacity-100 blur-0" : "scale-105 opacity-30 blur-md",
        )}
      />
      {!ready && (
        <span
          className="absolute inset-0 z-10 flex items-center justify-center bg-muted"
          aria-busy="true"
          aria-label="Cargando imagen"
        >
          <Spinner size={22} />
        </span>
      )}
    </span>
  )
}
