"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface MentionableUser{
  id:string
  username:string|null
  name:string
  avatarUrl:string|null
  color:string
}

export function useMentionableUsers(){

  const query=useQuery({
    queryKey:["users","directory"],
    queryFn:async()=>{
      const response=await api.get<MentionableUser[]>("/users/directory")
      return response.data
    },
    staleTime:60_000,
  })

  return{
    users:query.data??[],
  }

}