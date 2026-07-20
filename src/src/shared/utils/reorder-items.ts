import {
  arrayMove,
} from "@dnd-kit/sortable"

type ItemWithId = {

  id: string

}

export function reorderItems<
  T extends ItemWithId
>(
  items: T[],
  activeId: string,
  overId: string
) {

  const oldIndex =
    items.findIndex(
      item =>
        item.id === activeId
    )

  const newIndex =
    items.findIndex(
      item =>
        item.id === overId
    )

  if (

    oldIndex === -1 ||

    newIndex === -1 ||

    oldIndex === newIndex

  ) {

    return items

  }

  return arrayMove(
    items,
    oldIndex,
    newIndex
  )

}