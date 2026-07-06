"use client"

import { memo } from "react"
import Image from "next/image"

type Props = {
  logo?: React.ReactNode
}

export const LoadingLogo = memo(function LoadingLogo({
  logo,
}: Props) {

  return (

    <div className="flex h-18 w-18 items-center justify-center">

      {logo ?? (

        <Image
          src="/icon.svg"
          alt="ETM SAC"
          width={42}
          height={42}
          priority
          className="block h-8 w-auto select-none"
        />

      )}

    </div>

  )

})