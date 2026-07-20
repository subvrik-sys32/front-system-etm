import type{
  ReportKpis,
}from"./report-kpis.types"

import type{
  OperatorReport,
}from"./operator-report.types"

import type{
  ProjectReport,
}from"./project-report.types"

import type{
  ProcessReport,
}from"./process-report.types"

import type{
  TimeTrackingRow,
}from"./reports.types"

export interface ReportModel{

  rows:TimeTrackingRow[]

  kpis:ReportKpis

  operators:OperatorReport[]

  projects:ProjectReport[]

  processes:ProcessReport[]

}