import { Injectable, Optional, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseDataService } from '../base-data/base-data-service';
import { Observable } from 'rxjs';
import { ListResult } from '../../models/result/ListResult';
import { PagedResults } from '../../models/result/PagedResults';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinanceEntityAttachmentsService extends BaseDataService<any> {
  constructor(
    _http: HttpClient
  ) {

    super(_http, `${environment.apiUrl}/AllAttachments`);
  }
  getAttachment(fileName: string): Observable<Blob> {
    return this._http.get<Blob>(
      `${this.serviceUrl}/GetAttachment/${fileName}`,
      { responseType: 'blob' as 'json' }
    );
  }
  uploadAttachmentFile(
    attachmentDocumentTypeId: number,
    file: string,
    fileType: string,
    fileName: string,
    sourceId: number,
    sourceName: string
  ) {
    return this._http.post<any>(`${this.serviceUrl}`, {
      AttachmentDocTypeId: attachmentDocumentTypeId,
      fileContent: file,
      extention: fileType,
      fileName: fileName,
      EntityEntryId: sourceId,
      EntityName: sourceName
    });
  }
  getAllAttachmentFiles(attachmentDocumentTypeId, sourceId) {
    return this._http.get<ListResult<any>>(
      // tslint:disable-next-line:max-line-length
      `${this.serviceUrl}/GetFilesOfDocTypes?AttachmentDocTypeId=${attachmentDocumentTypeId}&EntityEntryId=${sourceId}&forPortal=${true}`
    );
  }
  getManyAttachment(
    entityName: string,
    entityId: number
  ): Observable<PagedResults<any>> {
    return this._http.get<PagedResults<any>>(
      `${this.serviceUrl}/GetManyDocTypes?entityName=${entityName}&entityEntryId=${entityId}&forPortal=${true}`
    );
  }
}
