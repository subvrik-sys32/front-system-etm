"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  UserPlus,
} from "lucide-react"

import type {
  User,
} from "@/features/users/types/user.types"

import {
  useUserMutations,
} from "@/features/users/hooks/use-user-mutations"

import {
  useRoles,
} from "@/features/roles/hooks/use-roles"

import {
  FormDialog,
} from "@/shared/ui/dialogs/form-dialog/form-dialog"

import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

import {
  UserDialogHeader,
} from "../user-dialog-header"

import {
  UserFormSection,
} from "../user-form-section"

import {
  UserColorSection,
} from "../user-color-section"

import {
  validateUser,
} from "../../hooks/validate-user"

type Props={

  open:boolean

  onClose:()=>void

  user?:User

}

type UserForm={

  username:string

  name:string

  email:string

  password:string

  confirmPassword:string

  isChangingPassword:boolean

  roleId:string

  icon:EntityIcon

  color:string

  active:boolean

}

function createInitialForm(
  user?:User,
):UserForm{

  return{

    username:
      user?.username ?? "",

    name:
      user?.name ?? "",

    email:
      user?.email ?? "",

    password:"",

    confirmPassword:"",

    isChangingPassword:false,

    roleId:
      user?.role.id ?? "",

    icon:
      user?.icon ?? "user",

    color:
      user?.color ?? "#7C3AED",

    active:
      user?.active ?? true,

  }

}

export function UserDialog({

  open,

  onClose,

  user,

}:Props){

  const{

    roles,

    loading,

  }=
    useRoles()

  const{

    createUser,

    updateUser,

  }=
    useUserMutations()

  const[
    form,
    setForm,
  ]=
    useState<UserForm>(
      createInitialForm(
        user,
      ),
    )

  const[
    attempted,
    setAttempted,
  ]=
    useState(false)

  useEffect(()=>{

    setForm(
      createInitialForm(
        user,
      ),
    )

    setAttempted(false)

  },[
    user,
    open,
  ])

  function update(
    value:Partial<UserForm>,
  ){

    setForm(
      current=>({

        ...current,

        ...value,

      }),
    )

  }

  const selectedRole=
    roles.find(
      role=>
        role.id===form.roleId,
    )

  const isEditing=
    !!user

  const errors=
    validateUser({

      name:form.name,

      username:form.username,

      email:form.email,

      password:form.password,

      confirmPassword:form.confirmPassword,

      roleId:form.roleId,

      isEditing,

      isChangingPassword:form.isChangingPassword,

    })

  const isValid=
    Object.keys(errors).length===0

  const canSave=

    !loading &&

    isValid

  function buildPayload(){

    const{

      confirmPassword,

      isChangingPassword,

      password,

      ...rest

    }=form

    return{

      ...rest,

      ...(password.trim()&&{

        password,

      }),

    }

  }

  function handleClose(){

    setForm(
      createInitialForm(
        user,
      ),
    )

    setAttempted(false)

    onClose()

  }

  async function save(){

    if(!isValid){

      setAttempted(true)

      return

    }

    try{

      const payload=
        buildPayload()

      if(user){

        await updateUser.mutateAsync({

          id:user.id,

          dto:payload,

        })

      }else{

        if(!payload.password){

          console.error(
            "PASSWORD REQUIRED",
          )

          return

        }

        await createUser.mutateAsync(
          payload,
        )

      }

      handleClose()

    }catch(error:any){

      console.error(
        "USER SAVE ERROR",
        error,
      )

      console.error(
        "RESPONSE DATA:",
        error?.response?.data,
      )

    }

  }

  return(

    <FormDialog

      open={open}

      title={
        user
          ? "Editar usuario"
          : "Nuevo usuario"
      }

      icon={UserPlus}

      canSave={canSave}
      saving={
        createUser.isPending ||
        updateUser.isPending
      }
      savingLabel={
        user
          ? "Guardando cambios..."
          : "Creando usuario..."
      }

      saveLabel={
        user
          ? "Guardar cambios"
          : "Crear usuario"
      }

      onClose={handleClose}

      onSave={save}

    >

      <div className="space-y-6">

        <UserDialogHeader

          name={form.name}

          username={form.username}

          email={form.email}

          icon={form.icon}

          color={form.color}

          roles={roles}

          selectedRole={selectedRole}

          onRoleChange={roleId=>

            update({

              roleId,

            })

          }

        />

        <UserFormSection

          name={form.name}

          username={form.username}

          email={form.email}

          password={form.password}

          confirmPassword={form.confirmPassword}

          isEditing={isEditing}

          isChangingPassword={form.isChangingPassword}

          errors={
            attempted
              ? errors
              : undefined
          }

          onChangingPasswordChange={isChangingPassword=>

            update({

              isChangingPassword,

            })

          }

          onNameChange={name=>

            update({

              name,

            })

          }

          onUsernameChange={username=>

            update({

              username,

            })

          }

          onEmailChange={email=>

            update({

              email,

            })

          }

          onPasswordChange={password=>

            update({

              password,

            })

          }

          onConfirmPasswordChange={confirmPassword=>

            update({

              confirmPassword,

            })

          }

        />

        <UserColorSection

          name={form.name}

          icon={form.icon}

          color={form.color}

          onColorChange={color=>

            update({

              color,

            })

          }

        />

      </div>

    </FormDialog>

  )

}