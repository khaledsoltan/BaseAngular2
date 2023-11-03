import { Observable } from 'rxjs';
import { ListResult } from '../result/ListResult';
import { TemplateRef } from '@angular/core';
import { AutoCompleteMode } from '../../enums/enums';
import { Column, DataListConfig } from '../data-list/data-list';
import { ListItem } from '../List-item/ListItem';


export enum SearchFieldTypesEnum {
  None = 0,
  Text = 1,
  Number = 2,
  Date = 3,
  DropDown = 4,
  AutoComplete = 5,
  MultiSelect = 6,
  RadioButton = 7,
  Checkbox = 8
}

export enum ColumnFilterTypes {
  Text = 'text',
  Boolean = 'boolean',
  Date = 'date',
  Number = 'numeric',
  Dropdown = 'dropdown',
  AutoComplete = 'autoComplete'
}

export interface SelectFieldProps {
  key?: string;
  value?: string;
  selectList?: ListItem[] | any[];
  apiSingleCalling?: boolean;
  useTranslatePipe?: boolean;

  getSelectList?: (
    searchQuery?: string,
    searchData?: any[]
  ) => Observable<ListResult<ListItem | any>>;
}
// export interface AdvancedSearchSelectOptions {
//   /**
//    * List of your objects as title and value
//    */
//   list?: { title: any; value: any }[];

//   /**
//    * - Used as default values
//    * - In Checkbox tou can select default values as array
//    * - In Radiobutton tou can select default values as single value
//    */
//   selected?: any[] | any;

//   /**
//    * - Used with checkbox only to bing values as true and false only
//    */
//   binary?: boolean;

//   /**
//   * - Used if you have datasource from backend
//   */
//   getSelectOptions?: () => Observable<any[] | ListItem[]>;

//   /**
//    * - Used only if you use getSelectOptions prop
//    * - The returned object be {id: 1, name: 'mahmoud} the value is 'id'
//    */
//   value?: string;

//   /**
//    * - Used only if you use getSelectOptions prop
//    * - The returned object be {id: 1, name: 'mahmoud} the title is 'name'
//    */
//   title?: string;
// }
export enum CalendarViews {
  date = 'date',
  month = 'month',
  year = 'year'
}
export interface CalendarConfig {
  view: CalendarViews
}
export interface SearchField {
  title: string;
  placeholder?: string;
  key: string;
  fieldNameKey?: string;
  secondKey?: string;
  secondKeyIsLocalized?: boolean;
  type: SearchFieldTypesEnum;
  value?: any;
  colSize?: number;
  selectFieldProps?: SelectFieldProps;
  showOperators?: boolean;
  isLocalized?: boolean;
  width?: SearchFieldWidthEnum;

  hidden?: boolean;
  operators?: { code: string; title: string }[];
  dataSources?: string[];
  //reportOperators?: ReportOperators;
  pipeFormat?: string;
  paramOnly?: boolean;
  isParam?: boolean;
  paramName?: string;
  binary?: boolean;
  selected?: any;
  isRequired?: boolean;
  disabled?: boolean;
  onChange?: (value: any) => void;
  excludeFromQuery?: boolean; // reports

  generalSearchPageListTemplate?: TemplateRef<any>;
  generalSearchDataListConfig?: DataListConfig;
  // generalSearchGetPageListComponent?: () => PageListComponent; // For Select previous selection in show general search again
  generalSearchColumns?: Column[];
  generalSearchKey?: string;
  generalSearchValue?: string;
  generalSearchGetSelectedItems?: () => any[];
  autoCompleteMode?: AutoCompleteMode;
  calendarConfig?: CalendarConfig
}

export interface AdvancedSearchConfig {
  cardTitle?: string;
  searchBtnText?: string;
  searchFields?: SearchField[];
  showOperators?: boolean;
  collapseAfterSearch?: boolean;
  isCollapsed?: boolean;
  dimensionModules?: string[];
}

export const Operators = {
  greaterThan: { code: 'GreaterThan', title: 'greaterThan' },
  greaterThanOrEqual: {
    code: 'GreaterThanOrEqual',
    title: 'greaterThanOrEqual'
  },
  lessThan: { code: 'LessThan', title: 'lessThan' },
  lessThanOrEqual: {
    code: 'LessThanOrEqual',
    title: 'lessThanOrEqual'
  },
  contain: { code: 'Contain', title: 'contain' },
  notContain: { code: 'NotContain', title: 'notContain' },
  equal: { code: 'Equal', title: 'equal' },
  notEqual: { code: 'NotEqual', title: 'notEqual' }
};

export const SearchFieldTypes = {
  [ColumnFilterTypes.Text]: {
    operators: [
      Operators.contain,
      Operators.notContain,
      Operators.equal,
      Operators.notEqual
    ]
  },
  [ColumnFilterTypes.Boolean]: {
    operators: [
      Operators.equal,
      Operators.notEqual
    ]
  },
  [ColumnFilterTypes.Number]: {
    operators: [
      Operators.equal,
      Operators.notEqual,
      Operators.greaterThan,
      Operators.greaterThanOrEqual,
      Operators.lessThan,
      Operators.lessThanOrEqual
    ]
  },
  [ColumnFilterTypes.Date]: {
    operators: [
      Operators.equal,
      Operators.notEqual,
      Operators.greaterThan,
      Operators.greaterThanOrEqual,
      Operators.lessThan,
      Operators.lessThanOrEqual
    ]
  },
  [ColumnFilterTypes.Dropdown]: {
    operators: [
      Operators.equal,
      Operators.notEqual
    ]
  },
  [ColumnFilterTypes.AutoComplete]: {
    operators: [
      Operators.equal,
      Operators.notEqual,
      Operators.contain,
      Operators.notContain
    ]
  },





  [SearchFieldTypesEnum.Text]: {
    operators: [
      Operators.contain,
      Operators.notContain,
      Operators.equal,
      Operators.notEqual
    ]
  },
  [SearchFieldTypesEnum.Number]: {
    operators: [
      Operators.equal,
      Operators.notEqual,
      Operators.greaterThan,
      Operators.greaterThanOrEqual,
      Operators.lessThan,
      Operators.lessThanOrEqual
    ]
  },
  [SearchFieldTypesEnum.Date]: {
    operators: [
      Operators.equal,
      Operators.notEqual,
      Operators.greaterThan,
      Operators.greaterThanOrEqual,
      Operators.lessThan,
      Operators.lessThanOrEqual
    ]
  },
  [SearchFieldTypesEnum.DropDown]: {
    operators: [
      Operators.equal,
      Operators.notEqual
    ]
  },
  [SearchFieldTypesEnum.MultiSelect]: {
    operators: [
      Operators.equal,
      Operators.notEqual]
  },
  [SearchFieldTypesEnum.AutoComplete]: {
    operators: [
      Operators.equal,
      Operators.notEqual,
      Operators.contain,
      Operators.notContain
    ]
  },
  [SearchFieldTypesEnum.RadioButton]: {
    operators: [
      Operators.equal,
      Operators.notEqual
    ]
  },
  [SearchFieldTypesEnum.Checkbox]: {
    operators: [
      Operators.equal,
      Operators.notEqual
    ]
  }
};

export enum SearchFieldWidthEnum {
  Quarter = 'w-25',
  Half = 'w-50',
  ThreeQuarter = 'w-75',
  FullWidth = 'w-100',
}
