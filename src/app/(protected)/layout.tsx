"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  useRouter,
} from "next/navigation"

import type {
  ReactNode,
} from "react"

import {
  authSession,
} from "@/lib/auth-session"

import {
  authService,
} from "@/features/auth/services/auth.service"

import {
  useAuthStore,
} from "@/features/auth/store/auth-store"

import {
  usePermissionStore,
} from "@/features/permissions/store/permission-store"

import {
  AppShell,
} from "@/shared/layouts/app-shell"

export default function ProtectedLayout({
  children,
}:{
  children:ReactNode
}){

  const router=
    useRouter()

  const setUser=
    useAuthStore(
      state=>state.setUser,
    )

  const setPermissions=
    usePermissionStore(
      state=>state.setPermissions,
    )

  const[
    ready,
    setReady,
  ]=
    useState(false)

  useEffect(()=>{

    async function bootstrap(){

      const token=
        authSession.get()

      if(!token){

        router.replace(
          "/login",
        )

        return

      }

      try{

        const{
          user,
          permissions,
        }=
          await authService.me()

        setUser(
          user,
        )

        setPermissions(
          permissions,
        )

        setReady(
          true,
        )

      }catch{

        authSession.set(
          null,
        )

        router.replace(
          "/login",
        )

      }

    }

    bootstrap()

  },[
    router,
    setUser,
    setPermissions,
  ])

  if(!ready){
    return null
  }

  return(

    <AppShell>

      {children}

    </AppShell>

  )

}