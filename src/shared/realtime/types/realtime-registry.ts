import type{
  RealtimeEvent,
}from"../types/realtime-event"

import{
  taskHandler,
}from"../handlers/task-handler"

import{
  projectHandler,
}from"../handlers/project-handler"

import{
  workflowHandler,
}from"../handlers/workflow-handler"

import{
  processHandler,
}from"../handlers/process-handler"

import{
  userHandler,
}from"../handlers/user-handler"

import{
  notificationHandler,
}from"../handlers/notification-handler"

import{
  commentHandler,
}from"../handlers/comment-handler"

import {
  clientHandler,
} from "../handlers/client-handler"

const handlers={

  TASK:taskHandler,

  PROJECT:projectHandler,

  WORKFLOW:workflowHandler,

  PROCESS:processHandler,

  USER:userHandler,

  NOTIFICATION:notificationHandler,

  COMMENT:commentHandler,

  CLIENT: clientHandler,

}as const

export function realtimeRegistry(
  event:RealtimeEvent,
){

  const handler=

    handlers[
      event.entity as keyof typeof handlers
    ]

  if(!handler){
    return
  }

  handler(
    event,
  )

}