import type {
  EntityBase,
} from "@/shared/types/entity-base.types"

export interface Role
  extends EntityBase{

  code:string

  active:boolean

  deletedAt:string | null

  createdAt:string

  updatedAt:string

}

export interface Permission{

  id:string

  code:string

  description:string | null

}