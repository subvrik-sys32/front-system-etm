"use client"

function SkeletonRoleRow() {
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
        <SkeletonRoleRow key={index} />
      ))}

    </div>
  )
}

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