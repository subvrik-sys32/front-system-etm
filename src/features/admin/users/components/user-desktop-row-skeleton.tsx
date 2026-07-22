"use client"

function SkeletonUserDesktopRow({ opacity }: { opacity: number }) {
  return (
    <div
      className="flex w-full animate-pulse items-center justify-between gap-3 px-3 py-2.5"
      style={{ opacity }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="size-2 shrink-0 rounded-full bg-white/10" />
        <span className="h-8 w-full rounded-full bg-white/6" />
      </div>
    </div>
  )
}

const OPACITIES = [1, 0.85, 0.7, 0.55, 0.4]

export function UserDesktopRowSkeleton() {
  return (
    <>
      {OPACITIES.map((opacity, index) => (
        <SkeletonUserDesktopRow key={index} opacity={opacity} />
      ))}
    </>
  )
}