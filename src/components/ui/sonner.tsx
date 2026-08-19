"use client"

import { Toaster } from "sonner"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react"

import { Spinner } from "@/shared/ui/spinner/spinner"
import { useThemeStore } from "@/shared/theme"

/** Ancho adaptativo controlado para cualquier viewport */
const TOAST_W =
  "!w-[min(100vw-2rem,22rem)] !max-w-[min(100vw-2rem,22rem)]"

export function Sonner() {
  const theme = useThemeStore(s => s.resolved)

  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      closeButton
      gap={8}
      offset={16}
      visibleToasts={4}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        error: <XCircle className="h-4 w-4 text-red-500" />,
        warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        info: <Info className="h-4 w-4 text-sky-500" />,
        loading: <Spinner size={16} className="text-foreground" />,
      }}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: [
            TOAST_W,
            "!relative !flex !items-start !gap-3",
            "!bg-card !text-foreground !border !border-border !rounded-xl !p-3.5 !pr-8",
            "!shadow-lg !shadow-black/10 dark:!shadow-black/40",
          ].join(" "),
          icon: "!m-0 !mt-0.5 !shrink-0",
          content: "!min-w-0 !flex-1 !gap-1 !m-0",
          title: "!text-xs !font-semibold !leading-4 !text-foreground",
          description:
            "!text-xs !leading-4 !text-muted-foreground !whitespace-normal !break-words",
          closeButton: [
            "!absolute !top-2.5 !right-2.5 !left-auto !bottom-auto !transform-none",
            "!size-5 !rounded-md !border-0 !bg-transparent !text-muted-foreground",
            "hover:!bg-muted hover:!text-foreground !opacity-100 !transition-colors",
          ].join(" "),
          actionButton: [
            "!mt-2.5 !inline-flex !h-7 !items-center !justify-center !rounded-md",
            "!bg-foreground !px-3 !text-[11px] !font-medium !text-background",
            "hover:!opacity-90 !transition-opacity cursor-pointer",
          ].join(" "),
          cancelButton: [
            "!mt-2.5 !inline-flex !h-7 !items-center !justify-center !rounded-md",
            "!bg-muted !px-3 !text-[11px] !font-medium !text-foreground",
            "hover:!bg-muted/80 !transition-colors cursor-pointer",
          ].join(" "),
        },
      }}
    />
  )
}