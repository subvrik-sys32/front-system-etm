"use client"

import { useUsersDirectory } from "@/features/users/hooks/use-users-directory"

export function useMentionableUsers(){

  // Antes: pegaba a /users/directory por su cuenta, con la MISMA
  // query key (["users","directory"]) que useUsersDirectory —
  // dos implementaciones distintas escribiendo al mismo cache,
  // duplicando la petición de red cada vez que ambos hooks estaban
  // montados a la vez (sidebar + composer de comentarios abierto).
  // User ya tiene los 5 campos que necesita el autocompletado de
  // menciones (id, username, name, avatarUrl, color), así que
  // reutilizamos la misma fuente en vez de una copia paralela.
  const { users } = useUsersDirectory()

  return{
    users,
  }

}