"use client"

import { useLayoutEffect, useState } from "react"

import type { TaskView } from "../actions/task-view-toggle"

const STORAGE_KEY = "tasks:view"

export function useTaskView() {

  const [view, setView] =
    useState<TaskView>("table")

  useLayoutEffect(() => {

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