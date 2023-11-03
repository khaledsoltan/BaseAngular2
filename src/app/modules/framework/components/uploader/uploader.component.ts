import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { FileUpload } from 'primeng/fileupload';
import { saveAs } from 'file-saver';
import { FileStatus, UploadedFileBase64Dto } from '../../models/file-manager/uploaded-file-base64.dto';
import { FileManagerService } from '../../services/file-manager/file-manager.service';
import { FileType } from '../../enums/file-manager/file-type.enum';
import { Column, Pipes } from '../../models/data-list/data-list';
import { UserTypeEnum } from 'src/app/modules/operation/models/userType';
import { TranslateService } from '@ngx-translate/core';
import { AlertsService } from '../../services/alert/alerts.service';
import { LanguageService, Language } from '../../services/language-service/language.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { FileHelper } from '../../models/helpers/file';
import { EntityNamesEnum } from '../../enums/enums';
import { SpinnerDirective } from '../../directives/spinner/spinner.directive';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UploaderComponent
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: UploaderComponent
    }
  ]
})
export class UploaderComponent implements OnInit, ControlValueAccessor, Validator, OnChanges, OnDestroy {
  exTensionToView = ["jpeg", "png", "gif", "jpg"];

  @Input()
  isMultiple: boolean = true;
  @Input()
  fileSize: number = environment.maxAttachmentSize;
  fileSizeErrorMsg: any;
  @Input()
  acceptType: FileType = FileType.ImageAndPdf;
  uploadedFiles: UploadedFileBase64Dto[] = [];
  deletedAttachmentList: any = [];
  @Input() attachmentsViewOnly: boolean = false;
  @Input('entityId') entityId: string;
  @Input('entityNameId') entityNameId: EntityNamesEnum;
  @Input('entityCode') entityCode: string;
  @Input('sentToUserId') sentToUserId: number;
  @Output()
  onChange = new EventEmitter();
  @Output()
  @Output() onSaved = new EventEmitter<boolean>();
  @Output() onCanceled = new EventEmitter<boolean>();
  onUploadedFileDelete = new EventEmitter<any>();
  @ViewChild('uploader') uploader;
  isChoosebtnDisabled: boolean = false;
  isCustomUpload: boolean = true;
  isDisabled: boolean = false;
  uploadControl: FormControl = new FormControl();
  uploadedCount = 0;
  files: File[] = [];
  colNames: Column[] = [];
  viewUrl: string | ArrayBuffer;
  cardTitle = "attachment.list";
  currentUserType: UserTypeEnum;
  fileTypeError: boolean = false;
  fileSizeError: boolean = false;
  disableAttachmentSaveBtn: boolean = true;
  LangSubscription: Subscription;
  getBase64ByEntityNameSubscription: Subscription;

