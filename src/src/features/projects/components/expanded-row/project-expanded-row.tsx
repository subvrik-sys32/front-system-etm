"use client"

import { AlertTriangle,CheckCircle2,ClipboardList,MessageSquare,Puzzle } from "lucide-react"
import { useMemo, useState } from "react"

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
  EntityExpandedToggle,
} from "@/shared/ui/entity-expanded-row"

import { ProjectTasksList } from "./project-tasks-list"
import { ProjectCommentsPanel } from "../comments/project-comments-panel"
import { CommentHistoryDialog } from "@/features/comments/components/comment-history-dialog"

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

  const [
    activeView,
    setActiveView,
  ] = useState<"tasks" | "comments">("tasks")

  const [
    commentsDialogOpen,
    setCommentsDialogOpen,
  ] = useState(false)

  // En mobile, "Mensajes" abre el diálogo en vez de cambiar la vista
  // inline (el panel completo, con composer + historial, no entra
  // bien apretado en pantalla chica). En desktop se queda igual que
  // antes: cambia activeView y muestra ProjectCommentsPanel ahí mismo.
  const handleViewChange = (
    next: "tasks" | "comments",
  ) => {

    if (isMobile && next === "comments") {
      setCommentsDialogOpen(true)
      return
    }

    setActiveView(next)

  }

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

        <div className="mb-2 flex items-center justify-between select-none">

          <span className="text-xs font-semibold tracking-widest text-neutral-500">
            {activeView === "tasks"
              ? "TAREAS OPERATIVAS"
              : "MENSAJES"}
          </span>

          <EntityExpandedToggle
            value={activeView}
            onChange={handleViewChange}
            fullWidth={isMobile}
            options={[
              {
                value: "tasks",
                label: "Tareas",
                icon: ClipboardList,
                count: totalTasks,
              },
              {
                value: "comments",
                label: "Mensajes",
                icon: MessageSquare,
              },
            ]}
          />

        </div>

        {activeView === "tasks" ? (

          <ProjectTasksList
            projectId={project.id}
            tasks={tasks}
          />

        ) : (

          <ProjectCommentsPanel
            projectId={project.id}
          />

        )}

      </EntityExpandedContent>

      {/* Solo relevante en mobile — en desktop activeView ya
          maneja "Mensajes" mostrando ProjectCommentsPanel inline
          (ver handleViewChange). */}
      <CommentHistoryDialog
        target={{ scope: "project", projectId: project.id }}
        open={commentsDialogOpen}
        onOpenChange={setCommentsDialogOpen}
      />

    </EntityExpandedRow>

  )

}