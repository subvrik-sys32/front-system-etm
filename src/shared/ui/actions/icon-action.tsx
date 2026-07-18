"use client"

import type{
  LucideIcon,
}from"lucide-react"

import{
  cn,
}from"@/shared/utils/utils"

type Props={

  icon:LucideIcon

  variant?:"default"|"danger"

  disabled?:boolean

  onClick:(

    event:React.MouseEvent<HTMLButtonElement>

  )=>void

}

export function IconAction({

  icon:Icon,

  variant="default",

  disabled=false,

  onClick,

}:Props){

  const danger=
    variant==="danger"

  return(

    <button

      type="button"

      disabled={disabled}

      onPointerDown={event=>{

        event.preventDefault()
        event.stopPropagation()

      }}

      onClick={event=>{

        event.preventDefault()
        event.stopPropagation()

        if(disabled){
          return
        }

        onClick(event)

      }}

      className={cn(

        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",

        disabled

          ?"cursor-not-allowed opacity-35"

          :danger

            ?"text-neutral-600 hover:bg-red-500/10 hover:text-red-400"

            :"text-neutral-500 hover:bg-white/10 hover:text-white",

      )}

    >

      <Icon

        size={16}

        strokeWidth={2.4}

      />

    </button>

  )

}