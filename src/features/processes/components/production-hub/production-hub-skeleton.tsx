"use client"

import { PIPELINE_PROCESS_ORDER } from "@/features/tasks/pipeline/utils/process-columns"

// Skeleton de Production Hub — calco EXACTO de la fila colapsada
// de ProductionProcessCard (mismo gap/padding p-3, misma caja de
// ícono 11x11, label, columnas Total/Urgentes separadas por un
// divisor vertical, chevron a la derecha). Un row por proceso real
// (PIPELINE_PROCESS_ORDER) en vez de una cantidad arbitraria —acá
// sí sabemos de antemano cuántas filas va a haber siempre, a
// diferencia de una lista de usuarios o proyectos que varía—.
// Igual que TaskPipelineSkeleton, se mantiene todo en bones grises
// genéricos (sin colores por proceso) para no insinuar datos que
// todavía no llegaron.

function SkeletonProcessRow({ opacity }: { opacity: number }) {

  return (

    <div
      className="flex w-full items-center gap-3 rounded-2xl bg-white/2 p-3 tablet:gap-4"
      style={{ opacity }}
    >

      <span className="h-11 w-11 shrink-0 rounded-xl bg-white/5" />

      <span className="hidden h-3 w-20 shrink-0 rounded bg-white/10 tablet:block" />

      <div className="flex min-w-0 flex-1 items-center justify-end gap-4 tablet:gap-8">

        <div className="text-right">
          <span className="ml-auto block h-2.5 w-12 rounded bg-white/8" />
          <span className="ml-auto mt-2 block h-4.5 w-6 rounded bg-white/12" />
        </div>

        <span className="h-8 w-px shrink-0 bg-white/10" />

        <div className="text-right">
          <span className="ml-auto block h-2.5 w-14 rounded bg-white/8" />
          <span className="ml-auto mt-2 block h-4.5 w-6 rounded bg-white/12" />
        </div>

      </div>

      <span className="h-4.5 w-4.5 shrink-0 rounded bg-white/6" />

    </div>

  )

}

const SKELETON_OPACITIES = [1, 0.85, 0.7, 0.55, 0.4, 0.3]

export function ProductionHubSkeleton() {

  return (

    <div className="flex animate-pulse flex-col gap-2">

      {PIPELINE_PROCESS_ORDER.map((code, i) => (

        <SkeletonProcessRow
          key={code}
          opacity={SKELETON_OPACITIES[i] ?? 0.3}
        />

      ))}

    </div>

  )

}