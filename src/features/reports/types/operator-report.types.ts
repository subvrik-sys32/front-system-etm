import type{
  OperatorSummaryRow,
  TimeTrackingRow,
}from"./reports.types"

export interface OperatorReport{

  operatorName:string

  summary:OperatorSummaryRow

  rows:TimeTrackingRow[]

}