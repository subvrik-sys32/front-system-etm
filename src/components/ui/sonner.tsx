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
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { BOTTOM_NAV_HEIGHT_PX } from "@/shared/responsive/layout/chrome-constants"
import { cn } from "@/shared/utils/utils"

export function Sonner() {
  const theme = useThemeStore(s => s.resolved)
  const { isMobile, ready } = useResponsive()
  const mobile = ready && isMobile

  return (
    <Toaster
      theme={theme}
      position={mobile ? "bottom-center" : "bottom-right"}
      gap={8}
      offset={mobile ? BOTTOM_NAV_HEIGHT_PX : 16}
      className={cn(
        mobile &&
          "!left-1/2 !right-auto !w-[min(100vw-1.5rem,22rem)] !-translate-x-1/2",
      )}
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
          toast:
            "group flex w-[min(100vw-2rem,22rem)] items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-foreground shadow-toast",
          title: "text-xs font-semibold leading-4 text-foreground",
          description: "text-xs leading-4 text-muted-foreground break-words",
          closeButton:
            "border-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        },
      }}
    />
  )
}