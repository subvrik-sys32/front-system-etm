"use client"

import { useEffect, useLayoutEffect, useState } from "react"

import type { TaskView } from "../actions/task-view-toggle"

const STORAGE_KEY = "tasks:view"

// En el servidor no existe la fase de "pintado", así que ahí
// usamos useEffect (no hace nada, pero no genera warning).
// En el cliente usamos useLayoutEffect (corre antes del pintado,
// evitando el flash de "table").
const useIsomorphicLayoutEffect =
  typeof window !== "undefined"
    ? useLayoutEffect
    : useEffect

export function useTaskView() {

  const [view, setView] =
    useState<TaskView>("table")

  useIsomorphicLayoutEffect(() => {

    const stored =
      window.localStorage.getItem(STORAGE_KEY)

    if (stored === "pipeline") {
      setView("pipeline")
    }

  }, [])

  function updateView(
    next: TaskView,
  ) {

    setView(next)

    window.localStorage.setItem(
      STORAGE_KEY,
      next,
    )

  }

  return {
    view,
    setView: updateView,
  }

}