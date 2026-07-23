"use client"

import { Activity } from "lucide-react"

import type { ProcessTask } from "../../types/process.types"

import {
  EntityExpandedContent,
  EntityExpandedHeader,
  EntityExpandedRow,
  EntityExpandedSection,
} from "@/shared/ui/entity-expanded-row"

import { KpiCarousel } from "@/shared/ui/mini-card/kpi-carousel"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { getProcessProgress } from "../../selectors/get-process-progress"

import { ProcessProductionCard } from "./cards/process-production-card"
import { ProcessMaterialCard } from "./cards/process-material-card"
import { ProcessPaintCard } from "./cards/process-paint-card"
import { ProcessAssemblyCard } from "./cards/process-assembly-card"
import { ProcessDispatchCard } from "./cards/process-dispatch-card"
import { ProcessTimeCard } from "./cards/process-time-card"
import { ProcessProgressCard } from "./cards/process-progress-card"
import { ProcessCommentsPanel } from "./comments/process-comments-panel"

type Props={
  processTask:ProcessTask
}

const PROGRESS_COLOR = "#22C55E"

export function ProcessExpandedRow({
  processTask,
}:Props){

  const { isMobile } = useResponsive()

  const processCode=
    processTask.workflowStep?.processCode

  const workflowStepId=
    processTask.workflowStep?.id

  const isMaterialProcess=
    processCode==="CT"||
    processCode==="PL"||
    processCode==="SD"

  const isPaintProcess=
    processCode==="PT"

  const isAssemblyProcess=
    processCode==="EN"

  const isDispatchProcess=
    processCode==="DS"

  const cardSize = isMobile ? "large" : "default"

  const { percent, statusLabel } =
    getProcessProgress(processTask)

  const cards: React.ReactNode[] = [

    ...(isMaterialProcess
      ? [
          <ProcessProductionCard
            key="production"
            size={cardSize}
            processTask={processTask}
          />,
          <ProcessMaterialCard
            key="material"
            size={cardSize}
            processTask={processTask}
          />,
        ]
      : []),

    ...(isPaintProcess
      ? [
          <ProcessProductionCard
            key="production"
            size={cardSize}
            processTask={processTask}
          />,
          <ProcessPaintCard
            key="paint"
            size={cardSize}
            processTask={processTask}
          />,
        ]
      : []),

    ...(isAssemblyProcess
      ? [
          <ProcessAssemblyCard
            key="assembly"
            size={cardSize}
            processTask={processTask}
          />,
          <ProcessPaintCard
            key="paint"
            size={cardSize}
            processTask={processTask}
            readOnly
          />,
        ]
      : []),

    ...(isDispatchProcess
      ? [
          <ProcessDispatchCard
            key="dispatch"
            size={cardSize}
            processTask={processTask}
          />,
          <ProcessPaintCard
            key="paint"
            size={cardSize}
            processTask={processTask}
            readOnly
          />,
        ]
      : []),

    <ProcessTimeCard
      key="time"
      size={cardSize}
      processTask={processTask}
    />,

    <ProcessProgressCard
      key="progress"
      size={cardSize}
      processTask={processTask}
    />,

  ]

  return(

    <EntityExpandedRow rowId={processTask.task.id}>

      <EntityExpandedHeader
        section="PROCESO OPERATIVO"
        title={processTask.task.reference}
        metric={processTask.workflowStep?.order??"-"}
        metricLabel="orden"
      />

      <KpiCarousel
        cards={cards}
        defaultExpanded
        summary={{
          icon: Activity,
          color: PROGRESS_COLOR,
          label: "Progreso",
          values: [
            { label: "Avance", value: `${percent}%` },
            { label: "Estado", value: statusLabel },
          ],
        }}
      />

      <EntityExpandedContent>

        {workflowStepId&&(

          <EntityExpandedSection
            title="MENSAJES"
          >

            <ProcessCommentsPanel
              workflowStepId={workflowStepId}
            />

          </EntityExpandedSection>

        )}

      </EntityExpandedContent>

    </EntityExpandedRow>

  )

}