import type {
  EntityBase,
} from "@/shared/types/entity-base.types"

export interface Color
  extends EntityBase{

  active:boolean

  deletedAt:string | null

  createdAt:string

  updatedAt:string

}