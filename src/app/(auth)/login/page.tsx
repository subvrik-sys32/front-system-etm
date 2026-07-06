"use client"

import Image from "next/image"

import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {

  return (

    <div className="flex min-h-screen w-full items-center justify-center bg-[#050505] text-white">

      <div className="relative w-full max-w-5xl px-6">

        <div className="overflow-hidden rounded-2xl bg-white/2 shadow-2xl backdrop-blur-xl lg:grid lg:grid-cols-2">

          {/* LEFT SIDE */}

          <div className="hidden border-r border-white/10 bg-linear-to-br from-[#0A0A0A] to-[#050505] p-10 lg:flex lg:flex-col lg:justify-between">

            <div>

              <div className="flex h-28 items-center">

                <Image
                  src="/icon.svg"
                  alt="ETM SAC"
                  width={160}
                  height={160}
                  priority
                  draggable={false}
                  className="block h-20 w-auto select-none object-contain"
                />

              </div>

              <p className="mt-2 text-xl text-neutral-500">
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

          {/* RIGHT SIDE */}

          <div className="flex items-center justify-center p-10">

            <div className="w-full max-w-sm">

              <div className="mb-8 text-center lg:text-left">

                <h2 className="text-xl font-semibold">
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