"use client"

import type { ProcessTask } from "../../types/process.types"

import {
  EntityExpandedContent,
  EntityExpandedHeader,
  EntityExpandedRow,
  EntityExpandedSection,
} from "@/shared/ui/entity-expanded-row"

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

export function ProcessExpandedRow({
  processTask,
}:Props){

  const processCode=
    processTask.workflowStep?.processCode

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

  return(

    <EntityExpandedRow rowId={processTask.task.id}>

      <EntityExpandedHeader
        section="PROCESO OPERATIVO"
        title={processTask.task.reference}
        metric={processTask.workflowStep?.order??"-"}
        metricLabel="orden"
      />

      <EntityExpandedContent>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {isMaterialProcess&&(
            <>
              <ProcessProductionCard
                processTask={processTask}
              />

              <ProcessMaterialCard
                processTask={processTask}
              />
            </>
          )}

          {isPaintProcess&&(
            <>
              <ProcessProductionCard
                processTask={processTask}
              />

              <ProcessPaintCard
                processTask={processTask}
              />
            </>
          )}

          {isAssemblyProcess&&(
            <>
              <ProcessAssemblyCard
                processTask={processTask}
              />

              <ProcessPaintCard
                processTask={processTask}
              />
            </>
          )}

          {isDispatchProcess&&(
            <>
              <ProcessDispatchCard
                processTask={processTask}
              />

              <ProcessPaintCard
                processTask={processTask}
              />
            </>
          )}

          <ProcessTimeCard
            processTask={processTask}
          />

          <ProcessProgressCard
            processTask={processTask}
          />

        </div>

        <div className="mt-3">

          <EntityExpandedSection
            title="OBSERVACIONES"
          >

            <ProcessCommentsPanel
              taskId={processTask.task.id}
            />

          </EntityExpandedSection>

        </div>

      </EntityExpandedContent>

    </EntityExpandedRow>

  )

}