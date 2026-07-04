"use client"

import type{
  ReactNode,
}from"react"

import{
  PermissionCode,
}from"@/shared/core/enums/permission-code.enum"

import{
  usePermissions,
}from"../hooks/use-permissions"

type Props={

  permission?:
    PermissionCode

  anyOf?:
    PermissionCode[]

  allOf?:
    PermissionCode[]

  fallback?:
    ReactNode

  children:
    ReactNode

}

export function Can({

  permission,

  anyOf,

  allOf,

  fallback=null,

  children,

}:Props){

  const{

    has,

    hasAny,

    hasAll,

  }=
    usePermissions()

  let allowed=true

  if(permission){

    allowed=
      has(permission)

  }

  if(anyOf){

    allowed=
      hasAny(...anyOf)

  }

  if(allOf){

    allowed=
      hasAll(...allOf)

  }

  if(!allowed){

    return<>{fallback}</>

  }

  return<>{children}</>

}