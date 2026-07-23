"use client"

import { Toaster } from "sonner"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"
import { Spinner } from "@/shared/ui/spinner/spinner"

export function Sonner(){

  return(

    <Toaster
      theme="dark"
      position="bottom-right"
      closeButton
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        error: <XCircle className="h-4 w-4 text-red-500" />,
        warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
        info: <Info className="h-4 w-4 text-blue-500" />,
        loading: <Spinner size={16} className="text-white" />,
      }}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: "!bg-[#18181b] !text-white !border-0 shadow-2xl",
          closeButton: "!border-0",
        },
      }}
    />

  )
}