"use client"

import { ChevronRight } from "lucide-react"

type Props = {
  expanded: boolean
  onClick?: () => void
}

export function ExpandCell({
  expanded,
  onClick,
}: Props) {

  return (

    <button

      onClick={onClick}

      className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-200"

    >

      <ChevronRight

        size={18}

        className={
          expanded
            ? "rotate-90 transition-transform"
            : "transition-transform"
        }

      />

    </button>

  )

}