import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

export interface UserForm{

  username:string

  name:string

  email:string

  roleId:string

  level?:"GENERAL" | "OPERARIO" | "SUPERVISOR" | null

  icon:EntityIcon

  color:string

  active:boolean

}