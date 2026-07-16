"use client"

// Skeleton mobile de Usuarios — calco EXACTO de la fila colapsada
// de UserMobileCard (mismo padding px-3 py-3, mismo header con
// label + indicador de estado a la derecha, mismo badge de nombre
// ancho completo + chevron abajo). Igual que ProjectMobileSkeleton,
// la altura sale idéntica a la real sin depender de una altura fija
// adivinada, así no hay salto de layout al terminar de cargar.

function SkeletonUserRow({ opacity }: { opacity: number }) {

  return (

    <div
      className="overflow-hidden rounded-xl bg-white/2"
      style={{ opacity }}
    >

      <div className="flex items-center justify-between gap-2.5 px-3 py-3">

        <span className="h-3 w-24 rounded bg-white/10" />

        <span className="flex items-center gap-1.5">

          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/10" />

          <span className="h-3 w-16 rounded bg-white/8" />

        </span>

      </div>

      <div className="flex items-center gap-2.5 px-3 pb-3">

        <div className="min-w-0 flex-1">

          <span className="block h-8 w-full rounded-full bg-white/6" />

        </div>

        <span className="size-4 shrink-0 rounded bg-white/6" />

      </div>

    </div>

  )

}

const SKELETON_ROWS = [1, 0.85, 0.7, 0.55, 0.4, 0.3]

export function UserMobileSkeleton() {

  return (

    <div className="flex animate-pulse flex-col gap-3">

      {SKELETON_ROWS.map((opacity, i) => (

        <SkeletonUserRow key={i} opacity={opacity} />

      ))}

    </div>

  )

}