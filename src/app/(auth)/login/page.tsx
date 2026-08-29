"use client"

import Image from "next/image"
import { useRef } from "react"

import { LoginForm } from "@/features/auth/components/login-form"

import { ThemeToggle } from "@/shared/theme/theme-toggle"
import {
  ProductionVisual,
  type ParticleEngineHandle,
} from "@/shared/ui/visual/production-visual"

export default function LoginPage() {
  const visualRef = useRef<ParticleEngineHandle>(null)

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-y-auto bg-background px-4 py-4 text-foreground select-none hide-scrollbar tablet:px-6">
      {/* Theme */}
      <div className="absolute right-4 top-4 z-30 tablet:right-6 tablet:top-6">
        <ThemeToggle variant="icon" className="size-9 rounded-full bg-chrome text-muted-foreground shadow-xs backdrop-blur-xl hover:bg-chrome hover:text-foreground" />
      </div>

      {/* Login Card: w-full max-w-[360px] en móvil/tablet y max-w-4xl en laptop */}
      <section className="relative w-full max-w-90 tablet:max-w-95 laptop:max-w-4xl overflow-hidden rounded-2xl bg-card shadow-xs backdrop-blur-xl">

        {/* Grid adaptable */}
        <div className="relative grid min-h-105 grid-cols-1 laptop:grid-cols-[1.1fr_0.9fr]">

          {/* LEFT CONTAINER (Oculto en móvil, visible solo en laptop con el átomo) */}
          <div className="relative hidden min-w-0 overflow-hidden laptop:flex laptop:flex-col p-3">

            <div className="relative size-full overflow-hidden rounded-xl bg-[#0a0a0a] flex flex-col justify-between p-7 laptop:p-8">

              {/* Esquinas técnicas decorativas */}
              <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t-2 border-l-2 border-accent/40 pointer-events-none z-20" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t-2 border-r-2 border-accent/40 pointer-events-none z-20" />
              <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b-2 border-l-2 border-accent/40 pointer-events-none z-20" />
              <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b-2 border-r-2 border-accent/40 pointer-events-none z-20" />

              {/* El átomo de fondo — ref conectado al form para
                  romper/armar las partículas según lo que pase en el login */}
              <div className="absolute inset-0">
                <ProductionVisual ref={visualRef} />
              </div>
            </div>

          </div>

          {/* RIGHT (Formulario: en móvil incluye el logo arriba y diseño estrecho) */}
          <div className="flex min-w-0 items-center justify-center p-6 tablet:p-7 laptop:p-8">
            <div className="w-full max-w-70 tablet:max-w-75">

              {/* Logo visible SOLAMENTE en móvil/tablet cuando el lado izquierdo está oculto */}
              <div className="mb-5 flex flex-col items-center text-center laptop:hidden">
                <div className="relative h-15 w-15">
                  <Image src="/icon.svg" alt="ETM SAC" fill priority draggable={false} className="select-none object-contain" />
                </div>
              </div>

              {/* Títulos habituales para laptop */}
              <div className="mb-5 hidden laptop:block text-left">
                <h1 className="text-xl font-semibold tracking-[-0.035em] text-foreground">
                  Bienvenido
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accede al sistema de producción
                </p>
              </div>

              <LoginForm
                onFieldActivity={() => visualRef.current?.disturb()}
                onLoginSuccess={() => visualRef.current?.assemble()}
              />

              <p className="mt-5 text-center text-[9px] tracking-wide text-muted-foreground/60">
                ETM SAC · Sistema interno
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}