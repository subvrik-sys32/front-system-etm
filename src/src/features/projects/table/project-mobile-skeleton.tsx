"use client"

// Skeleton mobile de Proyectos — coincide con el contenido real:
// la lista mobile de Proyectos NO tiene barra de KPI (a diferencia
// del pipeline de Tareas), así que el skeleton tampoco debe
// simularla — solo las tarjetas apiladas.
//
// La estructura (px-3 py-3, mismo stack título+código, mismo
// tamaño de badge/fecha/chevron) es un calco EXACTO de la fila
// compacta real de ProjectMobileCard — en vez de una altura fija
// adivinada (que no coincidía), así la altura sale igual siempre,
// sin importar cómo rendericen las fuentes en cada dispositivo.

function SkeletonProjectRow({ opacity }: { opacity: number }) {

  return (

    <div
      className="flex w-full items-center gap-2.5 rounded-xl bg-white/2 px-3 py-3"
      style={{ opacity }}
    >

      <span className="h-4.5 w-9 shrink-0 rounded-md bg-white/10" />

      <div className="min-w-0 flex-1">

        <span className="block h-5 w-2/3 rounded bg-white/10" />

        <span className="mt-0.5 block h-4 w-1/3 rounded bg-white/6" />

      </div>

      <span className="h-3 w-12 shrink-0 rounded bg-white/6" />

      <span className="size-4 shrink-0 rounded bg-white/6" />

    </div>

  )

}

const SKELETON_ROWS = [1, 0.85, 0.7, 0.55, 0.4, 0.3]

export function ProjectMobileSkeleton() {

  return (

    <div className="flex animate-pulse flex-col gap-2">

      {SKELETON_ROWS.map((opacity, i) => (

        <SkeletonProjectRow key={i} opacity={opacity} />

      ))}

    </div>

  )

}