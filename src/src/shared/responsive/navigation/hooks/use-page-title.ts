"use client"

import { useEffect } from "react"

import { usePageTitleStore } from "../page-title-store"

export function usePageTitle(title: string) {

  const setTitle = usePageTitleStore(s => s.setTitle)

  useEffect(() => {
    setTitle(title)
    return () => setTitle("")
  }, [title, setTitle])

}