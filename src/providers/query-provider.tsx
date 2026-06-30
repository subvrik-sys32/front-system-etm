"use client"

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import {
  useState,
} from "react"

type Props = {
  children: React.ReactNode
}

export function QueryProvider({
  children,
}: Props) {

  const [queryClient] =
    useState(
      () =>
        new QueryClient({

          defaultOptions: {

            queries: {

              staleTime: 1000 * 60,

              gcTime: 1000 * 60 * 5,

              refetchOnWindowFocus: false,

              retry: 1,

            },

          },

        }),
    )

  return (

    <QueryClientProvider
      client={queryClient}
    >

      {children}

    </QueryClientProvider>

  )

}