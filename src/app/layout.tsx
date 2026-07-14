import type {
  Metadata,
} from "next"

import {
  Geist,
} from "next/font/google"

import "./globals.css"

import {
  ApiClientProvider,
} from "@/lib/api-client-provider"

import {
  QueryProvider,
} from "@/providers/query-provider"

import {
  Sonner,
} from "@/components/ui/sonner"

import{
  RealtimeProvider,
}from"@/shared/realtime/realtime-provider"

import {
  getInitialBreakpoint,
} from "@/shared/responsive/get-initial-breakpoint"

import {
  ResponsiveProvider,
} from "@/shared/responsive/responsive-context"

const geist =
  Geist({
    subsets: ["latin"],
  })

export const metadata: Metadata = {
  title: "ETM PROD",
  description:
    "ETM SAC Production System",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const initialBreakpoint = await getInitialBreakpoint()

  return (

    <html lang="es" className="h-full overflow-hidden">

      <body className={`${geist.className} h-full overflow-hidden`}>

        <ApiClientProvider />

        <QueryProvider>

          <RealtimeProvider>

            <ResponsiveProvider initialBreakpoint={initialBreakpoint}>

              <div className="flex h-full min-h-0 flex-col overflow-hidden">

                {children}

              </div>

            </ResponsiveProvider>

          </RealtimeProvider>

        </QueryProvider>

        <Sonner />

      </body>

    </html>

  )

}