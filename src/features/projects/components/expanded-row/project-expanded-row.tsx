"use client"

import { AlertTriangle,CheckCircle2,ClipboardList,Puzzle } from "lucide-react"
import { useMemo } from "react"

import type { Project } from "../../types/project.types"
import type { Task } from "@/features/tasks/types/task.types"

import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

import { ProcessMiniCard } from "@/shared/ui/mini-card/process-mini-card"
import { KpiCarousel } from "@/shared/ui/mini-card/kpi-carousel"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import {
  EntityExpandedContent,
  EntityExpandedHeader,
  EntityExpandedRow,
  EntityExpandedSection,
} from "@/shared/ui/entity-expanded-row"

import { ProjectTasksList } from "./project-tasks-list"

type Props={
  project:Project
  tasks:Task[]
}

const CRITICAL_PRIORITY_CODE="URGENTE"

export function ProjectExpandedRow({
  project,
  tasks,
}:Props){

  const{
    totalTasks,
    totalPieces,
    criticalPriorityTasks,
    completedTasks,
  }=useMemo(()=>{

    let totalTasks=0
    let totalPieces=0
    let criticalPriorityTasks=0
    let completedTasks=0

    for(const task of tasks){

      if(task.project.id!==project.id){
        continue
      }

      totalTasks++

      totalPieces+=task.pieces

      if(task.priority.code===CRITICAL_PRIORITY_CODE){
        criticalPriorityTasks++
      }

      if(isWorkflowCompleted(task.workflowSteps)){
        completedTasks++
      }

    }

    return{
      totalTasks,
      totalPieces,
      criticalPriorityTasks,
      completedTasks,
    }

  },[
    tasks,
    project.id,
  ])

  const { isMobile } = useResponsive()

  const cards = [

    <ProcessMiniCard
      key="tasks"
      size={isMobile ? "large" : "default"}
      label="Tareas"
      icon={ClipboardList}
      color={"#afafaf"}
      rows={[
        {
          label:"Total",
          value:totalTasks,
        },
        {
          label:"Con ruta",
          value:totalTasks,
        },
      ]}
    />,

    <ProcessMiniCard
      key="pieces"
      size={isMobile ? "large" : "default"}
      label="Piezas"
      icon={Puzzle}
      color={"#a6c7d4"}
      rows={[
        {
          label:"Total",
          value:totalPieces,
        },
        {
          label:"Promedio",
          value:totalTasks>0
            ?Math.round(totalPieces/totalTasks)
            :0,
        },
      ]}
    />,

    <ProcessMiniCard
      key="urgent"
      size={isMobile ? "large" : "default"}
      label="Urgentes"
      icon={AlertTriangle}
      color={"#EF4444"}
      rows={[
        {
          label:"Total",
          value:criticalPriorityTasks,
        },
        {
          label:"Porcentaje",
          value:totalTasks>0
            ?`${Math.round((criticalPriorityTasks/totalTasks)*100)}%`
            :"0%",
        },
      ]}
    />,

    <ProcessMiniCard
      key="progress"
      size={isMobile ? "large" : "default"}
      label="Avance"
      icon={CheckCircle2}
      color={"#22C55E"}
      rows={[
        {
          label:"Finalizadas",
          value:completedTasks,
        },
        {
          label:"Progreso",
          value:totalTasks>0
            ?`${Math.round((completedTasks/totalTasks)*100)}%`
            :"0%",
        },
      ]}
    />,

  ]

  return(

    <EntityExpandedRow rowId={project.id}>

      <EntityExpandedHeader
        section="PIPELINE OPERATIVO"
        title={project.name}
        metric={totalTasks}
        metricLabel="tareas asociadas"
      />

      <KpiCarousel
        cards={cards}
        summary={{
          icon: CheckCircle2,
          color: "#22C55E",
          label: "Avance",
          values: [
            { label: "Finalizadas", value: completedTasks },
            {
              label: "Progreso",
              value: totalTasks>0
                ?`${Math.round((completedTasks/totalTasks)*100)}%`
                :"0%",
            },
          ],
        }}
      />

      <EntityExpandedContent>

        <EntityExpandedSection title="TAREAS OPERATIVAS">

          <ProjectTasksList
            projectId={project.id}
            tasks={tasks}
          />

        </EntityExpandedSection>

      </EntityExpandedContent>

    </EntityExpandedRow>

  )

}