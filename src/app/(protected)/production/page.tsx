"use client"

import { useMemo, useState } from "react"

import { useTasks } from "@/features/tasks/hooks/use-tasks"
import { getWorkflowStep } from "@/features/workflow/selectors/get-workflow-step"

import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { PIPELINE_PROCESS_ORDER } from "@/features/tasks/pipeline/utils/process-columns"

import { ProductionProcessCard } from "@/features/processes/components/production-hub/production-process-card"
import { ProductionHubSkeleton } from "@/features/processes/components/production-hub/production-hub-skeleton"

import type { ProcessTask } from "@/features/processes/types/process.types"

export default function ProductionPage() {

  const { tasks, loading } = useTasks()

  const [expandedCode, setExpandedCode] = useState<string | null>(null)

  // Un vistazo rápido de los 6 procesos — cuánto hay en cola en
  // cada uno. El trabajo real (Iniciar/Completar) sigue viviendo
  // en la página individual de cada proceso (/processes?code=X),
  // a la que se llega tocando una tarea acá adentro.
  const byProcess = useMemo(() => {

    const map = new Map<
      string,
      { processTasks: ProcessTask[]; urgentCount: number }
    >()

    for (const code of PIPELINE_PROCESS_ORDER) {

      const processTasks: ProcessTask[] = tasks

        .filter((task) => task.route.includes(code))

        .map((task) => ({
          task,
          workflowStep: getWorkflowStep(task, code) ?? null,
          paintStep: getWorkflowStep(task, "PT") ?? null,
          inputQuantity: null,
        }))
        .filter((pt) => pt.workflowStep?.status !== "REVIEWED")

      const urgentCount = processTasks.filter(
        (pt) => pt.task.priority.code === "URGENTE",
      ).length

      map.set(code, { processTasks, urgentCount })

    }

    return map

  }, [tasks])

  return (

    <main className="flex flex-col bg-[#050505] px-4 py-5 text-white select-none tablet:px-8 tablet:py-10 laptop:h-full">

      <header className="flex flex-wrap items-start justify-between gap-4">

        {/*
          Título y descripción en la misma línea, separados por un
          punto — mismo tratamiento que TasksPage/ProjectsPage para
          no perder una línea entera de alto en mobile. min-w-0 +
          truncate en la descripción para que en pantallas angostas
          se corte en vez de forzar un wrap que vuelva a sumar alto.
        */}
        <div className="flex min-w-0 flex-1 items-center gap-2">

          <h1 className="shrink-0 text-xl font-bold tracking-widest tablet:text-2xl">
            PRODUCCIÓN
          </h1>

          <span className="hidden h-1 w-1 shrink-0 rounded-full bg-neutral-700 tablet:block" />

          <p className="min-w-0 truncate text-sm text-neutral-500">
            Un vistazo rápido a cada proceso
          </p>

        </div>

      </header>

      <section className="mt-4 flex-1 min-h-0 tablet:mt-6">

        {loading ? (

          <ProductionHubSkeleton />

        ) : (

          <div className="flex flex-col gap-2 pb-4">

            {PIPELINE_PROCESS_ORDER.map((code) => {

              const definition = PROCESS_DEFINITIONS[code]
              const data = byProcess.get(code)

              return (

                <ProductionProcessCard
                  key={code}
                  definition={definition}
                  processTasks={data?.processTasks ?? []}
                  urgentCount={data?.urgentCount ?? 0}
                  expanded={expandedCode === code}
                  onToggle={() =>
                    setExpandedCode((current) =>
                      current === code ? null : code,
                    )
                  }
                />

              )

            })}

          </div>

        )}

      </section>

    </main>

  )

}