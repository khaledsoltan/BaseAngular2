import { Column } from '../data-list/data-list';
import { Observable } from 'rxjs';
import { ActionTypeEnum } from '../../enums/action/action-type-tnum';
import { MenuRolePermissionEnum } from 'src/app/modules/auth/models/role-permissions';

export interface ActionType {
  icon: string;
  priority: number;
}

export const ActionTypes = {
  create: { icon: 'las la-plus', priority: 1 },
  commonCreate: { icon: 'las la-plus', priority: 1 },
  save: { icon: 'las la-save', priority: 1 },
  fullscreen: { icon: 'las la-expand', priority: 2 },
  toggle: { icon: 'las la-angle-down', priority: 3 },
  refresh: { icon: 'las la-sync-alt', priority: 4 },
  search: { icon: 'las la-search', priority: 5 },
  filter: { icon: 'las la-filter fs-20 align-middle', priority: 5 },
  download: { icon: 'las la-download', priority: 5 },
  moreActions: { icon: 'las la-angle-down', priority: 6 },
  dotsMoreActions: { icon: 'las la-ellipsis-v fs-16', priority: 6 },
  toggleCols: { icon: 'icon-view-cols', priority: 7 },
  tileView: { icon: 'las la-th-large', priority: 8 },
  gridView: { icon: 'las la-table', priority: 9 },
  print: { icon: 'las la-print', priority: 10 },
  repeat: { icon: 'las la-redo', priority: 11 },
  cancel: { icon: 'las la-times ', priority: 12 },
  approve: { icon: 'las la-check-square ', priority: 12 },
  details: { icon: 'las la-comment', priority: 1 },
  delete: { icon: 'las la-trash-alt fs-16', priority: 14 },
  list: { icon: 'las la-list', priority: 15 },
  back: { icon: 'las la-arrow-left', priority: 16 },
  edit: { icon: 'la	la-edit fs-16', priority: 17 },
  activate: { icon: 'icon-deactivate fs-18', priority: 18 },
  deactivate: { icon: 'icon-activate fs-18', priority: 19 },
  view: { icon: 'las la-eye', priority: 20 },
  backToList: { icon: 'las la-th-list', priority: 33 },
  stageAction: { icon: 'las la-send', priority: 22 },
  import: { icon: 'las la-upload', priority: 23 },
  laborers: { icon: 'las la-users', priority: 25 },
  restore: { icon: 'las la-recycle', priority: 26 },
  erase: { icon: 'las la-redo-alt', priority: 27 },
  custom: { icon: '', priority: 28 },
  attachment: { icon: 'las la-paperclip', priority: 30 },
  template: { icon: 'las la-file-invoice', priority: 31 },
  assign: { icon: 'las la-user-plus', priority: 32 },
  workFlow: { icon: '', priority: 29 },
  // las la-user-edit
};

export enum ActionOption {
  text = 'text',
  icon = 'icon',
  all = 'all',
}

export enum ActionListType {
  default = 'default',
  hover = 'hover',
  title = 'title',
  onGrid = 'on-grid',
}

export interface ActionData {
  event?: Event;
  params?: { [key: string]: any };
  rowIndex?: number;
  additionalParams?: any;
  actionNativeEl?: HTMLElement;
}

export interface ActionList {
  type: ActionListType;
  list?: ActionIcon[]; // buttons bra
  moreActions?: ActionIcon[]; // gwa dropdown
  toggleCols?: Column[];
  transparent?: boolean;
  hidden?: (params?: any, rowIndex?: number) => boolean;
}

export interface ActionIcon {
  type: ActionTypeEnum;
  icon?: string;
  title?: string;
  options?: ActionOption;
  href?: string;
  disabledResult?: boolean;
  systemActionId?: string;
  systemActionHttpVerb?: string;
  permissions?: MenuRolePermissionEnum[];
  actionKey?: string;
  //sortOrder?: number;
  disable?: (params?: any) => Observable<boolean> | boolean;
  hidden?: (params?: any, rowIndex?: number) => boolean;
  getTitle?: (params?: any) => string;
  onClick?: (data?: ActionData) => any;
  getHref?: (params?: any) => string;
  sortOrder?: (params?: any) => number;
}

export enum ActionKeysEnum {
  create = 'create',
  edit = 'edit',
  delete = 'delete',
  details = 'details',
  print = 'print',
  close = 'cancel',
  approve = 'approve',
  list = 'list',
  activate = 'activate',
  deactivate = 'deactivate',
  view = 'view',
  import = 'import',
  download = 'download',
  attachment = 'attachment',
  assign = 'assign',
}
