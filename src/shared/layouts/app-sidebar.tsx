"use client"

import { useMemo, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuthStore } from "@/features/auth/store/auth-store"
import { cn } from "@/shared/utils/utils"
import { useSidebarStore } from "@/shared/stores/sidebar-store"
import { useProjects } from "@/features/projects/hooks/use-projects"

import {
  useTasks,
} from "@/features/tasks/hooks/use-tasks"

import { NAVIGATION } from "./navigation"
import { SidebarHeader } from "./sidebar-header"
import { SidebarSection } from "./sidebar-section"
import { SidebarItem } from "./sidebar-item"

export function AppSidebar() {

  const pathname = usePathname()
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
    projects.length

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
                step.status !== "COMPLETED" &&
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
          step.status === "REVIEWED" ||
          step.status === "COMPLETED"
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

              const isActive =
                pathname === item.href

              const count =
                item.href === "/projects"
                  ? projectsCount
                  : item.href === "/tasks"
                    ? activeTasksCount
                    : item.href === "/processes/ct"
                      ? processCounts.CT
                      : item.href === "/processes/pl"
                        ? processCounts.PL
                        : item.href === "/processes/sd"
                          ? processCounts.SD
                          : item.href === "/processes/pt"
                            ? processCounts.PT
                            : item.href === "/processes/en"
                              ? processCounts.EN
                              : item.href === "/processes/ds"
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

      <div className="border-t border-white/5 p-3">

        <div className="group flex items-center gap-3 rounded-xl bg-white/3 px-3 py-2 hover:bg-white/6 transition-all duration-200">

          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-white/10 to-white/3 text-xs font-semibold text-white shadow-inner">

            {user?.name?.[0] ?? "?"}

            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400 ring-2 ring-[#0A0A0A]" />

          </div>

          <div className="min-w-0 flex-1">

            {user ? (

              <>
                <p className="truncate text-xs font-semibold text-white leading-tight">
                  {user.name}
                </p>

                <p className="truncate text-[11px] text-neutral-500">
                  {user.email}
                </p>
              </>

            ) : (

              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
                <div className="h-2 w-24 rounded bg-white/5 animate-pulse" />
              </div>

            )}

          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() => {

                logout()

                requestAnimationFrame(() => {

                  router.replace(
                    "/login",
                  )

                })

              }}
              className="text-[11px] px-2 py-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition"
            >
              Salir
            </button>

          </div>

        </div>

      </div>

    </aside>

  )

}