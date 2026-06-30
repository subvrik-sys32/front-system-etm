import { cookies } from "next/headers"
import { ProtectedLayoutClient } from "./protected-layout-client"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const hasBootstrapped = cookieStore.get("etm-bootstrapped")?.value === "1"

  return (
    <ProtectedLayoutClient initialMode={hasBootstrapped ? "refresh" : "init"}>
      {children}
    </ProtectedLayoutClient>
  )
}