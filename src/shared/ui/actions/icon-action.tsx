"use client"

import type {
  LucideIcon,
} from "lucide-react"

import {
  cn,
} from "@/shared/utils/utils"

type Props = {
  icon: LucideIcon

  variant?: "default" | "danger"

  onClick: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void
}

export function IconAction({
  icon: Icon,
  variant = "default",
  onClick,
}: Props) {

  const danger =
    variant === "danger"

  return (

    <button
      type="button"

      onPointerDown={(event) => {

        event.preventDefault()
        event.stopPropagation()

      }}

      onClick={(event) => {

        event.preventDefault()
        event.stopPropagation()

        onClick(event)

      }}

      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition",

        danger
          ? "text-neutral-600 hover:bg-red-500/10 hover:text-red-400"
          : "text-neutral-500 hover:bg-white/10 hover:text-white"
      )}
    >

      <Icon
        size={16}
        strokeWidth={2.4}
      />

    </button>

  )

}