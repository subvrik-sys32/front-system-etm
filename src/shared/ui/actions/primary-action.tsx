"use client"

import type { LucideIcon } from "lucide-react"

import { Spinner } from "@/shared/ui/spinner/spinner"
import { cn } from "@/shared/utils/utils"

type Props = {
  label: string
  icon?: LucideIcon
  disabled?: boolean
  isLoading?: boolean
  onClick: () => void
  /** Solo icono (+). label queda como aria/title. */
  iconOnly?: boolean
}

export function PrimaryAction({
  label,
  icon: Icon,
  disabled = false,
  isLoading = false,
  onClick,
  iconOnly = false,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center transition shadow-xs",
        iconOnly
          ? "size-8 rounded-full"
          : "h-8 gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-xs font-semibold",
        disabled
          ? "cursor-not-allowed bg-muted text-muted-foreground/50"
          : cn(
              // Misma familia de color que la burbuja del sidebar
              "bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
              "dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/25",
            ),
        isLoading && "cursor-wait opacity-80",
      )}
    >
      {isLoading ? (
        <Spinner size={14} />
      ) : (
        <>
          {Icon ? <Icon size={14} strokeWidth={2.25} /> : null}
          {!iconOnly && label}
        </>
      )}
    </button>
  )
}