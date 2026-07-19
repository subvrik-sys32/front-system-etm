"use client"

import { useState } from "react"
import { NotebookPen, Plus } from "lucide-react"

import { useMyActivityLog } from "../hooks/use-my-activity-log"
import { SHIFT_DEFINITIONS } from "../constants/shift-definitions"
import { ShiftSection } from "./shift-section"
import { ActivityPickerDialog } from "./activity-picker-dialog"

const TODAY_LABEL = new Date().toLocaleDateString("es-PE", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

export function ActivityLogPageContent() {

  const { logs } = useMyActivityLog()

  const [pickerOpen, setPickerOpen] = useState(false)

  return (

    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-5">

      <div className="flex items-center gap-2.5">

        <div className="flex size-9 items-center justify-center rounded-full bg-white/8">
          <NotebookPen size={16} className="text-neutral-300" />
        </div>

        <div>

          <h1 className="text-lg font-bold tracking-tight text-white">
            Bitácora
          </h1>

          <p className="text-xs capitalize text-neutral-500">
            {TODAY_LABEL}
          </p>

        </div>

      </div>

      <div className="flex flex-col gap-3">

        {SHIFT_DEFINITIONS.map((def) => (

          <ShiftSection
            key={def.shift}
            label={def.label}
            hours={def.hours}
            icon={def.icon}
            startHour={def.startHour}
            endHour={def.endHour}
            logs={logs.filter((log) => log.shift === def.shift)}
            onLogClick={() => setPickerOpen(true)}
          />

        ))}

      </div>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        aria-label="Registrar actividad"
        className="fixed bottom-24 right-5 z-30 flex size-14 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-black/40 transition active:scale-95"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <ActivityPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />

    </div>

  )

}