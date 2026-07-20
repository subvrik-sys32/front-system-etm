"use client"

import { useState } from "react"

import { useMyActivityLog } from "../hooks/use-my-activity-log"
import { useDeleteActivityLog } from "../hooks/use-delete-activity-log"
import { SHIFT_DEFINITIONS } from "../constants/shift-definitions"
import { ShiftSection } from "./shift-section"
import { ActivityPickerDialog } from "./activity-picker-dialog"
import { ActivityLogSkeleton } from "./activity-log-skeleton"

import { useHydrated } from "@/shared/hooks/use-hydrated"

const TODAY_LABEL = new Date().toLocaleDateString("es-PE", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

export function ActivityLogPageContent() {

  const hydrated = useHydrated()

  const { logs, loading } = useMyActivityLog()
  const { deleteLog } = useDeleteActivityLog()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null)

  async function handleDeleteLog(id: string) {

    setDeletingLogId(id)

    try {
      await deleteLog(id)
    } finally {
      setDeletingLogId(null)
    }

  }

  return (

    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">

      {/* En desktop esto es redundante con "BITÁCORA..." del
          header (que ya dice el nombre de la página) — pero en
          mobile el header queda oculto y el TopBar solo muestra
          "Bitácora", sin fecha. Esta línea es la única referencia a
          "qué día es hoy" que le queda a la persona en mobile, así
          que se mantiene en ambos breakpoints. */}
      <p className="text-xs capitalize text-neutral-500">
        {TODAY_LABEL}
      </p>

      <div className="flex flex-col gap-3">

        {!hydrated || loading ? (

          <ActivityLogSkeleton />

        ) : (

          SHIFT_DEFINITIONS.map((def) => (

            <ShiftSection
              key={def.shift}
              label={def.label}
              hours={def.hours}
              icon={def.icon}
              startHour={def.startHour}
              endHour={def.endHour}
              logs={logs.filter((log) => log.shift === def.shift)}
              onLogClick={() => setPickerOpen(true)}
              onDeleteLog={handleDeleteLog}
              deletingLogId={deletingLogId}
            />

          ))

        )}

      </div>

      <ActivityPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />

    </div>

  )

}