  @ViewChild('fileInput') fileInput: FileUpload;
  @ViewChild('imageViewer') imageViewer: HTMLElement;
  @ViewChild('actions', { static: true }) actions: TemplateRef<any> | any;
  @ViewChild('userType', { static: true }) userType: TemplateRef<any> | any;
  @ViewChild('fileType', { static: true }) fileType: TemplateRef<any> | any;
  @ViewChild('fileSizeTemplate', { static: true }) fileSizeTemplate: TemplateRef<any> | any;
  @ViewChild(SpinnerDirective, { static: false }) spinnerDirective: SpinnerDirective;
  get FileStatusEnum() {
    return FileStatus;
  }
  get UserTypeEnum() {
    return UserTypeEnum;
  }
  get FileHelper() {
    return FileHelper;
  }
  constructor(private fileManagerService: FileManagerService,
    private translate: TranslateService,
    private languagService: LanguageService,
    private _authService: AuthService,
    private alertsService: AlertsService
  ) {
  }
  ngOnDestroy(): void {
    if (this.LangSubscription) {
      this.LangSubscription.unsubscribe();
    }
    if (this.getBase64ByEntityNameSubscription) {
      this.getBase64ByEntityNameSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.LangSubscription = this.languagService.LangChanged.subscribe((value: Language) => {
      this.translate.use(value);
      this.fileSizeErrorMsg = this.translate.instant('attachment.fileSizeError',
        { maxSize: (environment.maxAttachmentSize / 1024) / 1024 })
    });

    if (this._authService.currentUser.usertype === UserTypeEnum.Dentist.toString()) {
      this.currentUserType = UserTypeEnum.Dentist;
    } else if (this._authService.currentUser.usertype === UserTypeEnum.Lab.toString()) {
      this.currentUserType = UserTypeEnum.Lab;
    }
    this.colNames = [
      {
        field: 'fileName',
        title: 'attachment.fileName',
      }, {
        field: '',
        title: 'attachment.fileType',
        cellTemplate: this.fileType
      },
      {
        field: '',
        title: 'attachment.fileSize',
        cellTemplate: this.fileSizeTemplate
      }, {
        field: 'creationDate',
        title: 'helpers.common.creationDate',
        pipe: Pipes.date
      },
      {
        field: 'userType',
        title: 'attachment.addedBy',
        cellTemplate: this.userType,
      },
      {
        field: '',
        title: '',
        cellTemplate: this.actions,
      }
    ]
    this.getAttachmentData();
  }
  getAttachmentData() {
    this.showLoader();
    this.getBase64ByEntityNameSubscription = this.fileManagerService.getBase64ByEntityName(this.entityId, this.entityNameId).subscribe((result) => {
      this.uploadedFiles = result;
      this.hideLoader();
    }, () => {
      this.hideLoader();
    });
  }
  onSaveAttachements() {
    this.deleteFiles();
  }
  deleteFiles() {
    this.showLoader();
    let sendNotification: boolean;
    if (this.files.length > 0) {
      sendNotification = false;
    } else {
      sendNotification = true;
    }
    // delete attachments
    if (this.deletedAttachmentList && this.deletedAttachmentList.length > 0) {
      this.fileManagerService.delete(this.deletedAttachmentList, this.sentToUserId, sendNotification).subscribe((res) => {
        this.hideLoader();
        this.uploadFiles();
        this.deletedAttachmentList.splice(0, this.deletedAttachmentList.length);
      }, () => {
        this.hideLoader();
      });
    }
    else {
      this.hideLoader();
      this.uploadFiles();
      this.deletedAttachmentList.splice(0, this.deletedAttachmentList.length);

    }
  }

  uploadFiles() {
    this.showLoader();
    if (this.files.length > 0) {
      this.fileManagerService
        .upload(
          this.entityId.toString(),
          this.entityCode.toString(),
          this.sentToUserId.toString(),
          this.entityNameId,
          this.files
        )
        .subscribe(
          (res) => {
            if (this.onSaved) {
              this.onSaved.emit();
            }
            if (res.length > 0) {
              this.alertsService.successMessage(this.translate.instant("helpers.messages.successUpdate"));
            }
            this.disableAttachmentSaveBtn = true;
            this.files.splice(0, this.files.length);
            this.hideLoader();
          }, () => {
            this.hideLoader();
          });
    } else {
      this.disableAttachmentSaveBtn = true;
      if (this.onSaved) {
        this.onSaved.emit();
      }
      this.hideLoader();
    }
  }
  onCancelAttachementDialoge() {
    this.disableAttachmentSaveBtn = true;
    if (this.onCanceled) {
      this.onCanceled.emit();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    this.changeChoosebtnStatus()
  }

  onClick(uploader) {
    if (this.fileInput)
      this.fileInput.choose();
  }
  onSelect(event) {
    event.files.forEach(element => {
      if (!this.acceptType.includes(element.type)) {
        this.fileTypeError = true;
      } else {
        this.fileTypeError = false;
      }
      if (element.size > environment.maxAttachmentSize) {
        this.fileSizeError = true;
      } else {
        this.fileSizeError = false;
      }
    })
  }
  onUpload(event: any) {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.fileStatus != FileStatus.New);
    event.files.forEach(element => {
      this.uploadedFiles.unshift({
        fileName: element.name,
        extention: '.' + element.name.split(".").pop(),
        fileSize: element.size,
        userType: this.currentUserType,
        creationDate: new Date(),
        fileStatus: FileStatus.New
      });
    });
    this.files = event.files;
    event.files = this.files;
    this.onChange.emit(event);
    this.uploadedCount = this.files.length;
    this.propagateChange(event);
    this.changeChoosebtnStatus();
    this.disableAttachmentSaveBtn = false;
  }

  download(file: File) {
    saveAs(file, file.name)
  }

  downloadUploadedFile(file: UploadedFileBase64Dto) {
    this.fileManagerService.download(file.id);
  }

  deleteFile(index) {
    this.files.splice(
      index,
      1
    );
    this.uploadedFiles.splice(
      index,
      1
    );
    this.onChange.emit({ files: this.files });
    this.uploadedCount = this.files.length;
    this.propagateChange({ files: this.files });
    this.changeChoosebtnStatus();
  }

  deleteUploadedFile(file) {
    this.alertsService.confirmMessage(
      this.translate.instant('helpers.messages.confirmDelete'),
      () => {
        this.disableAttachmentSaveBtn = false;
        this.onChange.emit(file);
        if (file.fileStatus == FileStatus.New) {
          var getFileIndex = this.uploadedFiles.findIndex(x => x.fileName === file.fileName);
          this.deleteFile(getFileIndex);
        } else {

          this.changeChoosebtnStatus();
          //this.onUploadedFileDelete.emit(file);
          this.onDeleteAttachment(file.id);
        }
      },
      this.translate.instant('helpers.messages.ok'),
      this.translate.instant('helpers.messages.cancel')
    )


  }
  onDeleteAttachment(fileId: number) {
    this.deletedAttachmentList.push(fileId);
    this.uploadedFiles.splice(
      this.uploadedFiles.findIndex((t) => t.id == fileId),
      1
    );
  }
  view(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.viewUrl = reader.result;
      document.getElementById("imageViewer").click();
    }
  }

