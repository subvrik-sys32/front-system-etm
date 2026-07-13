"use client"

import {
  useEffect,
  useLayoutEffect,
  useState,
} from "react"

import type { TaskView } from "../actions/task-view-toggle"

const STORAGE_KEY = "tasks:view"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined"
    ? useLayoutEffect
    : useEffect

export function useTaskView() {

  const [view, setView] =
    useState<TaskView>("table")

  useIsomorphicLayoutEffect(() => {

    const stored =
      window.localStorage.getItem(
        STORAGE_KEY,
      )

    if (
      stored === "table" ||
      stored === "pipeline"
    ) {

      setView(stored)

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