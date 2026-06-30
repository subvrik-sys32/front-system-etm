"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  Search,
} from "lucide-react"

import {
  cn,
} from "@/shared/utils/utils"

type Props={
  value:string
  onChange:(value:string)=>void
}

export function EntityToolbarSearch({
  value,
  onChange,
}:Props){

  const [open,setOpen]=
    useState(
      Boolean(value)
    )

  const inputRef=
    useRef<HTMLInputElement>(
      null
    )

  const ignoreBlurRef=
    useRef(false)

  useEffect(()=>{

    if(open){

      inputRef.current?.focus()

    }

  },[
    open,
  ])

  const handleToggle=()=>{

    ignoreBlurRef.current=
      true

    if(open){

      onChange("")

      setOpen(false)

      return

    }

    setOpen(true)

  }

  const handleBlur=()=>{

    if(
      ignoreBlurRef.current
    ){

      ignoreBlurRef.current=
        false

      return

    }

    if(!value){

      setOpen(false)

    }

  }

  return(

    <div className="flex justify-end">

      <div
        className={cn(

          "flex items-center overflow-hidden transition-all duration-200 ease-out",

          open
            ? "w-56"
            : "w-8"

        )}
      >

        <button
          type="button"
          onMouseDown={event=>
            event.preventDefault()
          }
          onClick={handleToggle}
          className={cn(

            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white transition-all duration-200",

            !open &&
              "hover:bg-[#101012]"

          )}
        >

          <Search
            size={14}
            strokeWidth={2}
          />

        </button>

        <input
          ref={inputRef}
          value={value}
          onChange={event=>
            onChange(
              event.target.value
            )
          }
          onBlur={handleBlur}
          placeholder="Buscar..."
          className={cn(

            "bg-transparent text-sm text-white outline-none placeholder:text-white/35 transition-all duration-200",

            open
              ? "w-full opacity-100"
              : "w-0 opacity-0"

          )}
        />

      </div>

    </div>

  )

}