import { TemplateRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ListItem } from "ng-multiselect-dropdown/multiselect.model";
import { Observable } from "rxjs";
import { AutoCompleteMode } from "src/app/modules/core/enums/enums";
import { ParameterConfiguration } from "src/app/modules/core/helpers/parameter-validation-helper";
import { ActionList } from "src/app/modules/core/models/action/actions";
import { DataListConfig, Column } from "src/app/modules/core/models/data-list/data-list";
import { FieldValidator } from "src/app/modules/core/models/details/details";
import { DynamicFormEvent } from "src/app/modules/core/models/dynamic-form/dynamic-form";
import { ListResult } from "src/app/modules/core/models/result/ListResult";
import { Result } from "src/app/modules/core/models/result/Result";
import { SinglePageComponent } from "../../components/single-page/single-page.component";


export interface SinglePageTab {
  title: string;
  type: SinglePageTabType;
  cards?: { [cardName: string]: SinglePageCard; };
  contentTemplate?: TemplateRef<any>;
  hidden?: boolean;
  disabled?: boolean;
  titleActions?: ActionList;
  onChange?: (onChangeEvent: SinglePageEvent) => void;

  // request for individual card
  entity?: { [key: string]: any; };
  getEntity?: () => Observable<Result<any>>;
}

export interface SinglePageCard {
  title: string;
  type: SinglePageCardType;
  fields?: { [fieldName: string]: SinglePageField; };
  contentTemplate?: TemplateRef<any>;
  hidden?: boolean;
  disabled?: boolean;
  cardSize?: number;
  isFlatten?: boolean;
  dataKey?: string;
  translateKey?: string;
  onChange?: (onChangeEvent: SinglePageEvent | DynamicFormEvent) => void;
  titleActions?: ActionList;
  parametersConfiguration?: ParameterConfiguration[];


  // list-card
  entityName?: string;
  popUpCreateTitle?: string;
  popUpUpdateTitle?: string;
  dataListConfig?: DataListConfig;
  columns?: Column[];
  hasCreateAction?: boolean;
  hasUpdateAction?: boolean;
  hasDeleteAction?: boolean;
  rowActions?: ActionList;
  itemsList?: any[];
  validateBeforeSave?: (cardData: any, cardConfig: SinglePageCard) => boolean;
  disable?: () => void;
  enable?: () => void;
}

export interface SinglePageField {
  title: string;
  dataType: SinglePageFieldType;
  validators?: FieldValidator[];
  colSize?: number;
  hidden?: boolean;
  disabled?: boolean;
  contentTemplate?: TemplateRef<any>;
  selectFieldProps?: SinglePageSelectFieldProps;
  selectOptions?: SinglePageSelectOptions;
  dateOptions?: SinglePageDateOptions;
  fileOptions?: SinglePageFileOptions;
  onChange?: (onChangeEvent: SinglePageEvent | DynamicFormEvent) => void;

  // static field
  pipe?: string;
  format?: string;

  /**
   * - Used only with AutoComplete
   * - You can select your selection mode for autocomplete to be either multi or single
   */
  autoCompleteMode?: AutoCompleteMode;

  /**
   * - Used only with AutoComplete and Dropdown in Single Mode
   * - Supplied value should be the entity name of this autocomplete or dropdown
   * - Added to be used in dimension configurations
   */
  dimensionEntityName?: string;

  /**
   * - Used only with AutoComplete and Dropdown in Single Mode
   * - Supplied value should be the entity key of this autocomplete or dropdown
   * - Added to be used in dimension configurations
   */
  dimensionEntitykey?: string;

  // General Search Autocomplete
  /**
   * - General search template
   */
  generalSearchPageListTemplate?: TemplateRef<any>;
  /**
   * - General search data list config
   */
  generalSearchDataListConfig?: DataListConfig;

  /**
   * - General search columns
   */
  generalSearchColumns?: Column[];

  /**
   * - General search Key to select from saved object
   */
  generalSearchKey?: string;

  /**
   * - General search value to select from saved object
   */
  generalSearchValue?: string;

  /**
   * - General search get selected items
   */
  generalSearchGetSelectedItems?: () => any[];
}

export interface SinglePageSelectFieldProps {
  key?: string;
  value?: string;
  selectedField: { key: string; value: string; };
  selectList?: ListItem[] | any[];
  getSelectList?: (
    searchQuery?: string,
    searchData?: any[]
  ) => Observable<ListResult<ListItem | any>>;
}

export interface SinglePageSelectOptions {
  list?: { title: any; value: any; }[];
  selected?: any[] | any;
  binary?: boolean;
  getSelectOptions?: () => Observable<any[] | ListItem[]>;
  value?: string;
  title?: string;
}

export interface SinglePageDateOptions {
  dateFormat?: string; // default 'dd/mm/yy'
  showTime?: boolean; // default false
  timeOnly?: boolean; // default false
  hourFormat?: string; // '12' or '24' => default '12'
}

export interface SinglePageFileOptions {
  maxFileSize?: number; // default => 2MB: 2000000
}

export interface SinglePageEvent {
  form?: FormGroup;
  value?: any;
  component?: SinglePageComponent;
  tabs?: { [tabName: string]: SinglePageTab; };
}

export enum SinglePageTabType {
  Form = 1,
  Template = 2,
}

export enum SinglePageCardType {
  Single = 1,
  Multi = 2,
  Template = 3,
}

export enum SinglePageFieldType {
  Static = 'Static',
  Text = 'Text',
  TextArea = 'TextArea',
  Number = 'Number',
  Date = 'Date',
  DropDown = 'DropDown',
  AutoComplete = 'AutoComplete',
  CheckBox = 'CheckBox',
  RadioButton = 'RadioButton',
  File = 'File',
  Template = 'Template',
}
