"use client"

import {
  useEffect,
} from "react"

export function useStoreSync(
  key: string,
  rehydrate: () => void
) {

  useEffect(() => {

    const handleStorage = (
      event: StorageEvent
    ) => {

      if (
        event.key === key
      ) {

        rehydrate()

      }

    }

    window.addEventListener(
      "storage",
      handleStorage
    )

    return () => {

      window.removeEventListener(
        "storage",
        handleStorage
      )

    }

  }, [
    key,
    rehydrate,
  ])

}