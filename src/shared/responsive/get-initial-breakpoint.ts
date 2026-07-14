// shared/responsive/get-initial-breakpoint.ts
import "server-only"

import { headers } from "next/headers"

import { type BreakpointName } from "./breakpoints"

const MOBILE_UA = /Android.*Mobile|iPhone|iPod|Windows Phone/i
const TABLET_UA = /iPad|Android(?!.*Mobile)|Tablet/i

// Heurística de arranque, SOLO para el primer render server-side.
// El cliente la corrige con matchMedia real apenas hidrata.
export async function getInitialBreakpoint(): Promise<BreakpointName> {

  const ua = (await headers()).get("user-agent") ?? ""

  if (TABLET_UA.test(ua)) {
    return "tablet"
  }

  if (MOBILE_UA.test(ua)) {
    return "mobile"
  }

  return "desktop"

}