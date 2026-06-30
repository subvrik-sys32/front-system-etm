"use client"

import {
  useState,
} from "react"

import {
  Loader2,
} from "lucide-react"

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

    if(loading){
      return
    }

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

        err?.response?.data?.message??

        "Credenciales incorrectas.",

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
        disabled={loading}
        onChange={e=>
          setEmail(
            e.target.value,
          )
        }
        placeholder="admin@etmsac.com"
        type="email"
        autoComplete="email"
        className="w-full rounded-xl border border-white/8 bg-[#0A0A0A] px-3 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-neutral-600 focus:border-white/15 focus:ring-2 focus:ring-white/5 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <input
        value={password}
        disabled={loading}
        onChange={e=>
          setPassword(
            e.target.value,
          )
        }
        placeholder="Contraseña"
        type="password"
        autoComplete="current-password"
        className="w-full rounded-xl border border-white/8 bg-[#0A0A0A] px-3 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-neutral-600 focus:border-white/15 focus:ring-2 focus:ring-white/5 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="h-5">

        {error&&(

          <p className="text-xs font-medium text-red-400">

            {error}

          </p>

        )}

      </div>

      <button
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-black transition-all duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >

        {loading?(
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />

            <span>
              Ingresando...
            </span>
          </>
        ):(
          "Entrar"
        )}

      </button>

    </form>

  )

}