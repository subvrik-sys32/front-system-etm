// sidebar-store.ts
"use client"
import { create } from "zustand"

export type SidebarMode = "open" | "collapsed" | "closed"

/**
 * Estado visual del shell desktop.
 *
 * Desacoplado de `mode`: `mode` es la INTENCIÓN funcional del usuario.
 * `visualState` es lo que la UI está haciendo ahora mismo, y es lo único
 * que AppSidebar / AppShell deben leer para renderizar (clip-path, curva,
 * translate, desaparición del sidebar).
 *
 * Las transiciones entre estados visuales están dirigidas exclusivamente por:
 *   - cambios en `mode` (intención del usuario), y
 *   - `notifyContentTransitionEnd` / `notifyClipTransitionEnd`,
 *     invocados por la capa DOM desde eventos nativos `transitionend`.
 *
 * No hay timers de ningún tipo involucrados.
 */
export type SidebarVisualState =
  | "visible"        // asentado: sidebar + curva completamente mostrados
  | "moving-out"      // el contenido anima hacia closed; la curva no se toca
  | "curve-closing"    // el contenido ya llegó a 0; la curva anima su cierre
  | "hidden"          // completamente cerrado: nada visible ni interactivo
  | "moving-in"        // la curva reapareció instantáneo; el contenido anima al target

type SidebarStore = {
  mode: SidebarMode
  lastVisibleMode: "open" | "collapsed"
  visualState: SidebarVisualState

  // Botón 1 (flecha): expande / comprime a solo iconos
  toggleCollapsed: () => void

  // Botón 2: oculta / muestra el sidebar por completo
  toggleClosed: () => void

  // Invocado por la capa DOM al terminar la transición de
  // margin-left/transform del contenido (FASE 1).
  notifyContentTransitionEnd: () => void

  // Invocado por la capa DOM al terminar la transición de
  // clip-path de la curva (FASE 2).
  notifyClipTransitionEnd: () => void
}

function nextVisualState(
  nextMode: SidebarMode,
  current: SidebarVisualState,
): SidebarVisualState {

  if (nextMode === "closed") {
    // Ya oculto o ya en curso de ocultarse: no reiniciar la secuencia.
    if (current === "hidden") return "hidden"
    if (current === "moving-out") return "moving-out"
    if (current === "curve-closing") return "curve-closing"
    return "moving-out"
  }

  // nextMode es "open" o "collapsed"
  if (current === "hidden" || current === "curve-closing") {
    // Estaba oculto, o la curva se estaba cerrando a medias:
    // restaurar la curva instantáneamente y arrancar el movimiento.
    return "moving-in"
  }

  if (current === "moving-in") {
    // Apertura ya en curso, solo cambió el target (open <-> collapsed).
    return "moving-in"
  }

  // "visible" o "moving-out": la curva nunca se tocó, el contenido
  // solo re-apunta a su nuevo target.
  return "visible"
}

export const useSidebarStore = create<SidebarStore>()((set) => ({
  mode: "closed",
  lastVisibleMode: "open",
  visualState: "hidden",

  toggleCollapsed: () =>
    set(state => {
      if (state.mode === "closed") return state

      const next: SidebarMode = state.mode === "open" ? "collapsed" : "open"

      return {
        mode: next,
        lastVisibleMode: next,
        visualState: nextVisualState(next, state.visualState),
      }
    }),

  toggleClosed: () =>
    set(state => {
      const next: SidebarMode =
        state.mode === "closed" ? state.lastVisibleMode : "closed"

      return {
        mode: next,
        lastVisibleMode:
          state.mode === "closed"
            ? state.lastVisibleMode
            : (state.mode as "open" | "collapsed"),
        visualState: nextVisualState(next, state.visualState),
      }
    }),

  notifyContentTransitionEnd: () =>
    set(state => {
      if (state.visualState === "moving-out") return { visualState: "curve-closing" }
      if (state.visualState === "moving-in") return { visualState: "visible" }
      return state
    }),

  notifyClipTransitionEnd: () =>
    set(state => {
      if (state.visualState === "curve-closing") return { visualState: "hidden" }
      return state
    }),
}))