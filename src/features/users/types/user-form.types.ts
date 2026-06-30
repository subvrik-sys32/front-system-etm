import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

export interface UserForm{

  username:string

  name:string

  email:string

  roleId:string

  icon:EntityIcon

  color:string

  active:boolean

}