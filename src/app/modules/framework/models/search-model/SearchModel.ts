import { DefaultGridSettings, SortOrderEnum } from '../data-list/data-list';
export interface SearchFieldVm {
  fieldName: string;
  operator?: string;
  value: any;
  jsonValue?: any;
  isLocalized?: boolean;
  paramOnly?: boolean;
  isParam?: boolean;
  paramName?: string;
  dataSources?: string[];
  isDimension?: boolean;
  excludeFromQuery?: boolean;
}
export class SelectListSearch {
  Name: string;
  IsActive?: boolean;
  SortOrder: string
  PageNumber: number
  PageSize: number
}
export class SearchModel {
  pageNumber?: number;
  pageSize?: number;
  sortOrder?: string;
  orderBy?: string;
  stage?: number;
  processId?: number;
  toEntityName?: string;


  searchFields: SearchFieldVm[];

  constructor(orderBy?: string, sortOrder?: SortOrderEnum) {
    this.orderBy = orderBy || 'id';
    this.sortOrder = sortOrder || SortOrderEnum.Desc;
    this.pageSize = DefaultGridSettings.PageSize || 10;
    this.pageNumber = 1;
    this.searchFields = [];
  }
}
export interface SearchModelMultiSelect extends SearchModel {
  contracts: any[];
}