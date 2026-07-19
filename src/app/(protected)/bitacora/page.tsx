"use client"

import { usePageTitle } from "@/shared/responsive/navigation/hooks/use-page-title"
import { ActivityLogPageContent } from "@/features/activity-log/components/activity-log-page-content"

export default function BitacoraPage() {

  usePageTitle("Bitácora")

  return (

    <main className="flex flex-col bg-[#050505] text-white select-none tablet:h-full">

      <ActivityLogPageContent />

    </main>

  )

}