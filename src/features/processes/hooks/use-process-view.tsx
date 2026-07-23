"use client"

import { useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

import type { ProcessView } from "../components/actions/process-view-toggle"

const DEFAULT_VIEW: ProcessView = "tabla"

function isValidView(value: string | null): value is ProcessView {
  return value === "card" || value === "tabla"
}

export function useProcessView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawView = searchParams.get("view")
  const view: ProcessView = isValidView(rawView) ? rawView : DEFAULT_VIEW

  const setView = useCallback((next: ProcessView) => {
    if (!next) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  return {
    view,
    setView,
  }
}