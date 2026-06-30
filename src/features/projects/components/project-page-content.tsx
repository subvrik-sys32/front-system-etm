"use client"

import { useMemo, useState } from "react"

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
}

export function ProjectPageContent({
  focusedProjectId,
}:Props){

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

    <div className="mx-auto w-full max-w-400">

      <EntityToolbar
        left={
          <div className="flex flex-wrap items-center gap-2 py-1">

            <EntityToolbarSearch
              value={search}
              onChange={setSearch}
            />

            <FilterBar
              module="projects"
            />

            <ProjectSortButton/>

            <HistoryToggleButton
              count={completedCount}
              active={showHistory}
              onClick={()=>setShowHistory(v=>!v)}
            />

          </div>
        }
      />

      <EntityExpandProvider>

        <ProjectTable
          projects={projects}
          tasks={tasks}
          loading={loading}
          focusedProjectId={focusedProjectId}
          search={search}
          showHistory={showHistory}
          reorderProjects={reorderProjects}
        />

      </EntityExpandProvider>

    </div>

  )

}