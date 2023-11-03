export interface DimensionConfiguration {
  entityDimensions: Dimension[];
  relatedEntityDimensions: RelatedEntityDimension[];
}

export interface Dimension {
  dimensionTargetId: number;
  dimensionId?: number;
  name: string;
  dataType: string;
  sourceType: string | null; // business or finance
  entityType: number | null; // system or dynamic
  sourceEntityName: string; // in case system entity
  sourceEntityId: number | null; // in case dynamic entity
  required: boolean;
  targetModule: string;
  targetEntity: string;
  targetColumn: string;
  columnName: string;
  value: any;
  objectValue: any;
}

export interface RelatedEntityDimension {
  dimensionTargetId: number;
  entitiy: string;
  targetFromColumn: string;
  targetToColumn: string;
  masterDataLevel: string;
}

export interface DimensionCardDetails {
  entityName?: string;
  entityId?: number;
}

export interface InLineDimensionCardDetails {
  cardKey?: string;
  tabKey?: string;
  entityName?: string;
  entityId?: number;
  rowIndex?: number;
  hasDimensions?: boolean;
  showCard?: boolean;
  inLineDimensions?: DimensionLineFieldConfigurationVM[];
}

export interface DimensionLineEntitiesConfigurationVM {
  entityConfigrations: { [entityName: string]: DimensionLineFieldConfigurationVM[]; };
}

export interface DimensionLineFieldConfigurationVM {
  dimensionTargetId: number;
  name: string;
  dataType: string;
  sourceType: string | null; // business or finance or Individual or HR or Lodging
  entityType: number | null; // system or dynamic
  sourceEntityName: string; // in case system entity
  sourceEntityId: number | null; // in case dynamic entity
  required: boolean;
  targetModule: string;
  targetEntity: string;
  targetColumn: string;
  columnName: string;
  dimensionLineFieldValues: InLineDimensionFieldValues[];
}

export interface InLineDimensionFieldValues {
  entityId: number;
  value: string;
  objectValue: any;
}

export interface DimensionLineEntitySM {
  entityName: string;
  entityIds: number[];
}

export enum DimensionCardType {
  InHeader = 'InHeader',
  InLine = 'InLine'
}

export interface EntityDimensionEntry {
  entityEntries?: DimensionEntry[];
  lineEntries?: { [key: string]: DimensionEntry[][]; };
}

export interface DimensionEntry {
  columnName: string;
  value: any;
  jsonValue: any;
}
export interface EntityDimensionEntry {
  entityEntries?: DimensionEntry[];
  lineEntries?: { [key: string]: DimensionEntry[][]; };
}

export enum DimensionUsageType {
  Additional = 'Additional',
  Distributive = 'Distributive',
}

export enum ProjectSourceType {
  Business = 'BS',
  Finance = 'FS',
  Individual = 'Ind',
  HR = 'HR',
  Lodging = 'LDG',
  IR = 'IR',
  PRL = 'PRL'
}
