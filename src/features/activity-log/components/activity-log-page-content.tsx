"use client"

import { useState } from "react"

import { useMyActivityLog } from "../hooks/use-my-activity-log"
import { useDeleteActivityLog } from "../hooks/use-delete-activity-log"
import { SHIFT_GROUPS } from "../constants/shift-definitions"
import type { ShiftSlotDefinition } from "../constants/shift-definitions"
import { ShiftGroupSection } from "./shift-group-section"
import { ActivityPickerDialog } from "./activity-picker-dialog"
import { ActivityLogSkeleton } from "./activity-log-skeleton"

const TODAY_LABEL = new Date().toLocaleDateString("es-PE", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

export function ActivityLogPageContent() {

  const { logs, loading } = useMyActivityLog()
  const { deleteLog } = useDeleteActivityLog()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [activeSlot, setActiveSlot] = useState<ShiftSlotDefinition | null>(null)
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null)

  function handleOpenPicker(slot: ShiftSlotDefinition) {
    setActiveSlot(slot)
    setPickerOpen(true)
  }

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

        {loading ? (

          <ActivityLogSkeleton />

        ) : (

          SHIFT_GROUPS.map((group) => {

            const logsBySlot: Record<string, typeof logs> = {}

            for (const slot of group.slots) {
              logsBySlot[slot.shift] = logs.filter((log) => log.shift === slot.shift)
            }

            return (

              <ShiftGroupSection
                key={group.key}
                group={group}
                logsBySlot={logsBySlot}
                onLogClick={handleOpenPicker}
                onDeleteLog={handleDeleteLog}
                deletingLogId={deletingLogId}
              />

            )

          })

        )}

      </div>

      <ActivityPickerDialog
        open={pickerOpen}
        activeSlot={activeSlot}
        onOpenChange={(open) => {
          setPickerOpen(open)
          if (!open) {
            setActiveSlot(null)
          }
        }}
      />

    </div>

  )

}