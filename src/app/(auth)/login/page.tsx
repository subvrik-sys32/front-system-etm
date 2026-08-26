"use client"

import Image from "next/image"

import { LoginForm } from "@/features/auth/components/login-form"

import { ThemeToggle } from "@/shared/theme/theme-toggle"
import { ProductionVisual } from "@/shared/ui/visual/production-visual"

const SHORT = "[@media(max-height:520px)]"

export default function LoginPage() {
  return (
    <main className={`relative flex min-h-dvh w-full items-center justify-center overflow-y-auto bg-background px-4 py-4 text-foreground select-none hide-scrollbar tablet:px-6`}>
      {/* Theme */}
      <div className="absolute right-4 top-4 z-30 tablet:right-6 tablet:top-6">
        <ThemeToggle variant="icon" className="size-9 rounded-full bg-chrome text-muted-foreground shadow-xs backdrop-blur-xl hover:bg-chrome hover:text-foreground" />
      </div>

      {/* Login */}
      <section className={`relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border/40 bg-card shadow-xs backdrop-blur-xl ${SHORT}:max-w-[700px] ${SHORT}:rounded-xl`}>

        <div className={`relative grid min-h-110 grid-cols-1 laptop:grid-cols-[1.1fr_0.9fr] ${SHORT}:grid-cols-2 ${SHORT}:min-h-[340px]`}>
          
          {/* LEFT CONTAINER (Con su propio fondo interno, margenes y esquinas técnicas) */}
          <div className={`relative hidden min-w-0 overflow-hidden laptop:flex laptop:flex-col p-3 ${SHORT}:flex`}>
            
            <div className="relative size-full overflow-hidden rounded-xl bg-background/50 border border-border/20 shadow-inner flex flex-col justify-between p-7 laptop:p-8">
              
              {/* Esquinas técnicas decorativas */}
              <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t-2 border-l-2 border-accent/40 pointer-events-none z-20" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t-2 border-r-2 border-accent/40 pointer-events-none z-20" />
              <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b-2 border-l-2 border-accent/40 pointer-events-none z-20" />
              <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b-2 border-r-2 border-accent/40 pointer-events-none z-20" />

              {/* El átomo de fondo */}
              <div className="absolute inset-0">
                <ProductionVisual />
              </div>

              {/* Contenido superior (Logo y títulos) */}
              <div className="relative z-10">
                <div className="relative h-12 w-12 laptop:h-14 laptop:w-14">
                  <Image src="/icon.svg" alt="ETM SAC" fill priority draggable={false} className="select-none object-contain" />
                </div>

                <p className="mt-4 text-base font-medium tracking-[-0.02em] text-foreground">
                  ETM SAC
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Sistema de Producción
                </p>
              </div>

              {/* Contenido inferior */}
              <div className="relative z-10 max-w-70">
                <div className="mb-3 h-px w-8 bg-accent/80" />

                <p className="text-[11px] leading-5 text-muted-foreground">
                  Control de proyectos · tareas · procesos · producción
                </p>

                <p className="mt-1.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground/60">
                  Sistema interno · v2.0
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className={`flex min-w-0 items-center justify-center p-6 tablet:p-7 laptop:p-8 ${SHORT}:p-5`}>
            <div className="w-full max-w-[320px]">
              <div className={`mb-6 ${SHORT}:mb-4`}>
                <h1 className="text-xl font-semibold tracking-[-0.035em] text-foreground">
                  Bienvenido
                </h1>

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Accede al sistema de producción
                </p>
              </div>

              <LoginForm />

              <p className="mt-6 text-center text-[9px] tracking-wide text-muted-foreground/60">
                ETM SAC · Sistema interno
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}