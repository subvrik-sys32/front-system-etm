"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { PrimaryAction } from "@/shared/ui/actions/primary-action"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

import { ActivityPickerDialog } from "./activity-picker-dialog"

// Mismo patrón que ProjectActions/TaskActions/UserActions/
// ActivityTypeActions: vive en el header de la página, dueño de su
// propio diálogo — desacoplado del contenido (que además abre este
// mismo diálogo al tocar "+ Registrar qué hiciste" dentro de una
// franja vacía; cada uno maneja su propia instancia, es liviano y
// evita pasar estado de la página al contenido y viceversa).
export function ActivityLogActions() {

  const [open, setOpen] = useState(false)

  const { isMobile } = useResponsive()

  return (

    <>

      {isMobile ? (

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Registrar actividad"
          className={cn(
            "fixed bottom-20 right-4 z-30 flex size-12 items-center justify-center rounded-full transition-all duration-200",
            "bg-white text-black hover:scale-105 hover:bg-neutral-100 active:scale-95",
            "shadow-[0_12px_32px_rgba(0,0,0,0.55),0_4px_10px_rgba(255,255,255,0.08)]",
          )}
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>

      ) : (

        <PrimaryAction
          label="Registrar"
          icon={Plus}
          onClick={() => setOpen(true)}
        />

      )}

      <ActivityPickerDialog
        open={open}
        onOpenChange={setOpen}
      />

    </>

  )

}