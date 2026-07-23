"use client"

import { useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import type { ProjectView } from "../components/actions/project-view-toggle"

const DEFAULT_VIEW: ProjectView = "card"

function isValidView(value: string | null): value is ProjectView {
  return value === "card" || value === "tabla"
}

export function useProjectView() {
  const { isMobile } = useResponsive()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawView = searchParams.get("view")
  const urlView: ProjectView = isValidView(rawView) ? rawView : DEFAULT_VIEW

  const setView = useCallback((next: ProjectView) => {
    if (!next) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  // Mobile siempre CARD — misma lógica que useTaskView.
  const view: ProjectView = isMobile ? DEFAULT_VIEW : urlView

  return { view, setView }
}