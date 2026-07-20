import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

export interface EntityBase {
  id: string
  name: string
  color: string
  code?: string
  icon?: EntityIcon
}