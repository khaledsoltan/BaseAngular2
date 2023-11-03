import { Component, OnInit, Input } from '@angular/core';
import {
  Language,
  LanguageService
} from '../../../services/language-service/language.service';
import { TranslateService } from '@ngx-translate/core';
import { FinanceEntityAttachmentsService } from '../../../services/entity-attachments/finance-entity-attachments.service';
import { BusinessEntityAttachmentsService } from '../../../services/entity-attachments/business-entity-attachments.service';

@Component({
  selector: 'app-entity-attachment-files',
  templateUrl: './entity-attachment-files.component.html',
  styleUrls: ['./entity-attachment-files.component.scss']
})
export class EntityAttachmentFilesComponent implements OnInit {
  /* #region  Fields &Probes */
  attachmentFiles: any[];
  lang: Language;
  /* #endregion */

  /* #region  Parameters */
  @Input('entityEntryId') sourceId: number;
  @Input('hasExpand') hasExpand: boolean;
  @Input('module') module: string;
  @Input('attachmentDocumentId') attachmentDocumentId;

  /* #endregion */

  /* #region  Construcor */
  constructor(
    private businessService: BusinessEntityAttachmentsService,
    private financeService: FinanceEntityAttachmentsService,
    private _language: LanguageService,
    private translate: TranslateService
  ) {
  }
  /* #endregion */

  /* #region  Events */
  ngOnInit() {
    this._language.LangChanged.subscribe(value => {
      this.lang = value;
      this.translate.use(this.lang);
    });

    if (this.hasExpand === null || this.hasExpand === undefined) {
      this.hasExpand = false;
    }
    if (this.attachmentDocumentId) {
      if (this.attachmentDocumentId > 0) {
        this.getAllAttachmentFiles(this.attachmentDocumentId);
      }
    }
  }
  /* #endregion */

  /* #region  Methods */
  getAllAttachmentFiles(attachmentDocumentId: number) {
    if (this.module === 'business') {
      this.businessService
        .getAllAttachmentFiles(attachmentDocumentId, this.sourceId)
        .subscribe(res => {

          if (res.success) {
            this.attachmentFiles = res.entities;
          }
        });

    } else if (this.module === 'finance') {
      this.financeService
        .getAllAttachmentFiles(attachmentDocumentId, this.sourceId)
        .subscribe(res => {

          if (res.success) {
            this.attachmentFiles = res.entities;
          }
        });

    }
  }
  /* #endregion */
}
