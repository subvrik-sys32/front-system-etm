"use client"

// Roles ahora tiene dos formas completamente distintas según el
// breakpoint (ver role-permissions-page-content.tsx): en desktop es
// una fila plana (punto de color + texto) dentro del aside; en
// mobile es una card de dos pisos (label + píldora de color a ancho
// completo), igual que UserMobileCard. Un solo skeleton ya no
// alcanza para calcar los dos -- de ahí los dos de acá abajo.

// ---- Desktop: fila plana, como RoleDesktopRow ----

function SkeletonRoleDesktopRow() {
  return (
    <div className="flex w-full items-center justify-between gap-3 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="size-2.5 shrink-0 rounded-full bg-white/10" />
        <span className="h-4 w-28 rounded bg-white/10" />
      </div>
    </div>
  )
}

export function RolesListSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2.5 p-2 pr-3.5">
      {[0, 1, 2, 3, 4].map((index) => (
        <SkeletonRoleDesktopRow key={index} />
      ))}
    </div>
  )
}

// ---- Mobile: card de dos pisos, como RoleMobileRow ----

function SkeletonRoleMobileCard() {
  return (
    <article className="overflow-hidden rounded-xl bg-white/2">
      <div className="flex items-center justify-between gap-2.5 px-3 py-3">
        <span className="h-3 w-16 rounded bg-white/10" />
      </div>

      <div className="px-3 pb-3">
        <span className="block h-8 w-full rounded-full bg-white/6" />
      </div>
    </article>
  )
}

export function RolesMobileSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      {[0, 1, 2, 3, 4].map((index) => (
        <SkeletonRoleMobileCard key={index} />
      ))}
    </div>
  )
}

// ---- Panel de Permisos (sin cambios: mismas cards en mobile y
// desktop, solo cambia el contenedor exterior en page-content, no
// esto) ----

function SkeletonPermissionToggle({
  opacity,
}: {
  opacity: number
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5"
      style={{ opacity }}
    >
      <span className="size-4.5 shrink-0 rounded-md bg-white/4" />
      <span className="h-3.5 w-24 rounded bg-white/8" />
    </div>
  )
}

function SkeletonPermissionGroup({
  rows,
}: {
  rows: number
}) {
  return (
    <section className="rounded-2xl bg-white/2 p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="h-3 w-28 rounded bg-white/10" />
        <div className="h-6 w-20 rounded-full bg-white/5" />
      </header>

      <div className="grid grid-cols-1 gap-1 tablet:grid-cols-2 desktop:grid-cols-3">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonPermissionToggle
            key={index}
            opacity={Math.max(1 - index * 0.14, 0.3)}
          />
        ))}
      </div>
    </section>
  )
}

export function RolePermissionsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 pr-3">
      <SkeletonPermissionGroup rows={4} />
      <SkeletonPermissionGroup rows={3} />
      <SkeletonPermissionGroup rows={5} />
    </div>
  )
}