"use client"

import {
  useState,
} from "react"

import {
  Loader2,
  Eye,
  EyeOff,
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
    showPassword,
    setShowPassword,
  ]=
    useState(false)

  const[
    success,
    setSuccess,
  ]=useState(false)

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

      setSuccess(true)

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
        className="w-full rounded-xl bg-[#0A0A0A] px-4 py-3.5 text-base outline-none transition-all duration-200 placeholder:text-neutral-600 focus:border-white/15 focus:ring-2 focus:ring-white/5 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="relative">

        <input
          value={password}
          disabled={loading}
          onChange={e=>
            setPassword(
              e.target.value,
            )
          }
          placeholder="Contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          className="w-full rounded-xl bg-[#0A0A0A] px-4 py-3.5 pr-12 text-base outline-none transition-all duration-200 placeholder:text-neutral-600 focus:border-white/15 focus:ring-2 focus:ring-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          disabled={loading}
          onClick={()=>
            setShowPassword(
              value=>!value,
            )
          }
          tabIndex={-1}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
        >

          {showPassword ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}

        </button>

      </div>

      <div className="h-5">

        {error&&(

          <p className="text-sm font-medium text-red-400">

            {error}

          </p>

        )}

      </div>

      <button
        disabled={loading}
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold transition-all duration-200 ${
          success
            ? "bg-emerald-500 text-white"
            : "bg-white text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-300"
        }`}
      >

        {success?(
          <>

            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >

              <path d="M5 13l4 4L19 7"/>

            </svg>

            <span>
              Acceso concedido
            </span>

          </>
        ):loading?(
          <>

            <Loader2
              size={16}
              className="animate-spin"
            />

            <span>
              Verificando credenciales...
            </span>

          </>
        ):(
          "Entrar"
        )}

      </button>

    </form>

  )

}