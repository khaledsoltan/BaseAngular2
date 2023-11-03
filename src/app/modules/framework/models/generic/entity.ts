import { ListItem } from '../List-item/ListItem';
import { DataListConfig, Column } from '../data-list/data-list';


export interface EntityField {
  dataTypeId: number;
  sourceId?: number;
  id?: number;
  isRequired: boolean | string;
  isLocalized: boolean | string;
  titleEn: string;
  titleAr: string;

  selectList?: any[];
}

export interface Entity {
  id?: number;
  menuItemId?: number;
  moduleId?: number;
  module?: ListItem;
  entityFields: EntityField[];
  childEntities: ChildEntity[];
}

export interface ChildEntity {
  id?: number;
  isMany: boolean;
  isRequired: boolean;
  menuItemId?: number;
  moduleId?: number;
  module?: ListItem;
  title: string;
  titleAr: string;
  titleEn: string;
  entityFields: EntityField[];
  childEntities?: ChildEntity[];

  // for isMany child - table config
  dataListConfig?: DataListConfig;
  cols?: Column[];
  itemsList?: any[];

}

export interface EntityEntry {
  entityId: number;
  entityName?: string;
  id?: number;
  entityFieldEntries: { title: string, code: string, value: string }[];
  fieldsMetaData?: any[];
  creationDate?: any;
  entityEntries?: { [key: string]: any };
}

export interface EntityEntryAddVM {
  entityId: number;
  entityFieldEntries: { fieldId: number, valueEn: string, valueAr?: string }[];
  childEntitiesEntries: ChildEntityEntryAddVM[];
}

export interface ChildEntityEntryAddVM {
  entityId: number;
  entityFieldEntries: { fieldId: number, valueEn: string, valueAr?: string }[];
}

export enum DataTypeEnum {
  Text = 1,
  TextArea = 2,
  Email = 3,
  File = 4,
  Integer = 5,
  Decimal = 6,
  Date = 7,
  Time = 8,
  AutoComplete = 9,
  DropDown = 10,
  Computed = 11
}

export interface CrudChildEntity {
  selectedChildEntityId: number;
  type: CrudChildEntityType;
}

export enum CrudChildEntityType {
  createChild = 1,
  update = 2
}
