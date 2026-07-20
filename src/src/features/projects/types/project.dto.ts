export interface CreateProjectDto {

  projectCode:string

  name:string

  clientId:string

  pmId:string

  stageId:string

  statusId:string

  deliveryDate?:string | null

}

export interface UpdateProjectDto {

  projectCode?:string

  name?:string

  clientId?:string

  pmId?:string

  stageId?:string

  statusId?:string

  deliveryDate?:string | null

}