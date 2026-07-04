"use client"

import {
  Plus,
} from "lucide-react"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

import {
  usePermissions,
} from "@/features/permissions/hooks/use-permissions"

type Props={

  onClick:()=>void

}

export function ProjectTaskPlaceholder({

  onClick,

}:Props){

  const{
    has,
  }=
    usePermissions()

  const canCreate=
    has(
      PermissionCode.TASK_CREATE,
    )

  return(

    <button

      type="button"

      disabled={!canCreate}

      onClick={()=>{

        if(!canCreate){
          return
        }

        onClick()

      }}

      title={

        canCreate

          ?"Nueva tarea"

          :"No tienes permisos"

      }

      className={

        `group flex h-43.5 w-full flex-col items-center justify-center rounded-2xl
        bg-linear-to-br from-white/4 via-white/2 to-transparent
        transition-all duration-200

        ${

          canCreate

            ?"hover:border-cyan-500/20 hover:bg-white/5"

            :"cursor-not-allowed opacity-50"

        }`

      }

    >

      <div
        className={

          `mb-4 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200

          ${

            canCreate

              ?"bg-cyan-500/10 group-hover:scale-105 group-hover:bg-cyan-500/15"

              :"bg-cyan-500/5"

          }`

        }
      >

        <Plus
          size={20}
          className="text-cyan-400"
        />

      </div>

      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">

        Nueva tarea

      </p>

      <p className="mt-3 text-xs text-neutral-500">

        Agregar al proyecto

      </p>

    </button>

  )

}