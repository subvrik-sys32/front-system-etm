"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useDeepLinkRoute } from "@/shared/focus/deep-link-route"
import { useFocusNavStore } from "@/shared/focus/store/focus-nav-store"

const FOCUS_KEYS = ["taskId", "projectId", "focus", "tab"] as const
const CONSUMED_PREFIX = "etm:deeplink:consumed:"

function isConsumed(key: string): boolean {
  try {
    return sessionStorage.getItem(CONSUMED_PREFIX + key) === "1"
  } catch {
    return false
  }
}

function markConsumed(key: string) {
  try {
    sessionStorage.setItem(CONSUMED_PREFIX + key, "1")
  } catch {
    /*
     * Private mode / quota.
     * El flujo sigue funcionando porque el estado de Zustand
     * continúa siendo la fuente inmediata de navegación.
     */
  }
}

/**
 * Quita params de deep-link.
 *
 * Devuelve:
 * - href limpio si había parámetros que quitar
 * - null si la URL ya estaba limpia
 */
function stripFocusParams(
  pathname: string,
  searchParams: URLSearchParams,
): string | null {
  const next = new URLSearchParams(searchParams.toString())
  let changed = false

  for (const key of FOCUS_KEYS) {
    if (next.has(key)) {
      next.delete(key)
      changed = true
    }
  }

  if (!changed) {
    return null
  }

  const query = next.toString()

  return query
    ? `${pathname}?${query}`
    : pathname
}

/**
 * Limpia inmediatamente el address bar y luego sincroniza
 * la navegación con Next Router.
 */
function applyStrip(
  href: string,
  router: {
    replace: (
      href: string,
      options?: { scroll?: boolean },
    ) => void
  },
) {
  if (typeof window !== "undefined") {
    window.history.replaceState(
      window.history.state,
      "",
      href,
    )
  }

  router.replace(href, {
    scroll: false,
  })
}

/**
 * Captura deep-link UNA sola vez por key.
 *
 * Flujo:
 *
 * URL con deep-link
 *      ↓
 * start()
 *      ↓
 * capture
 *      ↓
 * end() del overlay
 *      ↓
 * begin() del deep-link
 *      ↓
 * strip URL
 *
 * IMPORTANTE:
 * El overlay de navegación se apaga también cuando:
 *
 * - el deep-link ya fue consumido
 * - la navegación llegó sin parámetros
 * - la URL ya estaba limpia
 *
 * Esto evita que "Abriendo..." quede colgado.
 */
export function useDeepLinkCapture() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const begin = useDeepLinkRoute(
    state => state.begin,
  )

  /**
   * Keys ya capturadas durante esta montura.
   */
  const capturedRef = useRef<string | null>(null)

  /**
   * Cuando realmente cambiamos de página,
   * permitimos capturar nuevamente.
   */
  useEffect(() => {
    capturedRef.current = null
  }, [pathname])

  useEffect(() => {
    const taskId =
      searchParams.get("taskId") ??
      undefined

    const projectId =
      searchParams.get("projectId") ??
      undefined

    const focusToken =
      searchParams.get("focus") ??
      undefined

    const tab =
      searchParams.get("tab")

    /**
     * ---------------------------------------------------------
     * SIN DEEP-LINK
     * ---------------------------------------------------------
     *
     * Este caso es importante para los botones de back:
     *
     * start("Abriendo...")
     * router.push("/processes?code=ct")
     *
     * Si por alguna razón no existe taskId/focus/etc.,
     * no debemos dejar el overlay activo.
     */
    if (
      !taskId &&
      !projectId &&
      !focusToken &&
      !tab
    ) {
      useFocusNavStore
        .getState()
        .end()

      return
    }

    /**
     * Una URL con focus UUID tiene prioridad.
     *
     * Para navegación entidad → entidad usamos una key estable.
     */
    const key =
      focusToken ??
      `entity:${taskId ?? ""}:${projectId ?? ""}:tab:${tab ?? ""}`

    /**
     * ---------------------------------------------------------
     * YA CAPTURADO EN ESTA MONTURA
     * ---------------------------------------------------------
     */
    if (capturedRef.current === key) {
      /**
       * MUY IMPORTANTE:
       *
       * Aunque ya se haya capturado, la navegación
       * debe poder apagar el overlay.
       */
      useFocusNavStore
        .getState()
        .end()

      const href = stripFocusParams(
        pathname,
        searchParams,
      )

      if (href) {
        applyStrip(href, router)
      }

      return
    }

    /**
     * ---------------------------------------------------------
     * YA CONSUMIDO EN ESTA SESIÓN
     * ---------------------------------------------------------
     *
     * Este era el bug principal.
     *
     * Antes se hacía:
     *
     *   if (isConsumed(key)) {
     *     applyStrip(...)
     *     return
     *   }
     *
     * pero NUNCA se ejecutaba:
     *
     *   useFocusNavStore.getState().end()
     *
     * Resultado:
     *
     *   "Abriendo Corte..."
     *        ↓
     *   overlay infinito
     */
    if (isConsumed(key)) {
      useFocusNavStore
        .getState()
        .end()

      const href = stripFocusParams(
        pathname,
        searchParams,
      )

      if (href) {
        applyStrip(href, router)
      }

      return
    }

    /**
     * ---------------------------------------------------------
     * NUEVO DEEP-LINK
     * ---------------------------------------------------------
     */

    capturedRef.current = key

    markConsumed(key)

    /**
     * La navegación externa ya terminó:
     *
     * "Abriendo..."
     *        ↓
     * destino montado
     *        ↓
     * apagar overlay
     */
    useFocusNavStore
      .getState()
      .end()

    /**
     * Inicia el flujo interno de deep-link.
     */
    begin({
      taskId,
      projectId,
      focusToken,
      tab,
      key,
    })

    /**
     * Limpia inmediatamente los parámetros
     * del address bar.
     */
    const href = stripFocusParams(
      pathname,
      searchParams,
    )

    if (href) {
      applyStrip(href, router)
    }
  }, [
    searchParams,
    router,
    pathname,
    begin,
  ])
}