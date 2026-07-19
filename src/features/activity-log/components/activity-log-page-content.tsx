"use client"

import { useState } from "react"
import { NotebookPen, Plus } from "lucide-react"

import { useMyActivityLog } from "../hooks/use-my-activity-log"
import { useDeleteActivityLog } from "../hooks/use-delete-activity-log"
import { SHIFT_DEFINITIONS } from "../constants/shift-definitions"
import { ShiftSection } from "./shift-section"
import { ActivityPickerDialog } from "./activity-picker-dialog"

import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

const TODAY_LABEL = new Date().toLocaleDateString("es-PE", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

export function ActivityLogPageContent() {

  const { isMobile } = useResponsive()

  const { logs } = useMyActivityLog()
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

    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-5">

      <div className="flex items-center justify-between gap-2.5">

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

        {/* Versión desktop que faltaba — antes esto solo mostraba
            el botón circular flotante sin importar el dispositivo,
            que se ve fuera de lugar en una pantalla grande. Mismo
            patrón que ProjectActions/TaskActions: PrimaryAction en
            desktop, círculo fijo solo en mobile. */}
        {!isMobile && (

          <PrimaryAction
            label="Registrar"
            icon={Plus}
            onClick={() => setPickerOpen(true)}
          />

        )}

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
            onDeleteLog={handleDeleteLog}
            deletingLogId={deletingLogId}
          />

        ))}

      </div>

      {isMobile && (

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-label="Registrar actividad"
          className={cn(
            "fixed bottom-20 right-4 z-30 flex size-12 items-center justify-center rounded-full transition-all duration-200",
            "bg-white text-black hover:scale-105 hover:bg-neutral-100 active:scale-95",
            "shadow-[0_12px_32px_rgba(0,0,0,0.55),0_4px_10px_rgba(255,255,255,0.08)]",
          )}
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>

      )}

      <ActivityPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />

    </div>

  )

}