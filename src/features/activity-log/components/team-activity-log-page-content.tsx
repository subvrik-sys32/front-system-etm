"use client"

import { useMemo, useState } from "react"

import { useTeamActivityLog } from "../hooks/use-team-activity-log"
import { useUsersDirectory } from "@/features/users/hooks/use-users-directory"
import { getActivityIcon } from "../constants/activity-icons"

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function startOfDayISO(dateInput: string) {
  return new Date(`${dateInput}T00:00:00`).toISOString()
}

function endOfDayISO(dateInput: string) {
  return new Date(`${dateInput}T23:59:59`).toISOString()
}

export function TeamActivityLogPageContent() {

  const { users } = useUsersDirectory()

  const [userId, setUserId] = useState("")
  const [date, setDate] = useState(() => toDateInputValue(new Date()))

  const filters = useMemo(
    () => ({
      userId: userId || undefined,
      from: startOfDayISO(date),
      to: endOfDayISO(date),
    }),
    [userId, date],
  )

  const { logs, loading } = useTeamActivityLog(filters)

  return (

    <div className="flex flex-col gap-3">

      <div className="flex flex-wrap items-center gap-2">

        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="rounded-lg bg-white/6 px-3 py-2 text-sm text-white outline-none"
        >

          <option value="">Todo el equipo</option>

          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}

        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg bg-white/6 px-3 py-2 text-sm text-white outline-none"
        />

        <span className="text-sm text-neutral-500">
          {logs.length} {logs.length === 1 ? "entrada" : "entradas"}
        </span>

      </div>

      <div className="flex flex-col gap-2">

        {loading && (
          <div className="flex h-32 items-center justify-center text-sm text-neutral-500">
            Cargando...
          </div>
        )}

        {!loading && logs.map((log) => {

          const Icon = getActivityIcon(log.activityType.icon)

          return (

            <div
              key={log.id}
              className="flex items-start gap-3 rounded-xl bg-white/3 p-3"
            >

              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${log.activityType.color}22`, color: log.activityType.color }}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <span className="text-sm font-semibold text-neutral-200">
                    {log.user?.name ?? "—"}
                  </span>

                  <span className="text-xs text-neutral-500">
                    {new Date(log.loggedAt).toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                </div>

                <p className="text-sm text-neutral-300">
                  {log.activityType.label}
                </p>

                {log.project && (
                  <p className="mt-0.5 text-xs text-cyan-400">
                    {log.project.projectCode} · {log.project.name}
                    {log.task && ` · #${String(log.task.taskNumber).padStart(3, "0")} ${log.task.reference}`}
                  </p>
                )}

                {log.note && (
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {log.note}
                  </p>
                )}

              </div>

            </div>

          )

        })}

        {!loading && logs.length === 0 && (

          <div className="flex h-32 items-center justify-center rounded-xl bg-white/2 text-sm text-neutral-500">
            Sin entradas para este filtro
          </div>

        )}

      </div>

    </div>

  )

}