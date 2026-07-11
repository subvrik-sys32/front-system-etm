'use client';

import { EngineeringViewport } from './engineering-viewport';

export const EngineeringPage = () => {
  return (
    <main className="h-full select-none bg-[#050505] px-8 py-10 text-white">
      <section className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-widest">INGENIERÍA</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Centro de gestión y conversión de archivos
            </p>
          </div>
        </header>

        <EngineeringViewport />
      </section>
    </main>
  );
};