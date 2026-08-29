"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  ArrowLeft,
} from "lucide-react"

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"

import {
  useHydrated,
} from "@/shared/hooks/use-hydrated"

import {
  useFocusNavStore,
} from "@/shared/focus/store/focus-nav-store"

const STORAGE_KEY =
  "process-origin-task-id"

function readOrigin(): string | null {
  if (
    typeof sessionStorage === "undefined"
  ) {
    return null
  }

  /**
   * Si existe un origen proceso → proceso,
   * el botón ← Tarea no debe aparecer.
   */
  if (
    sessionStorage.getItem(
      "process-origin-code",
    )
  ) {
    return null
  }

  return sessionStorage.getItem(
    STORAGE_KEY,
  )
}

export function BackToTaskButton() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hydrated = useHydrated()

  const [
    taskId,
    setTaskId,
  ] = useState<string | null>(null)

  const [
    navigating,
    setNavigating,
  ] = useState(false)

  /**
   * Relee el origen al hidratar,
   * cambiar URL o limpiar navegación.
   */
  useEffect(() => {
    if (!hydrated) {
      return
    }

    setTaskId(
      readOrigin(),
    )

    const onCleared = () => {
      setTaskId(
        readOrigin(),
      )
    }

    window.addEventListener(
      "entity-origin-cleared",
      onCleared,
    )

    return () => {
      window.removeEventListener(
        "entity-origin-cleared",
        onCleared,
      )
    }
  }, [
    hydrated,
    pathname,
    searchParams,
  ])

  if (!taskId) {
    return null
  }

  const handleClick = () => {
    /**
     * Evita doble navegación.
     */
    if (navigating) {
      return
    }

    setNavigating(true)

    /**
     * Consumimos todos los orígenes.
     */
    sessionStorage.removeItem(
      STORAGE_KEY,
    )

    sessionStorage.removeItem(
      "process-origin-code",
    )

    sessionStorage.removeItem(
      "process-origin-focus-task-id",
    )

    /**
     * Ocultamos inmediatamente el botón.
     */
    setTaskId(null)

    /**
     * Iniciamos el estado visual de navegación.
     */
    useFocusNavStore
      .getState()
      .start(
        "Abriendo tarea…",
      )

    /**
     * UUID garantiza que cada navegación
     * a la tarea sea un deep-link nuevo.
     */
    const focus =
      crypto.randomUUID()

    router.push(
      `/tasks?taskId=${encodeURIComponent(taskId)}&focus=${focus}`,
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={navigating}
      className="flex h-8 min-w-0 items-center gap-2 rounded-xl bg-foreground/5 px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground select-none disabled:pointer-events-none disabled:opacity-60"
    >
      <ArrowLeft
        className="h-4 w-4 shrink-0"
      />

      <span className="min-w-0 truncate whitespace-nowrap">
        Tarea
      </span>
    </button>
  )
}