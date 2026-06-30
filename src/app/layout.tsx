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

const geist =
  Geist({
    subsets: ["latin"],
  })

export const metadata: Metadata = {
  title: "SYSTEM ETM",
  description:
    "ETM SAC Production System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <html lang="es">

      <body className={geist.className}>

        <ApiClientProvider />

        <QueryProvider>

          {children}

        </QueryProvider>

        <Sonner />

      </body>

    </html>

  )

}