export interface SetNextProcessStage {
  stageId: number;
  targetStageId: number;
  stageName?: string;
  targetStageName?: string;
}
