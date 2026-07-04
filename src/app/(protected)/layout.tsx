"use client"

import { ProtectedLayoutClient } from "./protected-layout-client"

function readBootstrapCookie(): boolean {

  if (typeof document === "undefined") {
    return false
  }

  return document.cookie
    .split("; ")
    .some(entry => entry === "etm-bootstrapped=1")

}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const hasBootstrapped =
    readBootstrapCookie()

  return (
    <ProtectedLayoutClient
      initialMode={
        hasBootstrapped ? "refresh" : "init"
      }
    >
      {children}
    </ProtectedLayoutClient>
  )
}