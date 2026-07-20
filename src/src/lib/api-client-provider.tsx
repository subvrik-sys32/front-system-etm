"use client"

import { useEffect } from "react"

import { initApiClient } from "./api-client"

let initialized = false

export function ApiClientProvider() {

  useEffect(() => {

    if (initialized) {
      return
    }

    initialized = true

    initApiClient()

  }, [])

  return null

}