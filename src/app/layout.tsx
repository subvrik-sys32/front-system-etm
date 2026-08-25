import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist } from "next/font/google"

import "./globals.css"

import { ApiClientProvider } from "@/lib/api-client-provider"
import { QueryProvider } from "@/providers/query-provider"
import { Sonner } from "@/components/ui/sonner"
import { RealtimeProvider } from "@/shared/realtime/realtime-provider"
import { ResponsiveProvider } from "@/shared/responsive/responsive-context"
import { ThemeProvider } from "@/shared/theme"

const geist = Geist({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ETM PROD",
  description: "ETM SAC Production System",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // resizes-content (no overlays-content): con overlays-content el teclado
  // flota SOBRE el contenido sin achicar el layout, y el navegador compensa
  // haciendo scroll nativo para llevar el input enfocado a la vista — eso es
  // lo que se sentía como que los inputs de abajo "se corrían" al escribir,
  // reajustándose con cada cambio del teclado predictivo. Con resizes-content
  // el layout se achica de verdad para hacerle espacio al teclado, así que el
  // input queda arriba de él sin necesidad de ese scroll compensatorio. Los
  // hooks de teclado (use-visual-viewport-frame.ts) ya asumían este modo.
  interactiveWidget: "resizes-content",
}

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var key = "etm-theme";
    var mode = localStorage.getItem(key) || "dark";
    var isDark =
      mode === "dark" ||
      (mode === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    var root = document.documentElement;

    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  } catch (error) {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className="dark h-full overflow-hidden"
      suppressHydrationWarning
    >
      <head>
        <Script id="etm-theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>

      <body
        className={`${geist.className} h-full overflow-hidden bg-background text-foreground`}
        style={{
          position: "fixed",
          inset: 0,
        }}
        suppressHydrationWarning
      >
        <ApiClientProvider />

        <QueryProvider>
          <RealtimeProvider>
            <ThemeProvider>
              <ResponsiveProvider initialBreakpoint="desktop">
                <div className="flex h-full min-h-0 flex-col overflow-hidden">
                  {children}
                </div>

                <Sonner />
              </ResponsiveProvider>
            </ThemeProvider>
          </RealtimeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}