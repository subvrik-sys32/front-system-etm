export function replaceEntity<
  T extends { id: string },
>(
  items: T[],
  updated: T,
): T[] {

  return items.map(
    item =>

      item.id === updated.id

        ? updated

        : item,
  )

}