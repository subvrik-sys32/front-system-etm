import type {
  TaskFormValue,
} from "../../hooks/use-task-form"


export type TaskFormSectionProps = {


  form: TaskFormValue


  update: (
    data: Partial<TaskFormValue>
  ) => void

  projectLocked?: boolean

}