"use client"

import {
  Check,
  Loader2,
  Pause,
  Play,
  Search,
} from "lucide-react"

import {
  cn,
} from "@/shared/utils/utils"

type Props={

  label:string

  variant?:
    |"start"
    |"pause"
    |"complete"
    |"review"

  onClick:()=>void

  iconOnly?:boolean

  disabled?:boolean

  loading?:boolean

  fullWidth?:boolean

}

export function WorkflowAction({

  label,

  variant="start",

  onClick,

  iconOnly=false,

  disabled=false,

  loading=false,

  fullWidth=false,

}:Props){

  const config=

    variant==="start"

      ?{

          icon:Play,

          iconClass:"text-neutral-300",

        }

      :variant==="pause"

        ?{

            icon:Pause,

            iconClass:"text-amber-300",

          }

        :variant==="complete"

          ?{

              icon:Check,

              iconClass:"text-emerald-300",

            }

          :{

              icon:Search,

              iconClass:"text-sky-300",

            }

  const Icon=
    loading
      ?Loader2
      :config.icon

  const isDisabled=
    disabled||loading

  return(

    <button

      type="button"

      disabled={isDisabled}

      onMouseDown={event=>

        event.preventDefault()

      }

      onClick={()=>{

        if(isDisabled){
          return
        }

        onClick()

      }}

      title={

        loading

          ?label

          :disabled

            ?"No tienes permisos"

            :label

      }

      className={cn(

        "flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-150 select-none",

        iconOnly

          ?"w-10 px-0"

          :fullWidth

            ?"w-full gap-2 px-3"

            :"min-w-30 gap-2 px-3",

        isDisabled

          ?"cursor-not-allowed bg-white/4 text-white/35 opacity-50"

          :"bg-white/4 text-neutral-200 hover:bg-white/8 active:bg-white/12",

        loading&&"opacity-70",

      )}

    >

      <Icon

        size={14}

        strokeWidth={2.4}

        className={cn(

          loading

            ?"text-neutral-300 animate-spin"

            :config.iconClass,

          isDisabled&&!loading&&"opacity-40",

          "shrink-0",

        )}

      />

      {!iconOnly&&(

        <span className="min-w-0 truncate select-none">

          {loading?"Procesando...":label}

        </span>

      )}

    </button>

  )

}