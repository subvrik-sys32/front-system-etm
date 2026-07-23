"use client"

import { useMemo, useState } from "react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

import { AdaptiveActionBar } from "@/shared/responsive/adaptative/adaptive-action-bar"

import { EntityExpandProvider } from "@/shared/ui/entity-table/features/expansion"

import { EntityToolbar } from "@/shared/ui/entity-toolbar/entity-toolbar"
import { EntityToolbarSearch } from "@/shared/ui/entity-toolbar/entity-toolbar-search"

import { FilterBar } from "@/shared/filter/components/filter-bar"

import { ProjectTable, ProjectTableTabla } from "@/features/projects/table"

import { ProjectViewToggle } from "@/features/projects/components/actions/project-view-toggle"
import { useProjectView } from "@/features/projects/hooks/use-project-view"

import { HistoryToggleButton } from "@/shared/history/components/history-toggle-button"
import { ProjectSortButton } from "@/shared/sorting/components/project-sort-button"

import { isProjectCompleted } from "@/features/projects/selectors/is-project-completed"

import { useProjects } from "@/features/projects/hooks/use-projects"
import { useTasks } from "@/features/tasks/hooks/use-tasks"

type Props={
  focusedProjectId?:string
  focusToken?:string
  initialShowHistory?:boolean
}

export function ProjectPageContent({
  focusedProjectId,
  focusToken,
  initialShowHistory=false,
}:Props){

  const { isMobile } = useResponsive()

  const[
    search,
    setSearch,
  ]=useState("")

  const[
    showHistory,
    setShowHistory,
  ]=useState(initialShowHistory)

  const{
    view,
    setView,
  }=useProjectView()

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

    // Mismo patrón que TaskPageContent: vista "tabla" (EntityTable)
    // vive en h-full/min-h-0/overflow-hidden — una sola pantalla, el
    // contenido interno scrollea dentro de su propio contenedor
    // (patrón app fija). Vista "card" fluye libre con su alto real,
    // como el resto de la página. Mobile: siempre libre (fuerza
    // "card"), el <main overflow-y-auto> del AppShell scrollea la
    // página completa.
    <div className={cn(
      "relative mx-auto flex w-full max-w-400 flex-col",
      !isMobile && view === "tabla"
        ? "h-full min-h-0 overflow-hidden"
        : "",
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
              right={

                !isMobile && (

                  <ProjectViewToggle
                    value={view}
                    onChange={setView}
                  />

                )

              }
            />

          }
        />

      </div>

      <div className={cn(
        !isMobile && view === "tabla"
          ? "min-h-0 flex-1 overflow-hidden"
          : "",
      )}>

        <EntityExpandProvider>

          {view==="card"?(

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

          ):(

            <ProjectTableTabla
              projects={projects}
              tasks={tasks}
              loading={loading}
              focusedProjectId={focusedProjectId}
              focusToken={focusToken}
              search={search}
              showHistory={showHistory}
              reorderProjects={reorderProjects}
            />

          )}

        </EntityExpandProvider>

      </div>

    </div>

  )

}