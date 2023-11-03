import { Injectable, EventEmitter, Output, Directive } from '@angular/core';
import { BaseDataService } from '../base-data/base-data-service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResults } from '../../models/result/PagedResults';
import { environment } from 'src/environments/environment';

@Directive()
@Injectable({
    providedIn: 'root'
})
export class MenuItemService extends BaseDataService<any> {
    @Output() change: EventEmitter<void> = new EventEmitter();

    constructor(_http: HttpClient) {
        super(_http, `${environment.apiUrl}/MenuItem`);
    }

    getSideMenuItems(): Observable<PagedResults<any>> {
        return this._http.get<PagedResults<any>>(
            `${this.serviceUrl}/GetSideMenuItems`
        );
    }

    getList(title: string): Observable<PagedResults<any>> {
        return this._http.get<PagedResults<any>>(
            `${this.serviceUrl}/GetSelectList?title=${title}`
        );
    }

    reload() {
        if (this.change) {
            this.change.emit();
        }
    }
}
