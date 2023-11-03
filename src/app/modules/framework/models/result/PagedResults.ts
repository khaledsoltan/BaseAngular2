import { EntityInfo } from './EntityResult';
export interface PagedResults<T> {
  metadata: MetaData;
  entities: T[];
  entityInfo: EntityInfo;
  success: boolean;
  message: string;
  addtionalData?: any;
  statusCode?: number;
}

export interface MetaData {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  firstItemOnPage: number;
  lastItemOnPage: number;
  pageCount: number;
  pageNumber: number;
  pageSize: number;
  totalItemCount: number;
}
