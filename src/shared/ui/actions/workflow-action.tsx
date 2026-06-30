"use client"

import {
  Check,
  Pause,
  Play,
  Search,
} from "lucide-react"

import {
  cn,
} from "@/shared/utils/utils"

type Props = {
  label: string
  variant?:
    | "start"
    | "pause"
    | "complete"
    | "review"
  onClick: () => void
  iconOnly?: boolean
}

export function WorkflowAction({
  label,
  variant = "start",
  onClick,
  iconOnly = false,
}: Props) {

  const config =
    variant === "start"
      ? {
          icon: Play,
          iconClass: "text-neutral-300",
        }
      : variant === "pause"
        ? {
            icon: Pause,
            iconClass: "text-amber-300",
          }
        : variant === "complete"
          ? {
              icon: Check,
              iconClass: "text-emerald-300",
            }
          : {
              icon: Search,
              iconClass: "text-sky-300",
            }

  const Icon =
    config.icon

  return (

    <button
      type="button"
      onClick={onClick}
      onMouseDown={event =>
        event.preventDefault()
      }
      title={label}
      className={cn(
        "flex h-8 items-center justify-center",
        "rounded-lg",
        "bg-white/4",
        iconOnly
          ? "w-10 px-0"
          : "min-w-30 gap-2 px-3",
        "text-xs font-semibold",
        "text-neutral-200",
        "transition-all duration-150",
        "hover:bg-white/8",
        "active:bg-white/12",
        "select-none"
      )}
    >

      <Icon
        size={14}
        strokeWidth={2.4}
        className={cn(
          config.iconClass,
          "shrink-0"
        )}
      />

      {!iconOnly && (

        <span className="min-w-0 truncate select-none">

          {label}

        </span>

      )}

    </button>

  )

}