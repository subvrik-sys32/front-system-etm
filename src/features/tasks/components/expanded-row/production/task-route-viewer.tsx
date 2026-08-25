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
   * panel — centrado (legacy / móvil).
   * inline — misma fila que toggle/actions/barra (desktop).
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
        inline ? "flex max-w-full justify-end" : "flex justify-center",
      )}
    >
      <div
        className={cn(
          "flex items-center",
          inline
            ? "min-w-max flex-nowrap gap-1.5"
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
            <div
              key={processCode}
              className="relative shrink-0 rounded-lg transition-[box-shadow,filter] duration-300"
              style={
                isCurrent
                  ? {
                      // Glow suave del color de dominio — sin ring duro
                      boxShadow: `0 0 0 1px color-mix(in srgb, ${process.color} 45%, transparent), 0 0 14px color-mix(in srgb, ${process.color} 40%, transparent)`,
                      filter: "brightness(1.06)",
                    }
                  : undefined
              }
            >
              {/* Pip vivo: marca “actual” sin texto flotante ni borde grueso */}
              {isCurrent && (
                <span
                  className="pointer-events-none absolute -right-0.5 -top-0.5 z-10 size-2 rounded-full shadow-xs"
                  style={{
                    backgroundColor: process.color,
                    boxShadow: `0 0 6px ${process.color}`,
                  }}
                  aria-hidden
                />
              )}
              <button
                type="button"
                disabled={!enabled}
                title={
                  isCurrent
                    ? `${process.label} · Actual`
                    : process.label
                }
                aria-current={isCurrent ? "step" : undefined}
                onClick={e => {
                  e.stopPropagation()
                  sessionStorage.removeItem("process-origin-code")
                  sessionStorage.removeItem("process-origin-focus-task-id")
                  sessionStorage.setItem("process-origin-task-id", taskId)
                  router.push(
                    `/processes?code=${processCode}&taskId=${taskId}`,
                  )
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
