"use client"

import type{
  LucideIcon,
}from"lucide-react"

import{
  cn,
}from"@/shared/utils/utils"

type Props={

  label:string

  icon?:LucideIcon

  disabled?:boolean

  onClick:()=>void

}

export function PrimaryAction({

  label,

  icon:Icon,

  disabled=false,

  onClick,

}:Props){

  return(

    <button

      type="button"

      disabled={disabled}

      onClick={()=>{

        if(disabled){
          return
        }

        onClick()

      }}

      className={cn(

        "inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-semibold transition",

        disabled

          ?"cursor-not-allowed bg-white/10 text-white/35"

          :"bg-white text-black hover:bg-neutral-200",

      )}

    >

      {Icon&&(

        <Icon
          size={16}
          strokeWidth={2.5}
        />

      )}

      {label}

    </button>

  )

}