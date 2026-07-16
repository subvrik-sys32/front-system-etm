"use client"

import { create } from "zustand"

export type DrawerMode =
  | "open"
  | "closed"

export type DrawerVisualState =
  | "visible"
  | "moving-out"
  | "curve-closing"
  | "hidden"
  | "moving-in"

type MobileNavState = {
  mode: DrawerMode
  visualState: DrawerVisualState

  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void

  notifyContentTransitionEnd: () => void
  notifyClipTransitionEnd: () => void
}

function nextVisualState(
  nextMode: DrawerMode,
  current: DrawerVisualState,
): DrawerVisualState {

  if (nextMode === "closed") {

    switch (current) {

      case "hidden":
      case "moving-out":
      case "curve-closing":
        return current

      default:
        return "moving-out"

    }

  }

  switch (current) {

    case "visible":
    case "moving-in":
      return current

    default:
      return "moving-in"

  }

}

export const useMobileNavStore = create<MobileNavState>()((set) => ({

  mode: "closed",

  visualState: "hidden",

  openDrawer: () =>
    set(state => {

      if (state.mode === "open") {
        return state
      }

      return {
        mode: "open",
        visualState: nextVisualState(
          "open",
          state.visualState,
        ),
      }

    }),

  closeDrawer: () =>
    set(state => {

      if (state.mode === "closed") {
        return state
      }

      return {
        mode: "closed",
        visualState: nextVisualState(
          "closed",
          state.visualState,
        ),
      }

    }),

  toggleDrawer: () =>
    set(state => {

      const nextMode: DrawerMode =
        state.mode === "open"
          ? "closed"
          : "open"

      return {
        mode: nextMode,
        visualState: nextVisualState(
          nextMode,
          state.visualState,
        ),
      }

    }),

  notifyContentTransitionEnd: () =>
    set(state => {

      switch (state.visualState) {

        case "moving-in":
          return {
            visualState: "visible",
          }

        case "moving-out":
          return {
            visualState: "curve-closing",
          }

        default:
          return state

      }

    }),

  notifyClipTransitionEnd: () =>
    set(state => {

      if (state.visualState !== "curve-closing") {
        return state
      }

      return {
        visualState: "hidden",
      }

    }),

}))