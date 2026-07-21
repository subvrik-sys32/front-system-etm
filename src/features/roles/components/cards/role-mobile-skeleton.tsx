"use client"

function SkeletonRoleCard({
  opacity,
}: {
  opacity: number
}) {

  return (

    <article
      className="overflow-hidden rounded-xl bg-white/2"
      style={{ opacity }}
    >

      <div className="flex flex-col gap-2 px-3 py-3">

        <span className="h-3 w-20 rounded bg-white/10" />

        <span className="block h-8 w-full rounded-full bg-white/6" />

      </div>

    </article>

  )

}

const SKELETON_ROWS = [1, 0.85, 0.7, 0.55, 0.4]

// Espejo de UserMobileSkeleton -- misma cantidad de filas fantasma,
// misma curva de opacidad.
export function RoleMobileSkeleton() {

  return (

    <div className="flex animate-pulse flex-col gap-3">

      {SKELETON_ROWS.map((opacity, index) => (
        <SkeletonRoleCard key={index} opacity={opacity} />
      ))}

    </div>

  )

}