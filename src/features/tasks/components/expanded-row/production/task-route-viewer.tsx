"use client"

import { useRouter } from "next/navigation"

import { PROCESS_ORDER } from "@/features/tasks/constants/process.constants"
import type { ProcessCode } from "@/features/tasks/types/task.types"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
import { cn } from "@/shared/utils/utils"

type Props = {
  taskId: string
  route: ProcessCode[]
  currentProcess?: ProcessCode
  /**
   * panel — centrado bajo el toggle (producción).
   * inline — franja en el header del expanded, al lado de actions.
   */
  variant?: "panel" | "inline"
}

const PROCESS_ENTRIES = Object.entries(PROCESS_ORDER).sort(
  ([, a], [, b]) => a.order - b.order,
)

export function TaskRouteViewer({
  taskId,
  route,
  currentProcess,
  variant = "panel",
}: Props) {
  const router = useRouter()
  const inline = variant === "inline"

  return (
    <div
      className={cn(
        "min-w-0",
        inline
          ? "flex max-w-full justify-end overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
          : "flex justify-center",
      )}
    >
      <div
        className={cn(
          "flex items-center",
          inline
            ? "min-w-max flex-nowrap gap-1.5 py-0.5"
            : "flex-wrap justify-center gap-2 pt-5",
        )}
      >
        {PROCESS_ENTRIES.map(([code]) => {
          const processCode = code as ProcessCode
          const enabled = route.includes(processCode)
          const process = PROCESS_DEFINITIONS[processCode]
          const Icon = ENTITY_ICONS[process.icon]
          const isCurrent = currentProcess === processCode

          return (
            <div key={processCode} className="relative shrink-0">
              {isCurrent && (
                <span
                  className={cn(
                    "pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold uppercase tracking-widest",
                    inline
                      ? "-top-3.5 hidden sm:block"
                      : "-top-4.5 hidden sm:block",
                  )}
                  style={{ color: process.color }}
                >
                  Actual
                </span>
              )}

              <button
                type="button"
                disabled={!enabled}
                title={process.name ?? processCode}
                onClick={e => {
                  e.stopPropagation()
                  sessionStorage.removeItem("process-origin-code")
                  sessionStorage.removeItem("process-origin-focus-task-id")
                  sessionStorage.setItem("process-origin-task-id", taskId)
                  router.push(`/processes?code=${processCode}&taskId=${taskId}`)
                }}
                className="transition-all duration-200 disabled:pointer-events-none"
              >
                <DynamicBadge
                  label={processCode}
                  color={process.color}
                  iconComponent={Icon}
                  muted={!enabled}
                  active={isCurrent}
                  pulse={isCurrent}
                  width="process"
                />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
