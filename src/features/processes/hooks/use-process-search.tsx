"use client"

import {
  useMemo,
} from "react"

import {
  normalizeSearch,
} from "@/shared/utils/search"

import {
  processAccess,
} from "../access/process-access"

import type {
  ProcessTask,
} from "../types/process.types"

export function useProcessSearch(
  tasks: ProcessTask[],
  search: string,
) {

  return useMemo(() => {

    const term =
      normalizeSearch(search)

    if (!term) {
      return tasks
    }

    if (term.length < 2) {
      return []
    }

    const isNumeric =
      /^\d+$/.test(term)

    return tasks.filter(item => {

      const task =
        processAccess.task(item)

      const project =
        processAccess.project(item)

      const priority =
        processAccess.priority(item)

      const taskNumber =
        String(task.taskNumber)

      const taskNumberPadded =
        taskNumber.padStart(
          3,
          "0",
        )

      if (isNumeric) {

        return (

          taskNumber === term ||

          taskNumberPadded === term

        )

      }

      const reference =
        normalizeSearch(
          task.reference,
        )

      const client =
        normalizeSearch(
          project.client.name,
        )

      const priorityName =
        normalizeSearch(
          priority.name,
        )

      if (

        reference === term ||

        client === term ||

        priorityName === term

      ) {
        return true
      }

      if (

        reference.startsWith(term) ||

        client.startsWith(term) ||

        priorityName.startsWith(term)

      ) {
        return true
      }

      return (

        reference.includes(term) ||

        client.includes(term) ||

        priorityName.includes(term)

      )

    })

  }, [
    tasks,
    search,
  ])

}