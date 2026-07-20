"use client"

import { useMemo, useState } from "react"

import { UserSelect } from "@/features/users/components/user-select"
import { useUsersDirectory } from "@/features/users/hooks/use-users-directory"
import type { User } from "@/features/users/types/user.types"

import { DatePicker } from "@/shared/ui/date-picker/components/date-picker"
import { toISODateString } from "@/shared/ui/date-picker/utils/date-format"

import { getActivityIcon } from "../constants/activity-icons"
import { useTeamActivityLog } from "../hooks/use-team-activity-log"
import { TeamActivityLogSkeleton } from "./team-activity-log-skeleton"

function startOfDayISO(date: string) {
  return new Date(`${date}T00:00:00`).toISOString()
}

function endOfDayISO(date: string) {
  return new Date(`${date}T23:59:59`).toISOString()
}

export function TeamActivityLogPageContent() {
  const { users } = useUsersDirectory()

  const [selectedUser, setSelectedUser] = useState<User>()
  const [date, setDate] = useState<Date | null>(new Date())

  const filters = useMemo(
    () => ({
      userId: selectedUser?.id,
      from: date ? startOfDayISO(toISODateString(date)) : undefined,
      to: date ? endOfDayISO(toISODateString(date)) : undefined,
    }),
    [selectedUser, date],
  )

  const { logs, loading } = useTeamActivityLog(filters)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">

      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-white/2 p-4">

        <div className="w-56 shrink-0">
          <UserSelect
            value={selectedUser}
            items={users as User[]}
            placeholder="Todo el equipo"
            onChange={setSelectedUser}
          />
        </div>

        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Fecha"
        />

        <div className="rounded-lg bg-white/5 px-3 py-2 text-sm text-neutral-400">
          {logs.length} {logs.length === 1 ? "entrada" : "entradas"}
        </div>

      </div>

      <div className="flex flex-col gap-3">

        {loading ? (
          <TeamActivityLogSkeleton />
        ) : logs.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border-white/10 bg-white/2 text-sm text-neutral-500">
            Sin entradas para este filtro
          </div>
        ) : (
          logs.map((log) => {
            const Icon = getActivityIcon(log.activityType.icon)

            return (
              <div
                key={log.id}
                className="rounded-2xl border bg-white/3 p-4 transition-colors hover:bg-white/5"
              >
                <div className="flex items-start gap-4">

                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${log.activityType.color}22`,
                      color: log.activityType.color,
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center justify-between gap-2">

                      <span className="font-medium text-neutral-100">
                        {log.user?.name ?? "—"}
                      </span>

                      <span className="text-xs text-neutral-500">
                        {new Date(log.loggedAt).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-neutral-300">
                      {log.activityType.label}
                    </p>

                    {log.project && (
                      <p className="mt-2 text-xs text-cyan-400">
                        {log.project.projectCode} · {log.project.name}
                        {log.task &&
                          ` · #${String(log.task.taskNumber).padStart(3, "0")} ${log.task.reference}`}
                      </p>
                    )}

                    {log.note && (
                      <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                        {log.note}
                      </p>
                    )}

                  </div>

                </div>

              </div>
            )
          })
        )}

      </div>

    </div>
  )
}