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

    <div className="flex items-center justify-center">

      {logo ?? (

        <Image
          src="/icon.svg"
          alt="ETM SAC"
          width={80}
          height={80}
          priority
          className="block select-none"
        />

      )}

    </div>

  )

})