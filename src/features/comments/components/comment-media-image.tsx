"use client"

import { useState } from "react"
import { Spinner } from "@/shared/ui/spinner/spinner"
import { cn } from "@/shared/utils/utils"

type Props = {
  src: string
  alt: string
  className?: string
}

export function CommentMediaImage({ src, alt, className }: Props) {
  const [ready, setReady] = useState(false)

  return (
    <span className={cn("relative block overflow-hidden bg-muted", className)}>
      {!ready && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={18} />
        </span>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
        className={cn(
          "h-full w-full object-cover",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  )
}
