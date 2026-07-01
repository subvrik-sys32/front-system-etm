"use client"

import{
  QueryClient,
}from"@tanstack/react-query"

let queryClient:QueryClient|null=
  null

export function setQueryClient(
  client:QueryClient,
){

  queryClient=
    client

}

export function getQueryClient(){

  if(!queryClient){

    throw new Error(
      "QueryClient not initialized",
    )

  }

  return queryClient

}