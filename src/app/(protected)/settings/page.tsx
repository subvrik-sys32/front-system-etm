"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"

/**
 * /settings redirige al home; Ajustes vive en SettingsDialog (sidebar ⚙).
 * Se mantiene la ruta por bookmarks antiguos.
 */
export default function SettingsPage() {
  usePageTitle("Ajustes")
  const router = useRouter()
  useEffect(() => {
    router.replace("/projects")
  }, [router])
  return null
}
