"use client"

import {
  useState,
} from "react"

import {
  Plus,
} from "lucide-react"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

import {
  usePermissions,
} from "@/features/permissions/hooks/use-permissions"

import {
  useResponsive,
} from "@/shared/responsive/hooks/use-responsive"

import {
  cn,
} from "@/shared/utils/utils"

import {
  PrimaryAction,
} from "@/shared/ui/actions/primary-action"

import {
  TaskDialog,
} from "../dialog/task-dialog"

export function TaskActions(){

  const[
    open,
    setOpen,
  ]=useState(false)

  const { isMobile } = useResponsive()

  const{
    has,
  }=
    usePermissions()

  const canCreate=
    has(
      PermissionCode.TASK_CREATE,
    )

  function handleOpen(){

    if(!canCreate){
      return
    }

    setOpen(true)

  }

  return(

    <>

      {isMobile ? (

        // FAB flotante en mobile: saca el botón del flujo normal
        // (ya no ocupa una fila propia debajo del título "TAREAS")
        // y flota sobre el contenido, arriba del BottomNavigation
        // sin superponerse a él (bottom-20 = 80px, deja los 56px
        // del nav más un margen de respiro).
        <button
          type="button"
          disabled={!canCreate}
          onClick={handleOpen}
          aria-label="Nueva tarea"
          className={cn(
            "fixed bottom-20 right-4 z-20 flex size-14 items-center justify-center rounded-full shadow-lg transition",
            canCreate
              ? "bg-white text-black hover:bg-neutral-200"
              : "cursor-not-allowed bg-white/10 text-white/35",
          )}
        >

          <Plus size={24} strokeWidth={2.5} />

        </button>

      ) : (

        <PrimaryAction

          label="Nueva tarea"

          icon={Plus}

          disabled={!canCreate}

          onClick={handleOpen}

        />

      )}

      {open&&(

        <TaskDialog

          open={open}

          promptOpenAfterCreate

          onClose={()=>
            setOpen(false)
          }

        />

      )}

    </>

  )

}