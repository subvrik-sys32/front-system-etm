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

const TOAST_WIDTH_CLASS =
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
        success: <CheckCircle2 className="size-4 text-emerald-500" />,
        error: <XCircle className="size-4 text-red-500" />,
        warning: <AlertTriangle className="size-4 text-amber-500" />,
        info: <Info className="size-4 text-sky-500" />,
        loading: <Spinner size={16} className="text-foreground" />,
      }}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: [
            TOAST_WIDTH_CLASS,
            "!relative !flex !items-start !gap-3",
            "!bg-card !text-foreground !border !border-border !rounded-xl !p-3.5 !pr-9",
            "!shadow-lg !shadow-black/10 dark:!shadow-black/40",
          ].join(" "),
          // El icono se ancla arriba con un margin-top fino alineado con la primera línea de texto
          icon: "!m-0 !mt-0.5 !shrink-0",
          // El bloque de contenido flexiona verticalmente para auto-centrarse en tarjetas de bajo contenido
          content: [
            "!min-w-0 !flex-1 !flex !flex-col !justify-center !gap-0.5 !m-0 !py-0.5",
          ].join(" "),
          title: "!text-xs !font-semibold !leading-4 !text-foreground",
          description:
            "!text-xs !leading-4 !text-muted-foreground !whitespace-normal !break-words",
          // Posicionamiento absoluto relativo a la tarjeta sin desbordar el viewport
          closeButton: [
            "!absolute !top-2 !right-2 !left-auto !bottom-auto !transform-none",
            "!size-5 !rounded-md !border-0 !bg-transparent !text-muted-foreground",
            "hover:!bg-muted hover:!text-foreground !opacity-100 !transition-colors cursor-pointer",
          ].join(" "),
          // Centrado dinámico respecto a la altura total de la tarjeta
          actionButton: [
            "!shrink-0 !self-center !my-auto !m-0 !inline-flex !h-8 !items-center !justify-center !rounded-lg",
            "!bg-foreground !px-3 !text-[11px] !font-semibold !text-background",
            "hover:!opacity-90 !transition-opacity cursor-pointer",
          ].join(" "),
          cancelButton: [
            "!shrink-0 !self-center !my-auto !m-0 !inline-flex !h-8 !items-center !justify-center !rounded-lg",
            "!bg-muted !px-3 !text-[11px] !font-medium !text-foreground",
            "hover:!bg-muted/80 !transition-colors cursor-pointer",
          ].join(" "),
        },
      }}
    />
  )
}