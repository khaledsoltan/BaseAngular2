export enum FieldModeEnum {
  default = 1,
  disabled = 2
}

export enum PaginationPosition {
  Top = 'top',
  Bottom = 'bottom'
}

export enum UpdateFieldTypesEnum {
  Text = 1,
  TextArea = 2,
  Number = 3,
  Date = 4,
  DropDown = 5,
  AutoComplete = 6,
  phone = 7
}

// action
export enum ActionFieldDataTypesEnum {
  Text = 1,
  TextArea = 2,
  Number = 3,
  Date = 4,
  Time = 5,
  File = 6,
  DropDown = 7,
  Checkbox = 8,
  DataManagement = 9,
  Editor = 10,
  DocumentType = 11
}

export enum TabsTypes {
  Tabs = 1,
  Dropdown = 2,
  Stages = 3
}

export enum ActionTypeEnum {
  create = 'create',
  commonCreate = 'commonCreate',
  save = 'save',
  edit = 'edit',
  delete = 'delete',
  restore = 'restore',
  search = 'search',
  filter = 'filter',
  details = 'details',
  refresh = 'refresh',
  print = 'print',
  repeat = 'repeat',
  close = 'cancel',
  approve = 'approve',
  fullscreen = 'fullscreen',
  back = 'back',
  toggle = 'toggle',
  list = 'list',
  custom = 'custom',
  backToList = 'backToList',
  activate = 'activate',
  deactivate = 'deactivate',
  view = 'view',
  gridView = 'gridView',
  tileView = 'tileView',
  stageAction = 'stageAction',
  import = 'import',
  download = 'download',
  laborers = 'laborers',
  erase = 'erase',
  dotsMoreActions = 'dotsMoreActions',
  moreActions = 'moreActions',
  attachment = 'attachment',
  template = 'template',
  assign = 'assign',
  workFlow = 'workFlow',
  select = 'select'
}

export enum AllocationInterviewStatusEnum {
  New = '1',
  Accepted = '2',
  Rejected = '3',
  Violated = '4'
}

// global search

export enum GlobalSearchPageType {
  list = 1,
  details = 2
}

export enum GlobalSearchTargetEnum {
  All = 1,
  Module = 2,
  SubModule = 3,
  Entity = 4
}

// related link
export enum RelatedLinksTypeEnum {
  list = 1,
  details = 2
}

// Single Page And Dynamic Form
export enum AutoCompleteMode {
  Single = 1,
  Multi = 2,
}

export enum ExportType {
  Excel = 'excel', Word = 'word', Pdf = 'pdf'
}
// entity name
export enum EntityNamesEnum {
  Rfq = 1,
  Quotation = 2,
  JobOrder = 3
}