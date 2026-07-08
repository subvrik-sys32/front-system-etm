"use client"

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import {
  setQueryClient,
} from "@/lib/query-client"

type Props = {
  children: React.ReactNode
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 10,
        refetchInterval: 1000 * 15,  // refetch cada 15s, sin importar foco/stale
        refetchOnWindowFocus: true,
        gcTime: 1000 * 60 * 30,
        retry: 1,
      },
    },
  })
}

// Singleton fuera de React — se crea UNA sola vez por carga de módulo,
// sin importar cuántas veces StrictMode invoque el render.
let browserQueryClient: QueryClient | undefined

function getOrCreateBrowserQueryClient() {
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
    setQueryClient(browserQueryClient)
  }
  return browserQueryClient
}

export function QueryProvider({ children }: Props) {
  const queryClient = getOrCreateBrowserQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}