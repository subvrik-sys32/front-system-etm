"use client"

import { Layers } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CHROME_ICON_BTN } from "@/shared/ui/actions/icon-action"
import { cn } from "@/shared/utils/utils"
import type { Task } from "../types/task.types"
import { getTaskPiecesTotal } from "../utils/task-material-summary"

type Props = {
  task: Task
  className?: string
  size?: "sm" | "md"
  alwaysShow?: boolean
}

export function TaskMaterialInfo({
  task,
  className,
  size = "sm",
  alwaysShow = false,
}: Props) {
  const lines = task.materialLines
  if (!lines || lines.length === 0) return null
  if (!alwaysShow && lines.length <= 1) return null

  const total = getTaskPiecesTotal(task)
  const isMd = size === "md"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Detalle de materiales"
          title="Materiales"
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          className={cn(CHROME_ICON_BTN, isMd && "size-9", className)}
        >
          <Layers size={isMd ? 16 : 14} strokeWidth={2.25} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={12}
        floatingClassName="w-72"
        className="gap-0 p-0"
      >
        <div className="border-b border-border/50 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Materiales · {total} {total === 1 ? "pieza" : "piezas"}
          </p>
        </div>
        <ul className="flex max-h-64 flex-col gap-0.5 overflow-y-auto p-1.5">
          {lines.map((line, i) => {
            const label =
              [line.material?.name, line.thickness?.name]
                .filter(Boolean)
                .join(" · ") || `Línea ${i + 1}`
            return (
              <li
                key={line.id ?? i}
                className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 hover:bg-foreground/[0.04]"
              >
                <span className="min-w-0 truncate text-sm font-medium text-foreground">
                  {label}
                </span>
                <span className="shrink-0 rounded-md bg-foreground/5 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {line.pieces ?? 0} pzs
                </span>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
