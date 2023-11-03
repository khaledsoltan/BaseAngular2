import { ListItem } from '../List-item/ListItem';
import { Observable } from 'rxjs';
import { ListResult } from '../result/ListResult';
import { FieldValidator } from '../details/details';
import { Column, DataListConfig } from '../data-list/data-list';
import { ActionList } from '../action/actions';
import { FormGroup } from '@angular/forms';
import { DynamicFormComponent } from '../../components/dynamic-form/dynamic-form.component';
import { TemplateRef } from '@angular/core';
import { Result } from '../result/Result';
import { AutoCompleteMode } from '../../enums/enums';
import { ParameterConfiguration } from '../../helpers/parameter-validation-helper';

export interface DynamicFormModel {
  entityName?: string;
  entityId?: any;
  hidePageHeaderTitle?: boolean;
  saveBtnTitle?: string;
  hideCancelBtn?: Boolean;
  title: string;
  createPageKey?: string;
  updatePageKey?: string;
  pageType: DynamicFormPageType;
  mode: DynamicFormMode;
  cards: { [cardName: string]: DynamicFormCard | DynamicCardList };

  /**
   * - This prop used in update-mode
   * - You must add this prop on update or getEntity prop
   */
  entity?: { [key: string]: any };

  /**
   * - This method used in update-mode
   * - You must add this prop on update or entity prop
   */
  getEntity?: () => Observable<Result<any>>;

  beforeCheckValidity?: () => void;
}

/**
 * - Base Card Config is the common properties between single-card and list-card
 */
export interface BaseCardConfig {
  title?: string;
  translateKey?: string;
  type: DynamicFormCardType;
  fields?: { [fieldName: string]: DynamicFormField };
  hidden?: boolean;
  disabled?: boolean;
  cardSize?: number;
  titleActions?: ActionList;
  parametersConfiguration?: ParameterConfiguration[];

  /**
   * - this method called when card form changed
   * - called also if any field of this card changes
   */
  onChange?: (onChangeEvent: DynamicFormEvent) => void;

  /**
   * - Used for update, by default we get card value by card key like this 'entity.cardKey'
   * - If your card key isn't in the first level like this 'entity.x.cardKey', then
   *   you must use this dataKey 'x.cardKey' to get cardValue in any level
   */
  dataKey?: string;
}

/**
 * - This config used only with single-card
 */
export interface DynamicFormCard extends BaseCardConfig {
  isFlatten?: boolean;
  hideHeader?: boolean;
  contentTemplate?: TemplateRef<any>;
  hasResetAction?: boolean;
  hasToggleAction?: boolean;
  hasFullScreenAction?: boolean;
}

/**
 * - This config used only with list-card
 */
export interface DynamicCardList extends BaseCardConfig {
  entityName?: string;
  popUpCreateTitle?: string;
  popUpUpdateTitle?: string;
  dataListConfig: DataListConfig;
  columns: Column[];
  hasCreateAction?: boolean;
  hasUpdateAction?: boolean;
  hasCloneAction?: boolean;
  hasDeleteAction?: boolean;
  rowActions?: ActionList;
  itemsList?: any[];
  selectedItems: any[];

  onRowSelected?: (event: { item: any, allSelectedItems: any }) => void;
  onRowUnselected?: (event: { item: any, allSelectedItems: any }) => void;
  onSelectAllToggle?: (event: { event: any, allSelectedItems: any }) => void;
  validateBeforeSave?: (cardData: any, cardConfig: DynamicCardList) => boolean;
}

export interface DynamicFormField {
  title?: string;
  dataType: DynamicFormDataType;
  validators?: FieldValidator[];
  colSize?: number;
  offsetEnd?: number;
  cssClass?: string;
  hidden?: boolean;
  disabled?: boolean;
  contentTemplate?: TemplateRef<any>;

  /**
   * - Used only with Autocomplete and Dropdown
   * - You can select your source data as static array or a service method
   *   call backend directly
   */
  selectFieldProps?: DynamicFormSelectFieldProps;

  /**
   * - Used only with Checkbox and Radio-Button
   * - You can select your source data as static array or a service method
   *   call backend directly
   */
  selectOptions?: DynamicFormSelectOptions;

  /**
   * - Used only with date
   */
  dateOptions?: DateOptions;

  /**
   * - Used only with AutoComplete
   * - You can select your selection mode for autocomplete to be either multi or single
   */
  autoCompleteMode?: AutoCompleteMode;

  /**
   * - Used only with AutoComplete and Dropdown in Single Mode
   * - supplied value should be the entity name of this autocomplete or dropdown
   * - Added to be used in dimension configurations
   */
  dimensionEntityName?: string;

