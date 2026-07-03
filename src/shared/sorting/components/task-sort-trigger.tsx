"use client"

import {
  forwardRef,
} from "react"

import {
  ArrowUpDown,
} from "lucide-react"

import {
  cn,
} from "@/shared/utils/utils"

type Props={
  label:string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const TaskSortTrigger=
  forwardRef<
    HTMLButtonElement,
    Props
  >(
    (
      {
        label,
        className,
        ...props
      },
      ref
    )=>(

      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-8 items-center gap-2 rounded-xl px-2 select-none text-white transition-colors hover:bg-[#101012]",
          className
        )}
        {...props}
      >

        <ArrowUpDown
          size={14}
          strokeWidth={2}
          className="shrink-0"
        />

        <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.08em]">

          {label}

        </span>

      </button>

    )
  )

TaskSortTrigger.displayName=
  "TaskSortTrigger"