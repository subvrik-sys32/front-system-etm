"use client"

import { Toaster } from "sonner"

export function Sonner(){

  return(

    <Toaster

      theme="dark"

      position="bottom-right"

      closeButton

      toastOptions={{

        duration:4000,

        className:
          "!bg-[#18181b] !border !border-white/10 !text-white shadow-2xl",

      }}

    />

  )

}