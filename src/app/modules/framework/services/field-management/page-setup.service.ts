import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ListItem } from '../../models/List-item/ListItem';
import { PagedResults } from '../../models/result/PagedResults';
import { Result } from '../../models/result/Result';
import { BaseDataService } from '../base-data/base-data-service';

@Injectable({
  providedIn: 'root'
})
export class PageSetupService extends BaseDataService<any> {
  constructor(
    _http: HttpClient
  ) {
    super(_http, `${environment.apiUrl}/PageSetup`);
  }

  GetPageSelectList(name) {
    return this._http.get<PagedResults<ListItem>>(
      `${this.serviceUrl}/GetPageSelectList?name=${name}`
    );
  }
  GetPageFields(pageKey: string, user: any) {
    return this._http.get<PagedResults<ListItem>>(
      `${this.serviceUrl}/GetPageFields?pageKey=${pageKey}&userId=${user}`
    );
  }


  GetPageSetup(pageKey: string) {
    return this._http.get<PagedResults<ListItem>>(
      `${this.serviceUrl}/GetPageSetup?pageKey=${pageKey}`
    );
  }

  GetPagesSetup(pageKeys: string[]) {
    return this._http.get<Result<any>>(`${this.serviceUrl}/GetPagesSetup?`, {
      params: { pageKeys }
    });
  }
}
