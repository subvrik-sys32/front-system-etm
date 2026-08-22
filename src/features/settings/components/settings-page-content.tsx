"use client"

import { FilesPreferencesSection } from "@/features/user-preferences"

/**
 * Pantalla Ajustes — secciones reales (no dialogs sueltos).
 * Ampliar aquí: apariencia, notificaciones, etc.
 */
export function SettingsPageContent() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-3 py-4 md:px-6 md:py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Ajustes
        </h1>
        <p className="text-sm text-muted-foreground">
          Preferencias de tu cuenta en este dispositivo.
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl bg-foreground/5 p-4 md:p-5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-foreground">Archivos</h2>
          <p className="text-xs text-muted-foreground">
            Cómo se guardan planos DXF y otras descargas.
          </p>
        </div>
        <FilesPreferencesSection />
      </section>
    </div>
  )
}
