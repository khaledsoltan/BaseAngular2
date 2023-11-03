import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BaseDataService } from '../../services/base-data/base-data-service';
import { Result } from '../../models/result/Result';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService extends BaseDataService<any>{

  constructor(_http: HttpClient) {
    super(_http, `${environment.apiUrl}/Message`);
  }
  sendMessage(data) {
    return this._http.post<Result<any>>(
      `${this.serviceUrl}/SendMessage`, data
    );
  }
  delete(id) {
    return this._http.post<Result<any>>(`${this.serviceUrl}/Delete`, id);
  };

}
