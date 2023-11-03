import { UserTypeEnum } from "src/app/modules/operation/models/userType";

export interface UploadedFileBase64Dto {
    id?: number;
    base64File?: string;
    fileName: string;
    extention: string;
    fileSize: string;
    userType: UserTypeEnum;
    creationDate: Date;
    fileStatus?: FileStatus
}

export enum FileStatus {
    Uploaded = 1, New = 2
}