import { WorkflowProcessStage } from "../data-list/data-list";
import { StageEntryData } from "../generic/StageEntryData";
// import { WorkflowProcessStage } from '../data-list/data-list';
import { RelatedLinksVM } from '../related-links/related-links';


export interface EntityResult<T> {
  entity: T;
  message: string;
  success: boolean;
  statusCode: number;
  entityInfo?: EntityInfo | any;
}

export interface EntityInfo {
  currentStageInfo?: WorkflowProcessStage;
  stageEntryDetails?: StageEntryDetailsVM | any;
  entityId?: number;
  entityNameId?: string;
  hasAttachments?: boolean;
  entityType?: EntityType;
  hasActivities?: boolean;
  nextId?: number;
  previousId?: number;
  stageEntryId?: number;
  workflowProcessName?: string;
  relatedLinks?: RelatedLinksVM[];
  localizedTable?: LocalizedTableVM[];
}

export interface StageEntryDetailsVM {
  stageEntryDataVMs: StageEntryData[];
}
export enum EntityType {
  StronglyType = 1,
  Generic = 2
}

export interface LocalizedTableVM {
  title: string;
  name: string;
  id?: number;
}
