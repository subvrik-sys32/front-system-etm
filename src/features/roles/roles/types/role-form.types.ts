import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

export interface RoleForm{

  code:string

  name:string

  icon:EntityIcon

  color:string

  active:boolean

}