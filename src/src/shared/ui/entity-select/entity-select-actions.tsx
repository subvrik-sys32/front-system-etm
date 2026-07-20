"use client"

import {
  Eraser,
  Plus,
} from "lucide-react"

type Props={

  onClear:()=>void

  onCreate:()=>void

  canCreate?:boolean

}

export function EntitySelectActions({

  onClear,

  onCreate,

  canCreate=true,

}:Props){

  return(

    <div className="mt-2 pt-2">

      {canCreate && (

        <button
          type="button"
          onClick={onCreate}
          className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm text-white/60 transition-colors hover:bg-white/4 hover:text-white"
        >

          <Plus size={14} />

          Crear

        </button>

      )}

    </div>

  )

}