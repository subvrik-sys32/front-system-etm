"use client"

import { useState } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import type { TaskView } from "../actions/task-view-toggle"

const STORAGE_KEY = "tasks:view"

function getStoredView(): TaskView {

  if (typeof window === "undefined") {
    return "table"
  }

  const stored =
    window.localStorage.getItem(STORAGE_KEY)

  return stored === "pipeline"
    ? "pipeline"
    : "table"

}

export function useTaskView() {

  const { isMobile } = useResponsive()

  // Preferencia real del usuario, solo relevante en desktop.
  // Nunca se lee ni se sobreescribe cuando isMobile es true,
  // así que la preferencia de escritorio queda intacta para
  // cuando vuelva a abrir el ERP desde su monitor.
  const [desktopView, setDesktopView] =
    useState<TaskView>(getStoredView)

  function updateView(next: TaskView) {

    setDesktopView(next)

    window.localStorage.setItem(STORAGE_KEY, next)

  }

  const view: TaskView =
    isMobile ? "pipeline" : desktopView

  return {
    view,
    setView: updateView,
  }

}