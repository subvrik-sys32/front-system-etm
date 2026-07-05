"use client"

import { useEffect, useMemo, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { useAuthStore } from "@/features/auth/store/auth-store"
import { cn } from "@/shared/utils/utils"
import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { useProjects } from "@/features/projects/hooks/use-projects"

import {
  useTasks,
} from "@/features/tasks/hooks/use-tasks"

import {
  isProjectCompleted,
} from "@/features/projects/selectors/is-project-completed"

import { NAVIGATION } from "./navigation"
import { SidebarHeader } from "./sidebar-header"
import { SidebarSection } from "./sidebar-section"
import { SidebarItem } from "./sidebar-item"
import { SidebarPresence } from "./sidebar-presence"

let hasPrefetched = false

export function AppSidebar() {

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const mode = useSidebarStore(s => s.mode)
  const lastVisibleMode = useSidebarStore(s => s.lastVisibleMode)
  const close = useSidebarStore(s => s.close)

  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)

  const {
    projects,
  } = useProjects()

  const projectsCount =
    useMemo(
      () =>
        projects.filter(
          project =>
            !isProjectCompleted(project),
        ).length,
      [projects],
    )

  const {
    tasks,
  } = useTasks()

  const activeTasksCount =
    useMemo(
      () =>
        tasks.filter(
          task =>
            task.workflowSteps?.some(
              step =>
                step.status !== "REVIEWED",
            ),
        ).length,
      [tasks],
    )

  const leaveTimeout = useRef<NodeJS.Timeout | null>(null)

  const preview = mode === "preview"

  const processCounts = useMemo(() => {

    const counts: Record<string, number> = {
      CT: 0,
      PL: 0,
      SD: 0,
      PT: 0,
      EN: 0,
      DS: 0,
    }

    for (const task of tasks) {

      const steps =
        task.workflowSteps ?? []

      for (const step of steps) {

        if (
          step.status === "REVIEWED"
        ) {
          continue
        }

        if (
          counts[
            step.processCode
          ] !== undefined
        ) {

          counts[
            step.processCode
          ]++

        }

      }

    }

    return counts

  }, [tasks])

  const previewGeometry =
    mode === "preview" ||
    (
      mode === "closed" &&
      lastVisibleMode === "preview"
    )

  // Prefetch de todas las rutas de navegación una sola vez por sesión,
  // para que el click no espere al RSC del servidor.
  useEffect(() => {

    if (hasPrefetched) {
      return
    }

    hasPrefetched = true

    for (const section of NAVIGATION) {
      for (const item of section.items) {
        router.prefetch(item.href)
      }
    }

  }, [router])

  return (

    <aside
      onMouseEnter={() =>
        leaveTimeout.current &&
        clearTimeout(
          leaveTimeout.current,
        )
      }
      onMouseLeave={() => {

        if (!preview) {
          return
        }

        leaveTimeout.current =
          setTimeout(
            close,
            200,
          )

      }}
      className={cn(
        "z-50 flex w-62 flex-col overflow-hidden bg-[#0A0A0A] ring-1 ring-white/5 will-change-transform transform-gpu transition-all duration-200 ease-out",

        previewGeometry
          ? "fixed left-0 top-5 h-[calc(100vh-40px)] rounded-r-2xl border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          : "fixed left-0 top-0 h-screen border-r border-white/5",

        mode === "closed"
          ? "translate-x-[-110%]"
          : "translate-x-0",
      )}
    >

      <SidebarHeader />

      <div className="erp-scrollbar flex-1 overflow-y-auto select-none px-3 py-3">

        {NAVIGATION.map(section => (

          <SidebarSection
            key={section.title}
            title={section.title}
          >

            {section.items.map(item => {

              const [itemPath, itemQuery] =
                item.href.split("?")

              const itemCode =
                itemQuery
                  ?.split("code=")[1]
                  ?.split("&")[0]

              const isActive =
                itemCode
                  ? pathname === itemPath &&
                    searchParams.get("code") === itemCode
                  : pathname === item.href

              const count =
                item.href === "/projects"
                  ? projectsCount
                  : item.href === "/tasks"
                    ? activeTasksCount
                    : itemCode === "ct"
                      ? processCounts.CT
                      : itemCode === "pl"
                        ? processCounts.PL
                        : itemCode === "sd"
                          ? processCounts.SD
                          : itemCode === "pt"
                            ? processCounts.PT
                            : itemCode === "en"
                              ? processCounts.EN
                              : itemCode === "ds"
                                ? processCounts.DS
                                : undefined

              return (

                <SidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive}
                  count={count}
                />

              )

            })}

          </SidebarSection>

        ))}

      </div>

      <SidebarPresence />

      <div className="p-3">

        <div className="rounded-xl bg-white/3 px-3 py-3 hover:bg-white/6 transition-all duration-200">

          <div className="flex items-center gap-2.5 mb-2.5">

            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-white/10 to-white/3 text-sm font-semibold text-white shadow-inner">

              {user?.name?.[0] ?? "?"}

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#0A0A0A]" />

            </div>

            {user ? (

              <p className="truncate text-sm font-semibold text-white leading-tight">
                {user.name}
              </p>

            ) : (

              <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />

            )}

          </div>

          <div className="flex items-center select-none justify-between gap-2">

            {user ? (

              <p className="truncate min-w-0 text-xs text-neutral-500">
                {user.email}
              </p>

            ) : (

              <div className="h-2 w-24 rounded bg-white/5 animate-pulse" />

            )}

            <button
              onClick={() => {

                logout()

                requestAnimationFrame(() => {

                  router.replace(
                    "/login",
                  )

                })

              }}
              className="shrink-0 text-xs px-2 py-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition"
            >
              Salir
            </button>

          </div>

        </div>

      </div>

    </aside>

  )

}