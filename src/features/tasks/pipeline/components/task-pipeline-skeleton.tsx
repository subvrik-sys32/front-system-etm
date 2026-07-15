"use client"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

import { PIPELINE_PROCESS_ORDER, PIPELINE_KPI_COLORS } from "../utils/process-columns"

const KPI_SKELETON_COLORS = Object.values(PIPELINE_KPI_COLORS)

function SkeletonMiniCard({
  color,
  large = false,
}: {
  color: string
  large?: boolean
}) {

  return (

    <div
      className={cn(
        "flex flex-col rounded-xl",
        large ? "h-44 justify-center gap-5 p-6" : "h-28 p-4",
      )}
      style={{
        background: `linear-gradient(135deg, ${color}20, #101012)`,
      }}
    >

      <div className={cn("flex items-center justify-between", !large && "mb-3")}>

        <span className={cn("rounded bg-white/10", large ? "h-3.5 w-20" : "h-3 w-16")} />
        <span className={cn("rounded bg-white/10", large ? "size-6" : "size-5")} />

      </div>

      <div className={cn("flex gap-4", large ? "flex-col gap-4" : "flex-1")}>

        {Array.from({ length: 2 }).map((_, i) => (

          <div
            key={i}
            className={cn(
              !large && "min-w-0 flex-1 border-l border-white/10 pl-3 first:border-l-0 first:pl-0",
              large && "flex items-baseline justify-between",
            )}
          >

            <span className={cn("block rounded bg-white/8", large ? "h-2.5 w-16" : "h-2.5 w-10")} />
            <span className={cn("block rounded bg-white/12", large ? "mt-0 h-6 w-12" : "mt-2 h-4 w-8")} />

          </div>

        ))}

      </div>

    </div>

  )

}

function SkeletonColumnOperator() {

  return (

    <div className="flex h-10 items-center justify-between gap-2 px-1">

      {/* Badge operario */}
      <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-white/4 px-2 py-1">

        <span className="size-4 shrink-0 rounded-full bg-white/10" />

        <span className="h-2.5 w-20 rounded bg-white/8" />

      </div>

      {/* Badge estado */}
      <div className="flex shrink-0 items-center gap-1 rounded-lg bg-white/4 px-2 py-1">

        <span className="size-3 rounded bg-white/10" />

        <span className="h-2.5 w-14 rounded bg-white/8" />

      </div>

    </div>

  )

}

const SKELETON_ROWS = [1, 0.85, 0.7, 0.55]

function SkeletonCardCompact({
  opacity,
}: {
  opacity: number
}) {

  return (

    <div
      className="flex h-12 items-center gap-2.5 rounded-xl bg-white/2 px-3"
      style={{ opacity }}
    >

      <span className="h-3.5 w-9 rounded bg-white/10" />

      <span className="size-1.5 rounded-full bg-white/15" />

      <span className="h-3.5 flex-1 rounded bg-white/8" />

      <span className="h-5 w-14 rounded-md bg-white/8" />

    </div>

  )

}

function SkeletonColumn({
  isMobile,
}: {
  isMobile: boolean
}) {

  return (

    <div className={cn("flex h-full shrink-0 flex-col overflow-hidden", isMobile ? "w-full" : "w-72")}>

      <div className="flex shrink-0 flex-col">

        <div className="flex items-center gap-2 border-b border-white/5 px-3 py-3">

          <span className="size-6 rounded-md bg-white/8" />
          <span className="size-4 rounded bg-white/8" />
          <span className="h-3.5 w-24 rounded bg-white/8" />
          <span className="ml-auto h-3.5 w-4 rounded bg-white/5" />

        </div>

        <div className="border-b border-white/5 px-2 py-1">

          <SkeletonColumnOperator />

        </div>

      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-2 py-2">

        <div className="flex flex-col gap-2">

          {SKELETON_ROWS.map((opacity, i) => (

            <SkeletonCardCompact
              key={i}
              opacity={opacity}
            />

          ))}

        </div>

      </div>

    </div>

  )

}

export function TaskPipelineSkeleton() {

  const { isMobile } = useResponsive()

  if (isMobile) {

    return (

      <div className="flex h-full min-h-0 w-full animate-pulse flex-col overflow-hidden">

        {/*
          Mobile: una sola card grande (igual a la vista real del
          carrusel de KPIs), sin flechas — durante la carga no hay
          nada para navegar todavía. Sin gutter lateral: el carrusel
          real (TaskPipelineHeader) usa px-1, no px-9 — deben
          coincidir para que no haya salto de layout al terminar
          de cargar.
        */}
        <div className="px-1">

          <SkeletonMiniCard
            color={KPI_SKELETON_COLORS[0]}
            large
          />

        </div>

        <div className="mt-2 flex shrink-0 gap-2 px-1 py-2">

          {Array.from({ length: 3 }).map((_, i) => (

            <span
              key={i}
              className="h-9 w-24 shrink-0 rounded-lg bg-white/5"
            />

          ))}

        </div>

        <div className="mt-1 min-h-0 flex-1 overflow-hidden">

          <SkeletonColumn isMobile />

        </div>

      </div>

    )

  }

  return (

    <div className="flex h-full min-h-0 w-full animate-pulse flex-col overflow-hidden">

      <div className="grid shrink-0 grid-cols-2 gap-4 laptop:grid-cols-4">

        {KPI_SKELETON_COLORS.map((color, i) => (

          <SkeletonMiniCard
            key={i}
            color={color}
          />

        ))}

      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-hidden">

        <div className="flex h-full gap-4">

          {PIPELINE_PROCESS_ORDER.map(code => (

            <SkeletonColumn
              key={code}
              isMobile={false}
            />

          ))}

        </div>

      </div>

    </div>

  )

}