"use client"

import type {
  LucideIcon,
} from "lucide-react"

import type {
  ReactNode,
} from "react"

import {
  getBadgeColors,
} from "@/shared/utils/badge-colors"

type Row={

  label:string

  value:ReactNode

  secondary?:string

}

type Props={

  label:string

  icon:LucideIcon

  color:string

  rows:Row[]

}

export function ProcessMiniCard({

  label,
  icon:Icon,
  color,
  rows,

}:Props){

  const textColor=
    getBadgeColors(
      color,
      "subtle"
    ).text

  return(

    <div
      className="flex h-28 select-none flex-col rounded-xl p-4"
      style={{
        background:
          `linear-gradient(
            135deg,
            ${color}20,
            #101012
          )`,
      }}
    >

      <div className="mb-3 flex items-center justify-between">

        <span
          className="text-xs font-bold uppercase tracking-[0.18em]"
          style={{
            color:textColor,
          }}
        >

          {label}

        </span>

        <Icon
          size={20}
          style={{
            color:textColor,
          }}
        />

      </div>

      <div className="flex flex-1 gap-4">

        {rows.map(
          row=>(

            <div
              key={row.label}
              className="min-w-0 flex-1 border-l border-white/10 pl-3 first:border-l-0 first:pl-0"
            >

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">

                {row.label}

              </p>

              <div
                className="mt-1 text-sm font-bold leading-tight"
                style={{
                  color:textColor,
                }}
              >

                {row.value}

              </div>

              {row.secondary && (

                <p className="mt-0.5 text-xs leading-tight text-neutral-400">

                  {row.secondary}

                </p>

              )}

            </div>

          )
        )}

      </div>

    </div>

  )

}