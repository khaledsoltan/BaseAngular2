export interface StageMapped {
  processId: ProcessId[];
}

export interface ProcessId {
  srcStageId: number[];
  desStageId: number[];
}
