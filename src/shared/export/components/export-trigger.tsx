"use client"

import{
  forwardRef,
}from"react"

import{
  Download,
}from"lucide-react"

import{
  cn,
}from"@/shared/utils/utils"

type Props=
  React.ButtonHTMLAttributes<
    HTMLButtonElement
  > & {
    active?:boolean
  }

export const ExportTrigger=
  forwardRef<
    HTMLButtonElement,
    Props
  >(
    (
      {
        className,
        active=false,
        ...props
      },
      ref,
    )=>(

      <button
        ref={ref}
        type="button"
        className="flex"
        {...props}
      >

        <div
          className={cn(
            "flex h-8 items-center gap-2 rounded-xl px-2 text-white transition-colors hover:bg-[#101012]",
            active && "bg-[#101012]",
            className,
          )}
        >

          <Download
            size={14}
            strokeWidth={2}
            className="shrink-0"
          />

          <span className="whitespace-nowrap text-xs font-semibold select-none uppercase tracking-[0.08em]">

            EXPORTAR

          </span>

        </div>

      </button>

    ),
  )

ExportTrigger.displayName=
  "ExportTrigger"