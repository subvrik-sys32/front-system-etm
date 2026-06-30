import type {
  EntityBase,
} from "@/shared/types/entity-base.types"

export interface Status
  extends EntityBase{

  code:string

  active:boolean

  deletedAt:string | null

  createdAt:string

  updatedAt:string

}