"use client"
import { create } from "zustand"

export type SidebarMode = "open" | "collapsed" | "closed"

export type SidebarVisualState =
  | "visible"
  | "moving-out"
  | "curve-closing"
  | "hidden"
  | "moving-in"

type SidebarStore = {
  mode: SidebarMode
  lastVisibleMode: "open" | "collapsed"
  visualState: SidebarVisualState

  toggleCollapsed: () => void
  toggleClosed: () => void
  advanceLayoutMode: () => void
  collapseIfOpen: () => void
  notifyContentTransitionEnd: () => void
  notifyClipTransitionEnd: () => void
}

function nextVisualState(
  nextMode: SidebarMode,
  current: SidebarVisualState,
): SidebarVisualState {
  if (nextMode === "closed") {
    if (current === "hidden" || current === "moving-out") return current
    return "moving-out"
  }

  if (
    current === "hidden" ||
    current === "curve-closing" ||
    current === "moving-out"
  ) {
    return "moving-in"
  }

  if (current === "moving-in") return "moving-in"

  return "visible"
}

// Helpers puros para legibilidad arquitectónica
export const isSidebarHiddenOrMovingOut = (state: SidebarVisualState) =>
  state === "hidden" || state === "moving-out" || state === "curve-closing"

export const useSidebarStore = create<SidebarStore>()(set => ({
  mode: "open",
  lastVisibleMode: "open",
  visualState: "visible",

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

  collapseIfOpen: () =>
    set(state => {
      if (state.mode !== "open") return state
      return {
        mode: "collapsed",
        lastVisibleMode: "collapsed",
        visualState: nextVisualState("collapsed", state.visualState),
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

  advanceLayoutMode: () =>
    set(state => {
      if (state.mode === "closed") {
        const next = state.lastVisibleMode
        return {
          mode: next,
          visualState: nextVisualState(next, state.visualState),
        }
      }
      const next: SidebarMode = state.mode === "open" ? "collapsed" : "open"
      return {
        mode: next,
        lastVisibleMode: next,
        visualState: nextVisualState(next, state.visualState),
      }
    }),

  notifyContentTransitionEnd: () =>
    set(state => {
      if (state.mode === "closed" && isSidebarHiddenOrMovingOut(state.visualState)) {
        return { visualState: "hidden" }
      }
      if (state.mode !== "closed" && state.visualState === "moving-in") {
        return { visualState: "visible" }
      }
      return state
    }),

  notifyClipTransitionEnd: () =>
    set(state => {
      if (state.mode === "closed" && isSidebarHiddenOrMovingOut(state.visualState)) {
        return { visualState: "hidden" }
      }
      return state
    }),
}))