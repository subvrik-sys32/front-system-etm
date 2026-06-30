import {
  toast,
} from "sonner"

import type {
  ProcessTask,
} from "@/features/processes/types/process.types"

import {
  workflowAccess,
} from "../access/workflow-access"

type WorkflowPayload = {

  piecesOutput?:number | null

  plRtReal?:number | null

  paintKgReal?:number | null

}

export const workflowGuard = {

  canEdit(
    processTask:ProcessTask,
  ){

    const status=
      workflowAccess.status(
        processTask,
      )

    const locked=

      status==="COMPLETED" ||

      status==="REVIEWED"

    if(locked){

      toast.error(
        "Este proceso ya fue finalizado",
      )

      return false

    }

    return true

  },

  requireOperator(
    processTask:ProcessTask,
  ){

    const operator=
      workflowAccess.operatorId(
        processTask,
      )

    if(!operator){

      toast.error(
        "Debe asignar un operario",
      )

      return false

    }

    return true

  },

  validateProcessData(

    processTask:ProcessTask,

    payload:WorkflowPayload,

  ){

    const code=
      workflowAccess.processCode(
        processTask,
      )

    if(code==="CT"){

      if(
        !payload.piecesOutput ||

        payload.piecesOutput<=0
      ){

        toast.error(
          "Debe registrar piezas de salida",
        )

        return false

      }

      if(
        !payload.plRtReal ||

        payload.plRtReal<=0
      ){

        toast.error(
          "Debe registrar PL/RT real",
        )

        return false

      }

    }

    if([
      "PL",
      "SD",
      "EN",
      "DS",
    ].includes(
      code ?? "",
    )){

      if(
        !payload.piecesOutput ||

        payload.piecesOutput<=0
      ){

        toast.error(
          "Debe registrar piezas de salida",
        )

        return false

      }

    }

    if(code==="PT"){

      if(
        !payload.paintKgReal ||

        payload.paintKgReal<=0
      ){

        toast.error(
          "Debe registrar kilos de pintura",
        )

        return false

      }

      if(
        !payload.piecesOutput ||

        payload.piecesOutput<=0
      ){

        toast.error(
          "Debe registrar piezas de salida",
        )

        return false

      }

    }

    return true

  },

  canComplete(

    processTask:ProcessTask,

    payload:WorkflowPayload,

  ){

    if(
      !this.canEdit(
        processTask,
      )
    ){
      return false
    }

    if(
      !this.requireOperator(
        processTask,
      )
    ){
      return false
    }

    if(
      !this.validateProcessData(
        processTask,
        payload,
      )
    ){
      return false
    }

    return true

  },

}