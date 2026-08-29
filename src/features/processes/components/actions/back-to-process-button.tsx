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

import { useHydrated } from "@/shared/hooks/use-hydrated"

import {
  useFocusNavStore,
} from "@/shared/focus/store/focus-nav-store"

import {
  PROCESS_DEFINITIONS,
} from "@/features/processes/constants/process-definitions"

import type {
  ProcessCode,
} from "@/features/tasks/types/task.types"

/**
 * Origen proceso → proceso.
 *
 * Exclusivo frente a:
 * process-origin-task-id
 */
export const PROCESS_ORIGIN_CODE_KEY =
  "process-origin-code"

/**
 * Task que debe volver a enfocarse
 * al entrar al proceso destino.
 */
export const PROCESS_ORIGIN_FOCUS_TASK_KEY =
  "process-origin-focus-task-id"

/**
 * Clave utilizada por ← Tarea.
 *
 * Se limpia cuando la navegación es
 * proceso → proceso.
 */
export const BACK_TO_TASK_ORIGIN_KEY =
  "process-origin-task-id"

function readOriginCode(): string | null {
  if (
    typeof sessionStorage === "undefined"
  ) {
    return null
  }

  return sessionStorage.getItem(
    PROCESS_ORIGIN_CODE_KEY,
  )
}

function readFocusTask(): string | null {
  if (
    typeof sessionStorage === "undefined"
  ) {
    return null
  }

  return sessionStorage.getItem(
    PROCESS_ORIGIN_FOCUS_TASK_KEY,
  )
}

/**
 * Guarda el origen de navegación entre procesos.
 *
 * Proceso A
 *    ↓
 * Proceso B
 *
 * El back de B debe regresar a A,
 * no a la tarea.
 */
export function setProcessNavigationOrigin(
  fromCode: ProcessCode,
  taskId: string,
) {
  if (
    typeof sessionStorage === "undefined"
  ) {
    return
  }

  sessionStorage.setItem(
    PROCESS_ORIGIN_CODE_KEY,
    fromCode,
  )

  sessionStorage.setItem(
    PROCESS_ORIGIN_FOCUS_TASK_KEY,
    taskId,
  )

  /**
   * Cancela el origen ← Tarea.
   *
   * Esto mantiene la regla:
   *
   * proceso → proceso
   *        ↓
   * un solo back
   *        ↓
   * proceso anterior
   */
  sessionStorage.removeItem(
    BACK_TO_TASK_ORIGIN_KEY,
  )

  window.dispatchEvent(
    new Event("entity-origin-cleared"),
  )
}

export function BackToProcessButton() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hydrated = useHydrated()

  const [
    originCode,
    setOriginCode,
  ] = useState<string | null>(null)

  const [
    navigating,
    setNavigating,
  ] = useState(false)

  /**
   * Relee el origen:
   *
   * - al hidratar
   * - al cambiar pathname
   * - al cambiar searchParams
   * - cuando otro componente limpia el origen
   */
  useEffect(() => {
    if (!hydrated) {
      return
    }

    setOriginCode(
      readOriginCode(),
    )

    const onCleared = () => {
      setOriginCode(
        readOriginCode(),
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

  if (!originCode) {
    return null
  }

  const code =
    originCode.toUpperCase() as ProcessCode

  const definition =
    PROCESS_DEFINITIONS[code]

  const label =
    definition?.label ?? code

  const handleClick = () => {
    /**
     * Evita generar dos router.push()
     * si el usuario toca rápidamente.
     */
    if (navigating) {
      return
    }

    setNavigating(true)

    const taskId =
      readFocusTask()

    /**
     * Consumimos el origen ANTES de navegar.
     */
    sessionStorage.removeItem(
      PROCESS_ORIGIN_CODE_KEY,
    )

    sessionStorage.removeItem(
      PROCESS_ORIGIN_FOCUS_TASK_KEY,
    )

    /**
     * El estado visual también se limpia
     * inmediatamente.
     */
    setOriginCode(null)

    /**
     * Ahora sí mostramos el estado de navegación.
     */
    useFocusNavStore
      .getState()
      .start(
        `Abriendo ${label}…`,
      )

    const qs =
      new URLSearchParams()

    qs.set(
      "code",
      code.toLowerCase(),
    )

    /**
     * Si existe taskId lo usamos para
     * re-enfocar la tarea en el proceso destino.
     */
    if (taskId) {
      qs.set(
        "taskId",
        taskId,
      )
    }

    router.push(
      `/processes?${qs.toString()}`,
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
        {label}
      </span>
    </button>
  )
}