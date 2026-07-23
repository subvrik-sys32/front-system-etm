"use client"

import { useState } from "react"

import type { ProcessView } from "../components/actions/process-view-toggle"

const STORAGE_KEY = "processes:view"

function getStoredView(): ProcessView {

  if (typeof window === "undefined") {
    return "tabla"
  }

  try {

    const stored =
      window.localStorage.getItem(STORAGE_KEY)

    return stored === "card"
      ? "card"
      : "tabla"

  } catch {
    return "tabla"
  }

}

// A diferencia de useTaskView/useProjectView, acá no hace falta
// forzar nada en mobile: ProcessTable ya resuelve su propio caso
// mobile internamente (TaskProcessColumn), sin importar este
// estado — este hook solo decide entre CARD y TABLA en desktop.
export function useProcessView() {

  const [view, setViewState] =
    useState<ProcessView>(getStoredView)

  function setView(next: ProcessView) {

    setViewState(next)

    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Si no se puede persistir, al menos queda el cambio en
      // memoria para esta sesión.
    }

  }

  return {
    view,
    setView,
  }

}