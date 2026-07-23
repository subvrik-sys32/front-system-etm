"use client"

import { cn } from "@/shared/utils/utils"

type Props = {
  size?: number
  className?: string
}

const BLADE_COUNT = 8

// Spinner de "rayitas" radiales (activity indicator estilo iOS/
// Gemini/Claude) — reemplaza el círculo giratorio (Loader2) que
// antes se usaba en botones de guardar/eliminar/procesar. Cada
// rayita se atenúa en secuencia (animation-delay escalonado) en vez
// de rotar un círculo rígido, que es la diferencia visual clave con
// el spinner viejo.
export function Spinner({
  size = 16,
  className,
}: Props) {

  const blades = Array.from(
    { length: BLADE_COUNT },
    (_, index) => index,
  )

  return (

    <span
      role="status"
      aria-label="Cargando"
      className={cn(
        "relative inline-block shrink-0",
        className,
      )}
      style={{
        width: size,
        height: size,
      }}
    >

      {blades.map(index => {

        const rotation = (360 / BLADE_COUNT) * index

        const delay =
          -((BLADE_COUNT - index) / BLADE_COUNT)

        return (

          <span
            key={index}
            className="absolute left-1/2 top-1/2 rounded-full bg-current spinner-blade"
            style={{
              width: Math.max(size * 0.14, 2),
              height: Math.max(size * 0.32, 4),
              marginLeft: -Math.max(size * 0.14, 2) / 2,
              transformOrigin: "50% 0%",
              transform: `rotate(${rotation}deg) translateY(${size * 0.12}px)`,
              animationDelay: `${delay}s`,
            }}
          />

        )

      })}

    </span>

  )

}