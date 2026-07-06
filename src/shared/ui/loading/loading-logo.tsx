"use client"

import { memo } from "react"
import Image from "next/image"

type Props={
  logo?:React.ReactNode
}

export const LoadingLogo=
  memo(function LoadingLogo({
    logo,
  }:Props){

    return(

      <div className="flex h-28 w-full items-center justify-center">

        {logo??(

          <div className="relative h-20 w-20 shrink-0">

            <Image
              src="/icon.svg"
              alt="ETM SAC"
              fill
              priority
              draggable={false}
              className="select-none object-contain"
            />

          </div>

        )}

      </div>

    )

  })