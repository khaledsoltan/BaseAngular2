import { PagedResults } from './../../models/result/PagedResults';
import { SearchModel } from './../../models/search-model/SearchModel';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseDataService } from '../base-data/base-data-service';
import { ListResult } from '../../models/result/ListResult';
import { Dimension, DimensionConfiguration, DimensionLineEntitiesConfigurationVM, DimensionLineEntitySM } from '../../models/dimesnion/dimension';
import { Observable } from 'rxjs';
import { Result } from '../../models/result/Result';
import { EntityResults } from '../../models/result/EntityResults';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ListItem } from '../../models/List-item/ListItem';

@Injectable({
  providedIn: 'root',
})
export class DimensionService extends BaseDataService<any> {
  constructor(
    _http: HttpClient
  ) {
    super(_http, `${environment.apiUrl}/Dimension`);
  }

  getTargetDimensionConfigurations(entityName: string, entityId?: number) {
    return this._http.get<Result<DimensionConfiguration>>(
      `${this.serviceUrl
      }/GetTargetDimensionConfigurations?targetEntityName=${entityName}&entityEntryId=${entityId || 0
      }`
    );
  }

  getTargetDimensions(moduleNames: string[], entitySM: SearchModel) {
    return this._http.get<PagedResults<Dimension>>(
      `${this.serviceUrl
      }/GetTargetDimensions?moduleNames=${moduleNames}&${this.getQueryParams(entitySM)}`
    );
  }

  getTargetLineDimensionConfigurations(dimensionLineSM: DimensionLineEntitySM[]) {
    return this._http.put<Result<DimensionLineEntitiesConfigurationVM>>(
      `${this.serviceUrl}/GetTargetLineDimensionConfigurations?`,
      dimensionLineSM
    );
  }

  getBusinessFieldEntrySelectList(params: {
    sourceId: number;
    fieldValue?: string;
  }) {
    return this._http.get<ListResult<ListItem>>(
      `${environment.apiUrl
      }/EntityEntry/GetFieldEntrySelectList?${this.getQueryParams(params)}`
    );
  }

  getBusinessAllFieldEntrySelectList(sourceId: number) {
    return this._http.get<ListResult<ListItem>>(
      `${environment.apiUrl
      }/EntityEntry/GetAllFieldEntrySelectList?sourceId=${sourceId || ''}`
    );
  }

  getBusinessDomainTypeEntries(
    searchModel,
    domainType?: string
  ): Observable<ListResult<any>> {
    return this._http.get<ListResult<any>>(
      `${environment.apiUrl
      }/Dimension/getDomainTypeEntries?domainType=${domainType}&${this.getQueryParams(
        searchModel
      )}`
    );
  }

  getFinanceFieldEntrySelectList(params: {
    sourceId: number;
    fieldValue?: string;
  }) {
    return this._http.get<ListResult<ListItem>>(
      `${environment.apiUrl
      }/EntityEntry/GetFieldEntrySelectList?${this.getQueryParams(params)}`
    );
  }

  getFinanceAllFieldEntrySelectList(sourceId: number) {
    return this._http.get<ListResult<ListItem>>(
      `${environment.apiUrl
      }/EntityEntry/GetAllFieldEntrySelectList?sourceId=${sourceId || ''}`
    );
  }

  getFinanceDomainTypeEntries(
    searchModel,
    domainType?: string
  ): Observable<ListResult<any>> {
    return this._http.get<ListResult<any>>(
      `${environment.apiUrl
      }/Dimension/getDomainTypeEntries?domainType=${domainType}&${this.getQueryParams(
        searchModel
      )}`
    );
  }

  getRelatedDimensionValue(
    relatedDimensionEntityIds: number[],
    entityName: string,
    entityEntryId: number
  ): Observable<EntityResults<any>> {
    return this._http.get<EntityResults<any>>(
      `${this.serviceUrl}/GetRelatedDimensionValue?${this.getParamsFromArray(
        'ids',
        relatedDimensionEntityIds
      )}&entityName=${entityName}&entityEntryId=${entityEntryId || 0}`
    );
  }

  getIndividualEntityData(
    query: string,
    pageSize: any,
    typeID?: any
  ): Observable<ListResult<any>> {
    return this._http.get<Data>(
      `${environment.apiUrl
      }/productivity/api/v1/lookup/getentitydata`
      , {
        params: {
          'TypeId': typeID,
          // '$filter:id': query,
          '$filter:desc:id': query,
          '$page': '1',
          '$size': pageSize
        }
      }).pipe(map(x => {
        return {
          entities: x.Data.map(d => { return { id: d.Id, name: d.Desc }; }),
          success: true,
          message: ""
        };
      }));
  }

  getManpowerEntityData(
    query: string,
    pageSize: any,
    typeID?: any
  ): Observable<ListResult<any>> {
    return this._http.get<ManpowerResult<Data>>(
      `${environment.apiUrl
      }/api/v1/common/lookup/getentitydata`
      , {
        params: {
          'typeID': typeID,
          // '$filter:id': query,
          '$filter:desc:id': query,
          '$page': '1',
          '$size': pageSize
        }
      }).pipe(map(x => {
        return {
          entities: x.Data.Data.map(d => { return { id: d.Id, name: d.Desc }; }),
          success: x.Succeeded,
          message: x.Message
        };
      }));
  }
}
export interface EntityData {
  Id: string;
  Desc: string;
  RecId: number;
  DescAr: string;
}

export interface Data {
  Data: EntityData[];
  TotalCount: number;
}

export interface ManpowerResult<T> {
  Succeeded: boolean;
  Message: string;
  StatusCode: number;
  Data: T;
  Errors?: any;
  Detail?: any;
  Id: number;
}
