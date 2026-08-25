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
  // Contrato de teclado (una sola fuente de altura):
  // 1. body position:fixed;inset:0 + h-full en shells → el layout
  //    hereda el viewport, no lo recalcula con dvh.
  // 2. resizes-content → el navegador ACHICA ese viewport cuando
  //    abre el teclado. Cabecera = primer hijo, se queda arriba.
  //    No overlays-content: ese modo flota el teclado y Chrome
  //    scrollea el focused input (salto al escribir).
  // 3. Con teclado abierto el BottomNav se oculta (CompactShell +
  //    useChromeInset). Si no, 80px de nav + teclado dejan la
  //    lista en 0 (hueco negro). El hook solo informa keyboardOpen;
  //    no posiciona nada a mano.
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