import { useMemo } from "react"

import { useProjects } from "@/features/projects/hooks/use-projects"
import { isProjectCompleted } from "@/features/projects/selectors/is-project-completed"
import { useTasks } from "@/features/tasks/hooks/use-tasks"

const EMPTY_PROCESS_COUNTS={
  CT:0,
  PL:0,
  SD:0,
  PT:0,
  EN:0,
  DS:0,
}

export type ProcessCounts=typeof EMPTY_PROCESS_COUNTS

export function useSidebarCounts(){

  const{projects}=useProjects()
  const{tasks}=useTasks()

  const projectsCount=useMemo(
    ()=>projects.filter(
      project=>!isProjectCompleted(project),
    ).length,
    [projects],
  )

  const activeTasksCount=useMemo(
    ()=>tasks.filter(
      task=>task.workflowSteps?.some(
        step=>step.status!=="REVIEWED",
      ),
    ).length,
    [tasks],
  )

  const processCounts=useMemo(()=>{

    const counts={...EMPTY_PROCESS_COUNTS}

    for(const task of tasks){

      for(const step of task.workflowSteps??[]){

        if(step.status==="REVIEWED"){
          continue
        }

        if(counts[step.processCode as keyof typeof counts]!==undefined){
          counts[step.processCode as keyof typeof counts]++
        }

      }

    }

    return counts

  },[tasks])

  return{
    projectsCount,
    activeTasksCount,
    processCounts,
  }

}