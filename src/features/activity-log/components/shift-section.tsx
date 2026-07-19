"use client"

import { Trash2 } from "lucide-react"
import { getActivityIcon } from "../constants/activity-icons"
import { getShiftState } from "../constants/shift-definitions"
import { cn } from "@/shared/utils/utils"

import type { ActivityLog } from "../types/activity-log.types"
import type { LucideIcon } from "lucide-react"

type Props = {
  label: string
  hours: string
  icon: LucideIcon
  startHour: number
  endHour: number
  logs: ActivityLog[]
  onLogClick: () => void
  onDeleteLog: (id: string) => void
  deletingLogId?: string | null
}

export function ShiftSection({
  label,
  hours,
  icon: Icon,
  startHour,
  endHour,
  logs,
  onLogClick,
  onDeleteLog,
  deletingLogId,
}: Props) {

  const state = getShiftState({ startHour, endHour } as never, new Date())

  return (

    <div
      className={cn(
        "rounded-2xl bg-white/3 p-4",
        state === "upcoming" && "opacity-50",
      )}
    >

      <div className="flex items-center gap-2.5">

        <Icon size={16} className="text-neutral-400" />

        <span className="text-sm font-semibold text-neutral-200">
          {label}
        </span>

        <span className="text-xs text-neutral-500">
          {hours}
        </span>

      </div>

      <div className="mt-3 flex flex-col gap-2">

        {logs.map((log) => {

          const LogIcon = getActivityIcon(log.activityType.icon)

          return (

            <div
              key={log.id}
              className="group flex items-start gap-2.5 rounded-xl bg-white/4 p-2.5"
            >

              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${log.activityType.color}22`, color: log.activityType.color }}
              >
                <LogIcon size={14} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-medium text-neutral-200">
                  {log.activityType.label}
                </p>

                {log.project && (
                  <p className="mt-0.5 truncate text-xs text-cyan-400">
                    {log.project.projectCode} · {log.project.name}
                    {log.task && ` · #${String(log.task.taskNumber).padStart(3, "0")} ${log.task.reference}`}
                  </p>
                )}

                {log.note && (
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {log.note}
                  </p>
                )}

              </div>

              <div className="flex shrink-0 items-center gap-2">

                <span className="text-xs text-neutral-500">
                  {new Date(log.loggedAt).toLocaleTimeString("es-PE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <button
                  type="button"
                  onClick={() => onDeleteLog(log.id)}
                  disabled={deletingLogId === log.id}
                  aria-label="Eliminar entrada"
                  className="rounded-md p-1 text-neutral-600 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>

              </div>

            </div>

          )

        })}

        {logs.length === 0 && state !== "upcoming" && (

          <button
            type="button"
            onClick={onLogClick}
            className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-3 text-sm font-medium text-neutral-500 transition-colors hover:bg-white/4 hover:text-neutral-300"
          >
            + Registrar qué hiciste
          </button>

        )}

        {logs.length === 0 && state === "upcoming" && (

          <p className="py-2 text-center text-xs text-neutral-600">
            Todavía no llega esta franja
          </p>

        )}

      </div>

    </div>

  )

}