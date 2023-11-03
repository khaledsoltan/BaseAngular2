import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetAttachmentByEntityNameAndIdDto } from '../../models/file-manager/get-attachment-by-entity-name-and-Id-dto';
import { UploadedFileBase64Dto } from '../../models/file-manager/uploaded-file-base64.dto';
import { DownloadedFile } from '../../models/file-manager/downloaded-file.model';
import { EntityNamesEnum } from '../../enums/enums';
import { Result } from '../../models/result/Result';
import { ImagesEnum } from 'src/app/modules/dentist/rfq/models/enums';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
  constructor(private http: HttpClient) { }

  upload(
    entityId: string,
    entityCode: string,
    sentToUserId: string,
    entityName: EntityNamesEnum,
    files: File[] = []
  ): Observable<number[]> {
    const formData = new FormData();
    formData.append('entityId', entityId);
    formData.append('entityCode', entityCode);
    formData.append('sentToUserId', sentToUserId);
    formData.append('entityName', entityName.toString());
    Array.from(files).map((file, index) => {
      formData.append('file' + index, file, file.name);
    });

    return this.http.post<number[]>(
      `${environment.apiUrl}/FileManager`,
      formData
    );
  }

  getAttachmentByEntityNameAndId(
    entityName: string,
    id: string
  ): Observable<GetAttachmentByEntityNameAndIdDto[]> {
    return this.http.get<GetAttachmentByEntityNameAndIdDto[]>(
      `${environment.apiUrl}/FileManager/GetByEntityNameAndId/${entityName}/${id}`
    );
  }
  delete(fileIds: [], sentToUserId: number, sendNotification: boolean) {
    return this.http.post<Result>(
      `${environment.apiUrl}/FileManager/DeleteUplaodedFile?sentToUserId=${sentToUserId}&sendNotification=${sendNotification}`, fileIds
    );
  }

  download(id: number) {
    this.http
      .get(`${environment.apiUrl}/FileManager/Download/${id}`)
      .subscribe((res: DownloadedFile) => {
        this.downloadFile(res);
      });
  }

  private downloadFile(res: DownloadedFile) {
    const byteCharacters = atob(res.base64File);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });

    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);

    a.download = res.fileName;
    a.href = URL.createObjectURL(blob);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }

  getByEntityId(entityId: string) {
    return this.http.get(
      `${environment.apiUrl}/FileManager/GetByEntityId/${entityId}`
    );
  }
  GetProfileImage(imageName: string, imageEnum: ImagesEnum){
    return this.http.get<any>(
      `${environment.apiUrl}/FileManager/GetProfileImage/${imageName}/${imageEnum}`
    );
  }
  getByEntityName(entityName: string) {
    return this.http.get(
      `${environment.apiUrl}/FileManager/GetByEntityName/${entityName}`
    );
  }
  getImageByFileId(fileId: number) {
    return this.http.get(
      `${environment.apiUrl}/FileManager/GetImageByFileId/${fileId}`
    );
  }

  getBase64ByEntityName(
    entityId: string,
    entityName: number
  ) {
    return this.http.get<UploadedFileBase64Dto[]>(
      `${environment.apiUrl}/FileManager/GetBase64ByEntityName/${entityId}/${entityName}`
    );
  }
  
}
