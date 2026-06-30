"use client"

import {
  useState,
} from "react"

import type {
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core"

import type {
  ProcessTask,
} from "../types/process.types"

type Props = {

  processTasks: ProcessTask[]

}

export function useProcessDnD({

  processTasks,

}: Props) {

  const [
    activeTask,
    setActiveTask,
  ] =
    useState<ProcessTask | null>(
      null,
    )

  function handleDragStart(
    event: DragStartEvent,
  ) {

    const task =
      processTasks.find(
        processTask =>
          processTask.task.id === event.active.id,
      )

    setActiveTask(
      task ?? null,
    )

  }

  function handleDragEnd(
    _event: DragEndEvent,
  ) {

    setActiveTask(
      null,
    )

  }

  function handleDragCancel() {

    setActiveTask(
      null,
    )

  }

  return {

    activeTask,

    handleDragStart,

    handleDragEnd,

    handleDragCancel,

  }

}