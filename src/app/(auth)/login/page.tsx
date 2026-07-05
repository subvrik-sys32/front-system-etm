"use client"

import Image from "next/image"

import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex items-center justify-center relative overflow-hidden">

      {/* ambient background */}
      <div className="absolute inset-0">
        <div className="absolute top-50 left-1/2 -translate-x-1/2 w-150 h-150 bg-white/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-50 right-50 w-125 h-125 bg-white/5 blur-[140px] rounded-full" />
      </div>

      {/* container */}
      <div className="relative w-full max-w-5xl px-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden bg-white/2 backdrop-blur-xl shadow-2xl">

          {/* LEFT SIDE */}
          <div className="hidden lg:flex flex-col justify-between p-10 border-r border-white/10 bg-linear-to-br from-[#0A0A0A] to-[#050505]">

            <div>

              <Image
                src="/icon.svg"
                alt="ETM SAC"
                width={220}
                height={60}
                priority
                className="h-21 w-auto"
              />

              <p className="mt-4 text-sm text-neutral-500">
                Sistema de Producción
              </p>

            </div>

            <div className="space-y-3">
              <p className="text-xs text-neutral-600">
                Control de proyectos · tareas · procesos · producción
              </p>

              <div className="h-px w-full bg-white/5" />

              <p className="text-[11px] text-neutral-600">
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