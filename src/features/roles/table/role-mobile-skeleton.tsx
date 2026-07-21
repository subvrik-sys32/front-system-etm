"use client"

// Skeleton mobile de Roles -- coincide con el contenido real: mismo
// stack (label chico + píldora de color a ancho completo) que
// RoleMobileCard, en vez de una forma genérica adivinada. Vive en
// archivo aparte pero en la misma carpeta que role-mobile-card.tsx,
// igual que project-mobile-skeleton.tsx / project-mobile-card.tsx.
//
// Sin wrapper propio con gap a propósito: esto se inserta DENTRO del
// mismo "space-y-3" que ya envuelve las cards reales (ver
// role-permissions-page-content.tsx) -- envolverlo acá también
// hubiera duplicado el espaciado durante la carga.
function SkeletonRoleMobileCard({ opacity }: { opacity: number }) {
  return (
    <article
      className="overflow-hidden rounded-xl bg-white/2"
      style={{ opacity }}
    >
      <div className="flex animate-pulse flex-col gap-2 px-3 py-3">
        <span className="h-3 w-16 rounded bg-white/10" />
        <span className="block h-8 w-full rounded-full bg-white/6" />
      </div>
    </article>
  )
}

const OPACITIES = [1, 0.85, 0.7, 0.55, 0.4]

export function RoleMobileSkeleton() {
  return (
    <>
      {OPACITIES.map((opacity, index) => (
        <SkeletonRoleMobileCard key={index} opacity={opacity} />
      ))}
    </>
  )
}
