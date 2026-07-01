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

import {
  AppLoadingScreen,
} from "@/shared/ui/loading/app-loading-screen"

import{
  RealtimeProvider,
}from"@/shared/realtime/realtime-provider"

function setBootstrapCookie(){

  document.cookie=
    "etm-bootstrapped=1; path=/; max-age=86400; samesite=lax"

}

export function ProtectedLayoutClient({
  children,
  initialMode,
}:{
  children:ReactNode
  initialMode:"init"|"refresh"
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
    bootstrapDone,
    setBootstrapDone,
  ]=
    useState(false)

  const[
    showLoading,
    setShowLoading,
  ]=
    useState(true)

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

        setBootstrapCookie()

        setBootstrapDone(
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

  if(showLoading){

    return(
      <AppLoadingScreen
        isReady={bootstrapDone}
        onComplete={()=>setShowLoading(false)}
        mode={initialMode}
      />
    )

  }

  return(

    <AppShell>

      <RealtimeProvider>

        {children}

      </RealtimeProvider>

    </AppShell>

  )

}