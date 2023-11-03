// import { WorkflowProcessStage } from '../../data-list/data-list';

export interface StageEntryData {
  //set ' ' for testing
  stageData: any;
  stageHistory: StageEntryHistory[];
  isHead: boolean;
  isVisited: boolean;
  isNext: boolean;
}

export interface StageSequenceList {
  id: number | null;
  nextStageId: number | null; // In case of last stage
  name: string;
  uiorder: number | null;
  assignedNumber: number;
  type: number;
  stageAction: StageActionList[];
}

export interface StageEntryHistory {
  id: number;
  stageName: string;
  creationDate: Date | string;
  createdBy: string;
  actionName: string;
  actionFieldEntries: ActionFieldEntry[];
}

export interface ActionFieldEntry {
  fieldContent: string;
  name: string;
  dataTypeId: number;
}

export interface StageActionList {
  id: number;
  code: string;
  name: string;
  stageId: number;
  referencedStageActionId: number;
  actionField: ActionFieldList[];
  numberOfChildren: number;
}

export interface ActionFieldList {
  id: number;
  actionId: number;
  dataTypeId: number;
  dourceName: string;
  name: string;
  isRequired: boolean;
  fieldContent: string;
  referencedActionField: ReferencedFields;
}

export interface ReferencedFields {
  referencedFieldId: number | null;
  referencedFieldName: string;
  id: number;
  actionId: number;
  dataTypeId: number;
  sourceName: string;
  name: string;
  isRequired: boolean;
  fieldContent: string;
}
