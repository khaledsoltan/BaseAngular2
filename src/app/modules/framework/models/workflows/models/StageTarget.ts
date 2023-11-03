export interface StageTarget {
  id: string;
  fromStageId: number;
  fromStageName: string;
  fromProcessEntityName: string;
  toStageId: number;
  toStageName: string;
  sNPStageId: number;
  sNPStageName: string;
  toProcessId: number;
  toProcessName: string;
  stageTargetConditions: StageTargetConditions[];
}

export interface StageTargetConditions {
  id: number;
  stageTargetId: number;
  sourcePath: string;
  destinationPath: string;
  relation: StageTargetConditionsRelationEnum;
}

export enum StageTargetConditionsRelationEnum {
  Equal = 1,
  LessThan = 2,
  LessThanOrEqual = 3,
  MoreThan = 4,
  MoreThanOrEqual = 5,
  NotEqual = 6
}

export enum GroupingRelationEnum {
  AND = 1,
  OR = 2
 }
