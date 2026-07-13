"use client"

import { PIPELINE_PROCESS_ORDER } from "../utils/process-columns"

const KPI_SKELETON_COLORS = [
  "#afafaf",
  "#a6c7d4",
  "#EF4444",
  "#22C55E",
]

function SkeletonMiniCard({
  color,
}:{
  color:string
}){

  return(

    <div
      className="flex h-28 flex-col rounded-xl p-4"
      style={{
        background:`linear-gradient(135deg, ${color}20, #101012)`,
      }}
    >

      <div className="mb-3 flex items-center justify-between">

        <span className="h-3 w-16 rounded bg-white/10"/>

        <span className="size-5 rounded bg-white/10"/>

      </div>

      <div className="flex flex-1 gap-4">

        {Array.from({
          length:2,
        }).map((_,i)=>(

          <div
            key={i}
            className="min-w-0 flex-1 border-l border-white/10 pl-3 first:border-l-0 first:pl-0"
          >

            <span className="block h-2.5 w-10 rounded bg-white/8"/>

            <span className="mt-2 block h-4 w-8 rounded bg-white/12"/>

          </div>

        ))}

      </div>

    </div>

  )

}

function SkeletonProcessSummary(){

  return(

    <div className="flex h-16 items-center justify-between rounded-xl bg-white/2 px-4">

      <div className="flex items-center gap-3">

        <span className="size-9 rounded-lg bg-white/8"/>

        <div>

          <span className="block h-2.5 w-12 rounded bg-white/8"/>

          <span className="mt-2 block h-5 w-10 rounded bg-white/12"/>

        </div>

      </div>

      <div className="border-l border-white/10 pl-4">

        <span className="block h-2.5 w-12 rounded bg-white/8"/>

        <span className="mt-2 block h-5 w-8 rounded bg-white/12"/>

      </div>

    </div>

  )

}

const SKELETON_ROWS=[
  1,
  .85,
  .7,
]

function SkeletonCardCompact({
  opacity,
}:{
  opacity:number
}){

  return(

    <div
      className="flex h-11 items-center gap-2.5 rounded-xl bg-white/2 px-3"
      style={{
        opacity,
      }}
    >

      <span className="size-1.5 rounded-full bg-white/15"/>

      <span className="h-3.5 w-9 rounded bg-white/10"/>

      <span className="h-3.5 flex-1 rounded bg-white/8"/>

      <span className="h-5 w-14 rounded-md bg-white/8"/>

    </div>

  )

}

export function TaskPipelineSkeleton(){

  return(

    <div className="w-full animate-pulse">

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">

        {KPI_SKELETON_COLORS.map((color,i)=>(

          <SkeletonMiniCard
            key={i}
            color={color}
          />

        ))}

      </div>

      <div className="flex gap-4 overflow-hidden">

        {PIPELINE_PROCESS_ORDER.map(code=>(

          <div
            key={code}
            className="flex w-72 shrink-0 flex-col gap-3"
          >

            <div className="flex items-center gap-2 border-b-2 border-white/5 pb-2">

              <span className="size-6 rounded-md bg-white/8"/>

              <span className="size-4 rounded bg-white/8"/>

              <span className="h-3.5 w-24 rounded bg-white/8"/>

              <span className="ml-auto h-3.5 w-4 rounded bg-white/5"/>

            </div>

            <SkeletonProcessSummary/>

            <div className="flex flex-col gap-2">

              {SKELETON_ROWS.map((opacity,i)=>(

                <SkeletonCardCompact
                  key={i}
                  opacity={opacity}
                />

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}