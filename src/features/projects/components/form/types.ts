export type ProjectFormValue = {
  projectCode: string
  name: string
  clientId: string
  pmId: string
  stageId: string
  statusId: string
  deliveryDate: string | null
}

export type ProjectFormErrors = Partial<
  Record<keyof ProjectFormValue, string>
>

export type ProjectFormSectionProps = {
  form: ProjectFormValue
  update: (value: Partial<ProjectFormValue>) => void
  errors?: ProjectFormErrors
}