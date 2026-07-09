"use client"

import {
  ArrowLeft,
} from "lucide-react"

import {
  useRouter,
} from "next/navigation"

import {
  useHydrated,
} from "@/shared/hooks/use-hydrated"

export function BackToTaskButton() {

  const router =
    useRouter()

  const hydrated =
    useHydrated()

  const taskId =
    hydrated
      ? sessionStorage.getItem(
          "process-origin-task-id",
        )
      : null

  if (!taskId) {
    return null
  }

  const handleClick = () => {

    sessionStorage.removeItem(
      "process-origin-task-id",
    )

    router.push(
      `/tasks?taskId=${taskId}`,
    )

  }

  return (

    <button
      onClick={handleClick}
      className="flex h-8 min-w-0 items-center gap-2 rounded-xl bg-white/5 px-4 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white select-none"
    >

      <ArrowLeft className="h-4 w-4 shrink-0" />

      <span className="min-w-0 truncate whitespace-nowrap">

        Tarea

      </span>

    </button>

  )

}