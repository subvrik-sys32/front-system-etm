"use client"

import { cn } from "@/shared/utils/utils"

type Props={
  name:string
  className?:string
  style?:React.CSSProperties
}

export function EntityNameLabel({
  name,
  className,
  style,
}:Props){

  const normalizedName=
    name
      .trim()
      .replace(/\s+([\-\/+&])\s+/g,"$1")

  const words=
    normalizedName.split(/\s+/)

  const canStack=

    words.length>=2 &&
    words.length<=3 &&

    words.every(
      word=>
        word.length<=14
    ) &&

    normalizedName.length<=26

  if(canStack){

    const middle=
      Math.ceil(
        words.length/2
      )

    const firstLine=
      words
        .slice(0,middle)
        .join(" ")

    const secondLine=
      words
        .slice(middle)
        .join(" ")

    return(

      <div
        style={style}
        className={cn(
          "min-w-0 flex flex-1 flex-col justify-center leading-[1.05] text-sm font-medium select-none uppercase tracking-[0.02em]",
          className
        )}
      >

        <span className="min-w-0 truncate">

          {firstLine}

        </span>

        <span className="min-w-0 truncate">

          {secondLine}

        </span>

      </div>

    )

  }

  return(

    <span
      style={style}
      className={cn(
        "block min-w-0 truncate text-sm font-medium select-none uppercase tracking-[0.02em]",
        className
      )}
    >

      {normalizedName}

    </span>

  )

}