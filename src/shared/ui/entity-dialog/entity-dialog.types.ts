import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

export interface EntityForm {

  name: string

  color: string

  icon?: EntityIcon

}

export interface EntityEditorProps {

  value: EntityForm

  onChange: (
    value: EntityForm,
  ) => void

}