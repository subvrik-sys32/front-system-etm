"use client"

function SkeletonRoleRow({
  opacity,
}: {
  opacity: number
}) {

  return (

    <div
      className="flex items-center gap-2.5 rounded-xl px-3 py-3"
      style={{ opacity }}
    >

      <span className="size-7 shrink-0 rounded-full bg-white/8" />
      <span className="h-3.5 w-24 rounded bg-white/10" />

    </div>

  )

}

// Misma cantidad de filas "fantasma" que un panel de roles típico
// (4-5 roles) — no hace falta que coincida con el total real, solo
// dar la sensación de una lista mientras carga.
export function RolesListSkeleton() {

  return (

    <div className="flex animate-pulse flex-col gap-2">

      {[1, 0.85, 0.7, 0.55, 0.4].map((opacity, index) => (
        <SkeletonRoleRow key={index} opacity={opacity} />
      ))}

    </div>

  )

}

function SkeletonCheckboxRow({
  opacity,
}: {
  opacity: number
}) {

  return (

    <div
      className="flex items-center gap-3 rounded-xl px-3 py-2"
      style={{ opacity }}
    >

      <span className="size-4 shrink-0 rounded bg-white/10" />
      <span className="h-3.5 w-28 rounded bg-white/8" />

    </div>

  )

}

function SkeletonGroup({
  rows,
}: {
  rows: number
}) {

  return (

    <section className="rounded-2xl bg-white/2 p-4">

      <div className="mb-4 h-3 w-32 rounded bg-white/10" />

      <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2 desktop:grid-cols-3">

        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonCheckboxRow
            key={index}
            opacity={Math.max(1 - index * 0.14, 0.3)}
          />
        ))}

      </div>

    </section>

  )

}

// Calca la forma real del panel de permisos: 3 secciones agrupadas,
// cada una con un título y una grilla de checkboxes — mismo layout
// que renderiza RolePermissionsPageContent una vez cargado, así el
// salto entre skeleton y contenido real es mínimo.
export function RolePermissionsSkeleton() {

  return (

    <div className="flex animate-pulse flex-col gap-5">

      <SkeletonGroup rows={4} />
      <SkeletonGroup rows={3} />
      <SkeletonGroup rows={5} />

    </div>

  )

}