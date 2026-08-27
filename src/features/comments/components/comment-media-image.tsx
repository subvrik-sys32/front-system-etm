"use client"

import { useState } from "react"

import { Spinner } from "@/shared/ui/spinner/spinner"
import { cn } from "@/shared/utils/utils"

type Props = {
  src: string
  alt: string
  className?: string
}

/**
 * Thumbnail: siempre reserva el tamaño máximo (max-h-64, ratio 4:5).
 * Nunca colapsa al tamaño del avatar mientras carga.
 * Loading: blur + Spinner encima del placeholder muted.
 */
export function CommentMediaImage({ src, alt, className }: Props) {
  const [ready, setReady] = useState(false)

  return (
    <span
      className={cn(
        // Caja fija: 16rem alto × 12.8rem ancho (4:5), acotada al 100% del padre
        "relative isolate block h-64 w-[min(100%,12.8rem)] shrink-0 overflow-hidden rounded-xl bg-muted",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-[opacity,filter] duration-200 ease-out",
          ready ? "opacity-100 blur-0" : "scale-105 opacity-40 blur-md",
        )}
      />
      {!ready && (
        <span
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/25 backdrop-blur-[2px]"
          aria-busy="true"
          aria-label="Cargando imagen"
        >
          <Spinner size={22} />
        </span>
      )}
    </span>
  )
}
