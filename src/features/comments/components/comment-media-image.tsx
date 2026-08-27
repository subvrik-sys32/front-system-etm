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
 * Thumbnail en burbuja: siempre el tamaño máximo permitido.
 * Mientras carga: blur interno + Spinner.
 */
export function CommentMediaImage({ src, alt, className }: Props) {
  const [ready, setReady] = useState(false)

  return (
    <span
      className={cn(
        "relative block w-full max-w-[min(100%,16rem)] overflow-hidden rounded-xl bg-muted",
        "aspect-[4/5] max-h-64",
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
          "h-full w-full object-cover transition-[opacity,filter] duration-200 ease-out",
          ready ? "opacity-100 blur-0" : "scale-105 opacity-50 blur-md",
        )}
      />
      {!ready && (
        <span
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/20 backdrop-blur-[2px]"
          aria-busy="true"
          aria-label="Cargando imagen"
        >
          <Spinner size={22} />
        </span>
      )}
    </span>
  )
}
