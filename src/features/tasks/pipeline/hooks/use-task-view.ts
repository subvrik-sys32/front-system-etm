"use client"

import { useState } from "react"

import type { TaskView } from "../actions/task-view-toggle"

const STORAGE_KEY = "tasks:view"

function getInitialView(): TaskView {

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

  const [view, setView] =
    useState<TaskView>(getInitialView)

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