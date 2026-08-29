"use client"

import { useEffect, useState } from "react"

import { LoadingBackground } from "./loading-background"

type Props = {
  isReady?: boolean
  onComplete?: () => void
}

export function AppLoadingScreen({
  isReady = false,
  onComplete,
}: Props) {
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isReady) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 92) return prev
        const remaining = 92 - prev
        const step = Math.max(0.5, remaining * 0.08)
        return Math.min(92, prev + step)
      })
    }, 120)

    return () => clearInterval(interval)
  }, [isReady])

  useEffect(() => {
    if (!isReady) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return Math.min(100, prev + 4)
      })
    }, 16)

    return () => clearInterval(interval)
  }, [isReady])

  useEffect(() => {
    if (progress < 100 || !onComplete) return
    const timeout = setTimeout(onComplete, 250)
    return () => clearTimeout(timeout)
  }, [progress, onComplete])

  return (
    <div className="fixed inset-0 z-9999 flex min-h-dvh flex-col items-center justify-center overflow-hidden select-none bg-background">
      {/* Keyframes propios para que los puntitos tengan más recorrido y
          "energía" que el animate-bounce por defecto de Tailwind (cuya
          amplitud es fija y bastante sutil). */}
      <style>{`
        @keyframes loadingDotBounce {
          0%, 80%, 100% {
            transform: translateY(0) scale(0.85);
          }
          40% {
            transform: translateY(-7px) scale(1.15);
          }
        }
        .loading-dot {
          animation: loadingDotBounce 0.9s ease-in-out infinite;
        }

        /* Rayo (M) del logo: pulso CONTINUO, sin zonas apagadas — se
           mantiene "vivo" mientras el componente esté montado, es decir,
           exactamente lo que dure la carga (arranca al montar la pantalla
           de carga, se corta al desmontarla cuando termina onComplete).
           - .bolt-glow: copia difuminada del mismo polígono, detrás, que
             respira en opacidad/tamaño — el "resplandor".
           - .bolt-shape: el polígono real del logo, con un brillo que
             sube y baja en sync — el trazo "chispea" sin apagarse.
        */
        @keyframes boltGlowPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }
        @keyframes boltFlashPulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.45); }
        }
        .bolt-glow {
          transform-box: fill-box;
          transform-origin: center;
          filter: blur(8px);
          animation: boltGlowPulse 1.7s ease-in-out infinite;
        }
        .bolt-shape {
          transform-box: fill-box;
          transform-origin: center;
          animation: boltFlashPulse 1.7s ease-in-out infinite;
        }

        :root {
          --bolt-color: #d97706; /* amber-600: dorado uniforme para rayo y glow en light */
        }
        .dark {
          --bolt-color: #fcbd16; /* dark: se mantiene el amarillo vivo original del logo */
        }
      `}</style>

      <LoadingBackground />

      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center">
          <svg
            viewBox="0 0 211.19 135.1"
            className="block h-full w-full overflow-visible"
            role="img"
            aria-label="Logo ETM SAC"
          >
            {/* Resplandor: misma forma del rayo, difuminada, detrás.
                Usa --bolt-color, la misma variable que el rayo real, para
                que en light theme sea un dorado uniforme (en dark se
                mantiene el amarillo vivo original). */}
            <polygon
              className="bolt-glow"
              fill="var(--bolt-color)"
              points="140.35 0 140.35 0 166.82 85.22 182.9 35.87 211.19 135.1 189.86 135.1 179.24 93.14 154.72 135.1 140.35 0"
            />

            {/* Letras ETM en azul (estáticas) */}
            <path
              fill="#266cae"
              d="M121.47,41.51v27.05s-21,0-21,0v66.21s-27.41,0-27.41,0v-66.56h-40.42c-2.84,0-5.14,2.3-5.14,5.14v.1c0,2.42,1.96,4.38,4.38,4.38h18.4v20.62h-19.79c-2.64,0-4.78,2.14-4.78,4.78v.08c0,2.64,2.14,4.78,4.78,4.78l19.85-.12v26.7l-25.91.12c-13.49,0-24.43-10.94-24.43-24.43v-43.86c0-13.79,11.18-24.97,24.97-24.97h96.5Z"
            />
            <polygon
              fill="#266cae"
              points="107.94 135.09 132.96 135.1 146.37 96.04 140.64 41.8 107.94 135.09"
            />

            {/* Rayo real, encima, con flash de brillo */}
            <polygon
              className="bolt-shape"
              fill="var(--bolt-color)"
              points="140.35 0 140.35 0 166.82 85.22 182.9 35.87 211.19 135.1 189.86 135.1 179.24 93.14 154.72 135.1 140.35 0"
            />
          </svg>
        </div>

        <div className="mt-1 flex h-5 items-center justify-center gap-2">
          {/* Cyan/primary del tema — legible en light y dark */}
          <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-primary dark:text-amber-300">
            Cargando
          </span>

          <div className="flex h-full items-center gap-1">
            {[0, 1, 2].map(dot => (
              <span
                key={dot}
                className={`h-1 w-1 rounded-full bg-primary dark:bg-amber-300 ${mounted ? "loading-dot" : ""}`}
                style={{
                  animationDelay: `${dot * -0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}