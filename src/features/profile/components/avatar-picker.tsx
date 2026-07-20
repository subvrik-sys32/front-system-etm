"use client"

import { useRef, useState } from "react"

import { Camera, Loader2, Trash2 } from "lucide-react"

import { cn } from "@/shared/utils/utils"

type Props = {

  name: string

  avatarUrl?: string | null

  uploading?: boolean

  compact?: boolean

  onSelect: (file: File) => void

  onRemove?: () => void

}

export function AvatarPicker({
  name,
  avatarUrl,
  uploading,
  compact = false,
  onSelect,
  onRemove,
}: Props) {

  const inputRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] =
    useState<string | null>(null)

  const displayUrl = preview ?? avatarUrl

  const size = compact ? "h-16 w-16" : "h-24 w-24"

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {

    const file = e.target.files?.[0]

    if (!file) return

    const localUrl = URL.createObjectURL(file)

    setPreview(localUrl)

    onSelect(file)

  }

  function handleRemove() {

    setPreview(null)

    onRemove?.()

  }

  return (

    <div className="flex flex-col items-center gap-2">

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 transition",
          size,
        )}
      >

        {displayUrl ? (

          <img
            src={displayUrl}
            alt={name}
            className="h-full w-full object-cover"
          />

        ) : (

          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-white/10 to-white/3 text-lg font-semibold text-white">

            {name?.[0]?.toUpperCase() ?? "?"}

          </div>

        )}

        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-100 transition-opacity duration-150",
            "tablet:opacity-0 tablet:group-hover:opacity-100",
          )}
        >

          {uploading ? (

            <Loader2
              size={18}
              className="animate-spin text-white"
            />

          ) : (

            <Camera size={16} className="text-white" />

          )}

        </div>

      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-[11px] font-medium text-neutral-400 hover:text-white transition"
        >

          Cambiar foto

        </button>

        {displayUrl && onRemove && (

          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1 text-[11px] font-medium text-red-400/80 hover:text-red-400 transition"
          >

            <Trash2 size={11} />

            Eliminar

          </button>

        )}

      </div>

    </div>

  )

}