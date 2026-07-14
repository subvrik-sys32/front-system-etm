"use client"

import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { getBadgeColors } from "@/shared/utils/badge-colors"
import { cn } from "@/shared/utils/utils"

import { PIPELINE_PROCESS_ORDER } from "../utils/process-columns"

import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

type Props = {
  value: ProcessCode
  onChange: (code: ProcessCode) => void
  columns: Map<ProcessCode, Task[]>
}

export function PipelineProcessSelector({
  value,
  onChange,
  columns,
}: Props) {

  return (

    <nav className="hide-scrollbar flex shrink-0 gap-1.5 overflow-x-auto px-1 py-2">

      {PIPELINE_PROCESS_ORDER.map(code => {

        const definition = PROCESS_DEFINITIONS[code]
        const badge = getBadgeColors(definition.color, "subtle")
        const count = columns.get(code)?.length ?? 0
        const isActive = code === value

        return (

          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition",
              !isActive && "text-neutral-500",
            )}
            style={
              isActive
                ? { backgroundColor: badge.background, color: badge.text }
                : undefined
            }
          >

            {definition.label}

            <span className={cn("text-[10px]", isActive ? "opacity-80" : "text-neutral-600")}>
              {count}
            </span>

          </button>

        )

      })}

    </nav>

  )

}