"use client"

import { useMemo, useState } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

import { AdaptiveActionBar } from "@/shared/responsive/adaptative/adaptive-action-bar"

import { EntityExpandProvider } from "@/shared/ui/entity-table/features/expansion"

import { EntityToolbar } from "@/shared/ui/entity-toolbar/entity-toolbar"
import { EntityToolbarSearch } from "@/shared/ui/entity-toolbar/entity-toolbar-search"

import { FilterBar } from "@/shared/filter/components/filter-bar"

import { ProjectTable } from "@/features/projects/table"

import { HistoryToggleButton } from "@/shared/history/components/history-toggle-button"
import { ProjectSortButton } from "@/shared/sorting/components/project-sort-button"

import { isProjectCompleted } from "@/features/projects/selectors/is-project-completed"

import { useProjects } from "@/features/projects/hooks/use-projects"
import { useTasks } from "@/features/tasks/hooks/use-tasks"

type Props={
  focusedProjectId?:string
  focusToken?:string
}

export function ProjectPageContent({
  focusedProjectId,
  focusToken,
}:Props){

  const { isMobile } = useResponsive()

  const[
    search,
    setSearch,
  ]=useState("")

  const[
    showHistory,
    setShowHistory,
  ]=useState(false)

  const{
    projects,
    loading,
    reorderProjects,
  }=useProjects()

  const{
    tasks,
  }=useTasks()

  const completedCount=useMemo(
    ()=>projects.filter(
      project=>
        isProjectCompleted(
          project,
        ),
    ).length,
    [projects],
  )

  return(

    // Mismo patrón que TaskPageContent: en desktop, contenedor fijo
    // con scroll interno acotado (h-full/min-h-0/overflow-hidden).
    // En mobile, sin esas restricciones — el contenido fluye con su
    // alto real y el <main overflow-y-auto> del AppShell lo scrollea
    // como página normal, igual que ya hicimos para Tareas.
    <div className={cn(
      "mx-auto flex w-full max-w-400 flex-col",
      isMobile ? "" : "h-full min-h-0 overflow-hidden",
    )}>

      <div className="shrink-0">

        <EntityToolbar
          left={

            <AdaptiveActionBar
              pinned={
                <EntityToolbarSearch
                  value={search}
                  onChange={setSearch}
                />
              }
              actions={[
                <FilterBar key="filter" module="projects" />,
                <ProjectSortButton key="sort" />,
                <HistoryToggleButton
                  key="history"
                  count={completedCount}
                  active={showHistory}
                  onClick={()=>setShowHistory(v=>!v)}
                />,
              ]}
            />

          }
        />

      </div>

      <div className={cn(
        isMobile ? "" : "min-h-0 flex-1 overflow-hidden",
      )}>

        <EntityExpandProvider>

          <ProjectTable
            projects={projects}
            tasks={tasks}
            loading={loading}
            focusedProjectId={focusedProjectId}
            focusToken={focusToken}
            search={search}
            showHistory={showHistory}
            reorderProjects={reorderProjects}
          />

        </EntityExpandProvider>

      </div>

    </div>

  )

}