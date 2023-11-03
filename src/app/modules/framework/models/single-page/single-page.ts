import { TemplateRef } from "@angular/core";
import { Observable } from "rxjs";
import { ActionList } from "../action/actions";
import { WorkflowProcessStage } from "../data-list/data-list";
import { EntityResult } from "../result/EntityResult";
import { EntityResults } from "../result/EntityResults";
import { Result } from "../result/Result";



export interface SinglePageConfig {
  entityName?: string;
  entityId?: number | any;
  entity?: any;
  hasRelatedLinks?: boolean;
  hasPaginator?: boolean;
  createPageKey?: string;
  updatePageKey?: string;
  getEntity?: (id: number | any) => Observable<EntityResult<any>>;
  createEntity?: (postedVM: any) => Observable<Result | EntityResult<any>>;
  updateEntity?: (postedVM: any) => Observable<Result | EntityResult<any>>;
  getStagesList?: () => Observable<EntityResults<WorkflowProcessStage>>;
  beforeCheckValidity?: () => void;
}

export enum SinglePageMode {
  Create = 1,
  Update = 2,
  Clone = 3
}

export enum SinglePageType {
  PopUp = 1,
  StandAlone = 2,
}

export interface SinglePageMainCard {
  dataKey?: string;
  fields: { [key: string]: SinglePageMainCardField; };
}

export interface SinglePageMainCardField {
  title: string;
  pipe?: string;
  format?: string;
  contentTemplate?: TemplateRef<any>;
}

export interface SinglePageTitleActions {
  hasNewAction?: boolean;
  hasSaveAction?: boolean;
  hasSaveAndCloseAction?: boolean;
  hasRefreshAction?: boolean;
  hasCancelAction?: boolean;
  hasCloneAction?: boolean;
  actionList?: ActionList;
}

export interface TabValidationMessages {
  tabTitle: string;
  cards?: { [cardKey: string]: { cardTitle: string; fields?: { [fieldKey: string]: string; }; }; };
}