  viewUploaedFile(file: UploadedFileBase64Dto) {
    this.viewUrl = null;
    setTimeout(() => {
      this.viewUrl = `${environment.apiUrl}/FileManager/GetImageByFileId/${file.id}`
      setTimeout(() => {
        document.getElementById("imageViewer").click();
      }, 0);
    }, 0);
  }

  changeChoosebtnStatus() {
    if (!this.isMultiple
      && (this.files.length > 0
        || (this.uploadedFiles && this.uploadedFiles.length > 0))) {
      this.isChoosebtnDisabled = true;
    } else {
      this.isChoosebtnDisabled = false;
    }
  }

  private propagateChange = (_: any) => { };
  private propagateTouched = () => { };

  writeValue(val: any): void {
    this.uploadControl.setValue(val);
  }

  registerOnChange(fn: any): void {

    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {

    this.isDisabled = isDisabled;
  }

  onRemove(event) {
    this.onChange.emit(event);
    this.uploadedCount -= 1;
    this.propagateChange(null);
  }

  clear() {
    this.files = [];
    //this.onChange.emit(event);
    this.uploader.clear();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return null;
  }

  isFileAvailbleForView(file: File) {
    var ext = file.name.split('.')[1];
    return this.exTensionToView.includes(ext.toString().toLowerCase())
  }

  isUploadedFileAvailbleForView(file: UploadedFileBase64Dto) {

    var ext = file.extention.split('.')[1];
    return this.exTensionToView.includes(ext.toString().toLowerCase())
  }
  showLoader() {
    setTimeout(() => this.spinnerDirective.showSpinner(), 0);
  }

  hideLoader() {
    setTimeout(() => this.spinnerDirective.hideSpinner(), 0);
  }
}

