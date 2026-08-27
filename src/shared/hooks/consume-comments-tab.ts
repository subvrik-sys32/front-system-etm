"use client"

/**
 * Consume `tab=comments` del deep-link una vez abierto el dialog.
 * Deja taskId/projectId/code/focus — solo quita tab para que F5 no reabra Mensajes.
 */
type RouterLike = {
  replace: (href: string, options?: { scroll?: boolean }) => void
}

export function consumeCommentsTabParam(
  router: RouterLike,
  pathname: string,
  searchParams: { toString(): string; get(name: string): string | null },
): void {
  if (searchParams.get("tab") !== "comments") return

  const next = new URLSearchParams(searchParams.toString())
  next.delete("tab")

  const query = next.toString()
  router.replace(query ? `${pathname}?${query}` : pathname, {
    scroll: false,
  })
}
