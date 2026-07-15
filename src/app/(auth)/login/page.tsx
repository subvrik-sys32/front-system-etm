"use client"

import Image from "next/image"

import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {

  return (

    <div className="flex min-h-dvh w-full items-center justify-center bg-[#050505] text-white select-none">

      {/*
        max-w-4xl en vez de max-w-5xl: la card completa (panel
        izquierdo + formulario) se ve más compacta en desktop,
        menos "estirada" horizontalmente.
      */}
      <div className="relative w-full max-w-4xl px-6">

        <div className="overflow-hidden rounded-2xl bg-white/2 shadow-2xl backdrop-blur-xl laptop:grid laptop:grid-cols-2">

          {/* LEFT SIDE — sin cambios de estructura, solo el
              padding ya ajustado antes. */}

          <div className="hidden border-r border-white/10 bg-linear-to-br from-[#0A0A0A] to-[#050505] p-8 laptop:flex laptop:flex-col laptop:justify-between">

            <div>

              <div className="flex h-20 w-full items-center">

                <div className="relative h-20 w-20 shrink-0">

                  <Image
                    src="/icon.svg"
                    alt="ETM SAC"
                    fill
                    priority
                    draggable={false}
                    className="select-none object-contain"
                  />

                </div>

              </div>

              <p className="text-xl text-neutral-500">
                COMPANY S.A.C.
              </p>

              <p className="mt-4 text-sm text-neutral-500">
                Sistema de Producción
              </p>

            </div>

            <div className="space-y-3">

              <p className="text-xs text-neutral-600">
                Control de proyectos · tareas · procesos · producción
              </p>

              <div className="h-px w-full bg-white/5" />

              <p className="text-xs text-neutral-600">
                Sistema interno versión 1.0
              </p>

            </div>

          </div>

          {/* RIGHT SIDE — card más chica: menos padding vertical
              y el form con max-w-xs en vez de max-w-sm. */}

          <div className="flex items-center justify-center p-6 laptop:p-8">

            <div className="w-full max-w-xs">

              {/*
                Logo visible SOLO en mobile/tablet (laptop:hidden) —
                arriba del título. En desktop el logo ya está en el
                panel izquierdo, así que acá se oculta para no
                duplicarlo.
              */}
              <div className="mb-6 flex justify-center laptop:hidden">

                <div className="relative h-14 w-14 shrink-0">

                  <Image
                    src="/icon.svg"
                    alt="ETM SAC"
                    fill
                    priority
                    draggable={false}
                    className="select-none object-contain"
                  />

                </div>

              </div>

              <div className="mb-6 text-center laptop:text-left">

                <h2 className="text-lg font-semibold">
                  Iniciar sesión
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Accede al sistema de producción
                </p>

              </div>

              <LoginForm />

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}