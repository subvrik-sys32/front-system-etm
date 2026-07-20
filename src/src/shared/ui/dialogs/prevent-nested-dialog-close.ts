"use client"

type OutsideInteractionEvent = {
  target: EventTarget | null
  preventDefault: () => void
}

export function preventNestedDialogClose(
  e: OutsideInteractionEvent,
  hasNestedOpen?: boolean,
) {

  if (hasNestedOpen) {
    e.preventDefault()
    return
  }

  const target = e.target as HTMLElement | null

  if (target?.closest('[role="dialog"]')) {
    e.preventDefault()
  }

}