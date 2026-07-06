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

      <div className="flex h-27 w-full items-center justify-center">

        {logo??(

          <Image
            src="/icon.svg"
            alt="ETM SAC"
            width={83}
            height={83}
            priority
            draggable={false}
            className="block h-20 w-20 select-none object-contain"
          />

        )}

      </div>

    )

  })