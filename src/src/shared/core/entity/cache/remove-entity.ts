export function removeEntity<
  T extends { id: string },
>(
  items: T[],
  id: string,
): T[] {

  return items.filter(
    item => item.id !== id,
  )

}