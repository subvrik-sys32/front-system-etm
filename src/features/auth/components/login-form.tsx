"use client"

import {
  useState,
} from "react"

import {
  useRouter,
} from "next/navigation"

import {
  authService,
} from "../services/auth.service"

import {
  useAuthStore,
} from "../store/auth-store"

import {
  usePermissionStore,
} from "@/features/permissions/store/permission-store"

export function LoginForm(){

  const router=
    useRouter()

  const setUser=
    useAuthStore(
      s=>s.setUser,
    )

  const setPermissions=
    usePermissionStore(
      s=>s.setPermissions,
    )

  const[
    loading,
    setLoading,
  ]=
    useState(false)

  const[
    email,
    setEmail,
  ]=
    useState("")

  const[
    password,
    setPassword,
  ]=
    useState("")

  const[
    error,
    setError,
  ]=
    useState<string|null>(
      null,
    )

  const onSubmit=async(
    e:React.FormEvent<HTMLFormElement>,
  )=>{

    e.preventDefault()

    setError(null)

    setLoading(true)

    try{

      const result=
        await authService.login(
          email,
          password,
        )

      setUser(
        result.user,
      )

      setPermissions(
        result.permissions,
      )

      router.replace(
        "/projects",
      )

    }catch(err:any){

      setError(

        err?.response?.data?.message ??

        "Error al iniciar sesión",

      )

    }finally{

      setLoading(false)

    }

  }

  return(

    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >

      <input
        value={email}
        onChange={e=>
          setEmail(
            e.target.value,
          )
        }
        placeholder="admin@etmsac.com"
        type="email"
        autoComplete="email"
        className="w-full rounded-xl bg-[#0A0A0A] px-3 py-2 text-sm"
      />

      <input
        value={password}
        onChange={e=>
          setPassword(
            e.target.value,
          )
        }
        placeholder="Password"
        type="password"
        autoComplete="current-password"
        className="w-full rounded-xl bg-[#0A0A0A] px-3 py-2 text-sm"
      />

      {error&&(

        <p className="text-xs text-red-400">

          {error}

        </p>

      )}

      <button
        disabled={loading}
        className="w-full rounded-xl bg-white py-2 text-sm font-semibold text-black disabled:opacity-50"
      >

        {loading
          ?"Ingresando..."
          :"Entrar"}

      </button>

    </form>

  )

}