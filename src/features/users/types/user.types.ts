import { EntityIcon } from "@/shared/constants/entity-icons"

export interface UserRole {

  id:string

  code:string

  name:string

  icon:EntityIcon

  color:string

  active:boolean

}

export interface User{

  id:string

  username:string | null

  name:string

  email:string

  icon:EntityIcon

  color:string

  active:boolean

  deletedAt:string | null

  createdAt:string

  updatedAt:string

  role:UserRole

}