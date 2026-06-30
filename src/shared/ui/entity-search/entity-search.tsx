"use client"

import { Search } from "lucide-react"

import { cn } from "@/shared/utils/utils"

type Props={
  value:string
  onChange:(value:string)=>void
  placeholder?:string
  className?:string
}

export function EntitySearch({
  value,
  onChange,
  placeholder="Buscar...",
  className,
}:Props){

  return(

    <div
      className={cn(
        "relative",
        className
      )}
    >

      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
      />

      <input
        value={value}
        onChange={event=>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="h-10 w-full rounded-xl bg-[#101012] pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-500 focus:border focus:border-cyan-500/40"
      />

    </div>

  )

}