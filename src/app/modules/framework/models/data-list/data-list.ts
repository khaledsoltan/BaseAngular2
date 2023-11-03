import { TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ActionTypeEnum } from '../../enums/action/action-type-tnum';
import { ActionFieldDataTypesEnum } from '../../enums/enums';
import { SelectFieldProps } from '../advanced-search/advanced-search';
import { QuickFilter } from '../quick-filter/quick-filter';
import { PagedResults } from '../result/PagedResults';
import { StageTypes } from '../workflows/models/WorkflowItems';


export const DefaultGridSettings = {
  RowsPerPageOptions: [10, 15, 20, 30, 50, 75, 100],
  PageSize: 20
};

export enum ExportFileSelection {
  SelectedRows = 1,
  CurrentPage = 2,
  AllPages = 3
}
export interface ExportFile {
  pdf?: boolean;
  excel?: boolean;
  word?: boolean;
}

export enum ExportTypes {
  pdf = 'pdf',
  word = 'word',
  excel = 'excel',
}

export enum ExportScreenWidth {
  portrait = 'portrait',
  landscape = 'landscape',
}

export enum ViewTypes {
  Grid = 1,
  Cards = 2
}

export interface BadgeConfig {
  title?: string;
  class?: string;
  viewBtnClass?: string;
  viewCardClass?: string;
}

export interface DataListConfig {
  title?: string;
  selectionMode?: SelectionModeEnum;
  defSortBy?: string;
  dataKey?: string;
  module?: string;
  defSortOrder?: SortOrderEnum;
  enableSearch?: boolean;
  enableFreezing?: boolean;
  disableLazy?: boolean;
  hasTitleActions?: boolean;
  disablePaginator?: boolean;
  disableScrollable?: boolean;
  disableResizableColumns?: boolean;
  disableReorderableColumns?: boolean;
  alwaysShowPaginator?: boolean;
  showOperators?: boolean;
  showInlineSearch?: boolean;
  hasUpdateAction?: boolean;
  hasCreateAction?: boolean;
  hasActivateAction?: boolean;
  hasDeleteAction?: boolean;
  hasDetailsAction?: boolean;
  hasToggleAction?: boolean;
  hasFullScreenAction?: boolean;
  hasRefreshAction?: boolean;
  hasToggleColumsActionAction?: boolean;
  tabs?: StaticTab[];
  tabsSearchKey?: string;
  exportFile?: ExportFile;
  enableAuth?: boolean;
  viewType?: ViewTypes;
  disableSwitchView?: boolean;
  tileCardColSize?: number;
  hasImport?: boolean;
  hasRowExpansion?: boolean;
  expansionMode?: RowExpansionMode;
  expansionTemplate?: TemplateRef<any>;
  tileViewTemplate?: TemplateRef<any>;
  hasAdvancedSearch?: boolean;
  hasQuickFilters?: boolean;
  quickFilters?: QuickFilter[];
  displayLoader?: boolean;
  titleIcon?: string;
  noDataAvailableTitle?: string;

  getItemsList?: (searchModel?: any) => Observable<PagedResults<any>>;
  // activateItems?: (activateVm?: any) => Observable<Result<any>>;
  // getStagesList?: () => Observable<EntityResults<WorkflowProcessStage>>; // Observable<PagedResults<any>>
  checkActionPermission?: (actionType: ActionTypeEnum) => boolean;
  onUploadClick?: () => void;


}

// export interface ColSearchField {
//   field?: string;
//   secondKey?: string;
//   secondKeyIsLocalized?: boolean;
//   isLocalized?: boolean;
//   type: SearchFieldTypesEnum;
//   selectFieldProps?: SelectFieldProps;
//   showOperators?: boolean;
//   operators?: { code: string, title: string; }[];
// }

export interface Column {
  field: string;
  title: string;
  sortField?: string;
  hidden?: boolean;
  cardFieldHidden?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  frozen?: boolean;
  resizable?: boolean;
  searchField?: ColSearchField;
  subfield?: string;
  width?: ColumnWidth;
  reorderable?: boolean;
  pipe?: string;
  pipeFormat?: string;
  cellTemplate?: TemplateRef<any>;
  enableFreezing?: boolean;
  hideForExport?: boolean;
  cellTemplateType?: CellTemplateTypes,
  exportTempalte?: { key: any, value: string }[];
  percent?: number;
  isHidden?: () => boolean;
}
export interface ColSearchField {
  field?: string;
  secondKey?: string;
  secondKeyIsLocalized?: boolean;
  isLocalized?: boolean;
  type: any;
  selectFieldProps?: SelectFieldProps;
  showOperators?: boolean;
  operators?: { code: string; title: string }[];
}
export enum CellTemplateTypes {
  IsActivate = 1
}
export enum Pipes {
  date = 'date',
  money = 'money',
  decimal = "decimal"
}
export enum SelectionModeEnum {
  None = 'none',
  Single = 'single',
  Multiple = 'multiple'
}

export enum SortOrderEnum {
  Asc = 'asc',
  Desc = 'desc'
}
// export enum DefaultSelectedStages {
//   ShowAll = null, Pending = -1
// }

export interface WorkflowProcessStage {
  id?: number;
  creationDate?: Date;
  createdBy?: string;
  name?: string;
  assignedNumber?: number;
  type?: StageTypes;
  nextStageId?: number;
  stageAction?: WorkflowProcessStageAction[];
  uiorder?: number;
  stageSystemAction: WorkflowProcessStageAction[];
}
export interface WorkflowProcessStageAction {
  id: number;
  name: string;
  stageId: number;
  entityId?: number;
  entityName?: string;
  referencedStageActionId?: number;
  referencedStageActionName: string;
  actionField: WorkflowProcessStageActionField[];
}
export interface WorkflowProcessStageActionField {
  id: number;
  actionFieldEntryId: number;
  actionId: number;
  dataTypeId: ActionFieldDataTypesEnum;
  sourceName: string;
  name: string;
  isRequired: boolean;
  value: any;
  referencedActionField?: any;
}
export enum DefaultSelectedStages {
  ShowAll = 0,
  Pending = -1
}
export interface StaticTab {
  // countKey: any;
  title: string;
  value?: any;
  searchKey?: string;
  count?: number;
  isSelected?: boolean;
}

export enum RowExpansionMode {
  single = 1,
  multiple = 2
}


export enum ColumnWidth {
  /**
  * @summary For: name
  */
  default = '200px',
  /**
   * @summary For: actions
   */
  col50 = '50px',
  /**
   * @summary For: active, nationality, gender,religion, profession, numbers, region, type, tax
   */
  col80 = '80px',
  /**
   * @summary For:Status Template, date, position, createdBy, assigned to, city, id, email, status
   */
  col100 = '100px',

  col150 = '150px',
  col160 = '160px',
  /**
  * @summary For: Code
  */
  col130 = '130px',
  col120 = '120px',
  col200 = '200px',
  col250 = "250px",
  /**
   * @summary For : URL, Name and image Template
   */
  col300 = '300px'

}
