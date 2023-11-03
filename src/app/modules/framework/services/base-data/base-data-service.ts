import { PagedResults } from '../../models/result/PagedResults';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntityResult } from '../../models/result/EntityResult';
import { Result } from '../../models/result/Result';
import { SearchModel } from '../../models/search-model/SearchModel';
import { ActivateVM } from '../../models/activate/activateVM';
import { AlertsService } from '../alert/alerts.service';
import { map } from 'rxjs/operators';
import { appInjector } from 'src/main';
import { Router } from '@angular/router';
import { CommonUrls } from '../../models/common-urls';

export abstract class BaseDataService<T> {
  protected alertService: AlertsService;
  constructor(protected _http: HttpClient, protected serviceUrl: string) {
    this.alertService = new AlertsService();
  }

  getAll = (searchModel?: SearchModel): Observable<PagedResults<T>> => {
    return this._http.get<PagedResults<T>>(
      `${this.serviceUrl}/GetMany?${this.getQueryParams(searchModel)}`
    ).pipe(
      map(data => {
        const router: Router = appInjector().get(Router);
        if (data.statusCode === 404) {
          router.navigate([CommonUrls.notFound]);
        } else if (data.statusCode === 401) {
          router.navigate([CommonUrls.notAuthorized]);

        }
        return data;
      })
    );
  };

  getById(id: number): Observable<EntityResult<T>> {
    return this._http.get<EntityResult<T>>(`${this.serviceUrl}/Get/${id}`).pipe(
      map(data => {
        const router: Router = appInjector().get(Router);
        if (data.statusCode === 404) {
          router.navigate([CommonUrls.notFound]);
        } else if (data.statusCode === 401) {
          router.navigate([CommonUrls.notAuthorized]);

        }
        return this.mapEntityData(data);
      })
    );
  }

  create<T>(entity: T): Observable<EntityResult<T>> {
    return this._http.post<EntityResult<T>>(this.serviceUrl, entity).pipe(
      map(data => {
        const router: Router = appInjector().get(Router);
        if (data.statusCode === 404) {
          router.navigate([CommonUrls.notFound]);
        } else if (data.statusCode === 401) {
          router.navigate([CommonUrls.notAuthorized]);

        }
        return this.mapEntityData(data);
      })
    );
  }

  update<T>(entity: T): Observable<EntityResult<T>> {
    return this._http.put<EntityResult<T>>(this.serviceUrl, entity).pipe(
      map(data => {
        const router: Router = appInjector().get(Router);
        if (data.statusCode === 404) {
          router.navigate([CommonUrls.notFound]);
        } else if (data.statusCode === 401) {
          router.navigate([CommonUrls.notAuthorized]);

        }
        return this.mapEntityData(data);
      })
    );
  }

  protected getQueryParams(searchModel: any) {
    let params = '';
    for (const key in searchModel) {
      if (searchModel.hasOwnProperty(key)) {
        if (params) {
          if (
            key &&
            searchModel[key] !== '' &&
            searchModel[key] !== null &&
            searchModel[key] !== undefined
          ) {
            if (Array.isArray(searchModel[key])) {
              params +=
                searchModel[key].length > 0
                  ? `&${this.getParamsFromArray(key, searchModel[key])}`
                  : '';
            } else {
              params += `&${key}=${searchModel[key]}`;
            }
          }
        } else {
          if (
            key &&
            searchModel[key] !== '' &&
            searchModel[key] !== null &&
            searchModel[key] !== undefined
          ) {
            if (Array.isArray(searchModel[key])) {
              params +=
                searchModel[key].length > 0
                  ? `${this.getParamsFromArray(key, searchModel[key])}`
                  : '';
            } else {
              params += `${key}=${searchModel[key]}`;
            }
          }
        }
      }
    }
    return params;
  }
  getParamsFromArray(fieldName: string, array: any[]) {
    if (fieldName && array && array.length > 0) {
      let params = '';

      for (let index = 0; index < array.length; index++) {
        const searchModel = array[index];
        if (searchModel && typeof searchModel === 'string') {
          params += params ? '&' : '';
          params += `${fieldName}[${index}]=${searchModel}`;
        } else if (searchModel) {
          if (Object.keys(searchModel) && Object.keys(searchModel).length > 0) {

            for (const key in searchModel) {
              if (searchModel.hasOwnProperty(key)) {
                if (
                  key &&
                  searchModel[key] !== '' &&
                  searchModel[key] !== null &&
                  searchModel[key] !== undefined
                ) {
                  params += params ? '&' : '';
                  params += `${fieldName}[${index}].${key}=${searchModel[key]}`;
                }
              }
            }
          } else {
            params += params ? '&' : '';
            params += `${fieldName}[${index}]=${searchModel}`;
          }
        }

      }
      return params;
    }
    return '';
  }

  activate = (activateVM: ActivateVM): Observable<Result> => {
    return this._http.put<Result>(`${this.serviceUrl}/Activate`, activateVM);
  };


  private mapEntityData<T>(data: EntityResult<T>) {
    if (data.entityInfo &&
      data.entityInfo.stageEntryDetails &&
      data.entityInfo.stageEntryDetails.stageEntryDataVMs) {
      const current = data.entityInfo.stageEntryDetails.stageEntryDataVMs.find(
        (stage: { isHead: boolean; }) => stage.isHead === true
      );
      if (current) {
        current.isVisited = false;
      }
      if (current) {
        data.entityInfo.currentStageInfo = current.stageData;
      }
    }
    return data;
  }
  buildFormData(formData, data, parentKey?) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
      Object.keys(data).forEach(key => {
        this.buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
      });
    } else {
      if (data != undefined && data != null) {
        formData.append(parentKey, data);
      }
    }
  }
}
