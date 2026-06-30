"use client"

import type {
  LucideIcon,
} from "lucide-react"

type Props = {
  label: string

  icon?: LucideIcon

  onClick: () => void
}

export function PrimaryAction({
  label,
  icon: Icon,
  onClick,
}: Props) {

  return (

    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-neutral-200"
    >

      {Icon && (

        <Icon
          size={16}
          strokeWidth={2.5}
        />

      )}

      {label}

    </button>

  )

}