  /**
  * - Used only with AutoComplete and Dropdown in Single Mode
  * - Supplied value should be the entity key of this autocomplete or dropdown
  * - Added to be used in dimension configurations
  */
  dimensionEntitykey?: string;

  /**
   * - Used only with files
   */
  fileOptions?: FileOptions;

  /**
   * - this method called when field control changed
   */
  onChange?: (onChangeEvent: DynamicFormEvent) => void;

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

/**
 * - Used only with dropdown and autocomplete
 */
export interface DynamicFormSelectFieldProps {
  /**
   * - Used to bind on DataSource object key on dropdown and autocomplete
   * - if my object is {id: 1, name: 'mohamed'} the key is 'id'
   * - if my object is {code: 1, name: 'mohamed'} the key is 'code'
   * - default is 'id'
   */
  key?: string;

  /**
   * - Used to bind on DataSource object name on dropdown and autocomplete
   * - if my object is {id: 1, name: 'mohamed'} the name is 'name'
   * - if my object is {code: 1, title: 'mohamed'} the name is 'title'
   * - default is 'name'
   */
  value?: string;

  /**
   *  Used with two cases
   *  - First onSave my form if autocomplete/dropdown value is {id: 1, name: 'mohamed'}
   *    and selectedField is {key: 'usedId', name: 'userName'} then my savedObject
   *    will be {fieldKey: {id: 1, name: 'mohamed'},usedId: 1,userName: 'mohamed'}
   *  -----------------------------------------------------------------------------
   *  - Seconde on update if selected field is {key: 'usedId', name: 'userName'}
   *    I will get cardValue['userId'] from update entity as objectKey
   *    I will get cardValue['userName'] from update entity as objectName
   */
  selectedField: { key: string, value: string };

  /**
   * - Used if you have static array
   * - Used only with dropdown
   */
  selectList?: ListItem[] | any[];

  /**
   * - Used as a datasource if you want to call service method directly
   * - Used with Autocomplete and Dropdown
   */
  getSelectList?: (searchQuery?: string, searchData?: any[]) => Observable<ListResult<ListItem | any>>;
}

/**
 * - Used only with checkbox and radiobutton
 */
export interface DynamicFormSelectOptions {
  /**
   * List of your objects as title and value
   */
  list?: { title: any; value: any }[];

  /**
   * - Used as default values
   * - In Checkbox tou can select default values as array
   * - In Radiobutton tou can select default values as single value
   */
  selected?: any[] | any;

  /**
   * - Used with checkbox only to bing values as true and false only
   */
  binary?: boolean;

  /**
  * - Used if you have datasource from backend
  */
  getSelectOptions?: () => Observable<any[] | ListItem[]>;

  /**
   * - Used only if you use getSelectOptions prop
   * - The returned object be {id: 1, name: 'mahmoud} the value is 'id'
   */
  value?: string;

  /**
   * - Used only if you use getSelectOptions prop
   * - The returned object be {id: 1, name: 'mahmoud} the title is 'name'
   */
  title?: string;
}

/**
 * - This prop sent as parameter for any card onChange Method
 * - This prop sent as parameter for any field onChange Method
 */
export interface DynamicFormEvent {
  form?: FormGroup;

  /**
   * - The value of form and list cards also
   */
  value?: any;

  /**
   * - card events like hide and show for every card
   * - every card has fieldsEvents for every field like hide and show
   */
  cardsEvents?: { [cardName: string]: DynamicCardEvents };

  /**
   * - Reference of Dynamic form component
   */
  component?: DynamicFormComponent;

  /**
   * - Reference of the real cards you sent as a config
   */
  cards?: { [cardName: string]: DynamicFormCard | DynamicCardList };
}

export interface DynamicCardEvents {
  fieldsEvents?: { [fieldName: string]: DynamicFieldEvents };
  hide?: () => void;
  show?: () => void;
}

export interface DynamicFieldEvents {
  hide?: () => void;
  show?: () => void;
}

export interface DateOptions {
  dateFormat?: string; // default 'dd/mm/yy'
  showTime?: boolean;  // default false
  timeOnly?: boolean;  // default false
  hourFormat?: string;  // '12' or '24' => default '12'
}

export interface FileOptions {
  maxFileSize?: number; // default => 2MB: 2000000
}

export enum DynamicFormPageType {
  PopUp = 1,
  StandAlone = 2,
  Single
}

export enum DynamicFormMode {
  Create = 1,
  Update = 2,
  Clone = 3
}

export enum DynamicFormCardType {
  Single = 1,
  Multi = 2,
  Template = 3
}

export enum DynamicFormDataType {
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
  Password = 'Password'
}
