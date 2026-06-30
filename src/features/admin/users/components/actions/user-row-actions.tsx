"use client"

import {
  useState,
} from "react"

import {
  Pencil,
  Trash2,
} from "lucide-react"

import {
  IconAction,
} from "@/shared/ui/actions/icon-action"

import {
  ActionDialog,
} from "@/shared/ui/dialogs/action-dialog/action-dialog"

import {
  UserDialog,
} from "@/features/admin/users/components/dialog/user-dialog"

import {
  useUsers,
} from "@/features/users/hooks/use-users"

import {
  useUserMutations,
} from "@/features/users/hooks/use-user-mutations"

type Props = {

  userId:string

}

export function UserRowActions({

  userId,

}:Props){

  const[
    editOpen,
    setEditOpen,
  ]=useState(false)

  const[
    deleteOpen,
    setDeleteOpen,
  ]=useState(false)

  const {
    users,
  } = useUsers()

  const {
    deleteUser,
  } = useUserMutations()

  const user =
    users.find(
      item =>
        item.id === userId,
    )

  if (!user) {
    return null
  }

  const {
    id,
  } = user

  async function handleDelete(){

    await deleteUser.mutateAsync(
      id,
    )

    setDeleteOpen(false)

  }

  return(

    <>

      <div className="ml-3 flex items-center gap-6">

        <IconAction
          icon={Pencil}
          onClick={()=>
            setEditOpen(true)
          }
        />

        <IconAction
          icon={Trash2}
          variant="danger"
          onClick={()=>
            setDeleteOpen(true)
          }
        />

      </div>

      <UserDialog
        open={editOpen}
        user={user}
        onClose={()=>
          setEditOpen(false)
        }
      />

      <ActionDialog
        open={deleteOpen}
        title="Eliminar usuario"
        description={`Se eliminará "${user.name}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onClose={()=>
          setDeleteOpen(false)
        }
        onConfirm={handleDelete}
      />

    </>

  )

}