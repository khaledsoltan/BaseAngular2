import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {
  Language,
  LanguageService
} from '../../../services/language-service/language.service';
import { PageListConfig } from '../../../models/page-list/page-list';
import { DataListConfig } from '../../../models/data-list/data-list';
import {
  ActionList,
  ActionListType,
  ActionData,
  ActionOption
} from '../../../models/action/actions';
import { TranslateService } from '@ngx-translate/core';
import { FileHelper } from 'src/app/modules/framework/models/helpers/file';
import { ActionTypeEnum } from '../../../enums/action/action-type-tnum';
import { BusinessEntityAttachmentsService } from '../../../services/entity-attachments/business-entity-attachments.service';
import { FinanceEntityAttachmentsService } from '../../../services/entity-attachments/finance-entity-attachments.service';

@Component({
  selector: 'app-entity-attachment-files-grid',
  templateUrl: './entity-attachment-files-grid.component.html',
  styleUrls: ['./entity-attachment-files-grid.component.scss']
})
export class EntityAttachmentFilesGridComponent implements OnInit {
  /* #region  Fields & Properties */
  tableCols: {
    field: string;
    title: any;
    hidden: boolean;
    frozen: boolean;
  }[];
  _linesData: any;
  lang: Language;
  pageListConfig: PageListConfig;
  dataListConfig: DataListConfig;
  rowActions: ActionList;
  get linesData() {
    return this._linesData;
  }

  @Input('linesData') set linesData(value: any) {
    if (value) {
      this._linesData = value;
      this.getTableCols();
    }
  }
  @Input('module') module: string;

  @Input('hasExpand') hasExpand: boolean;

  /* #endregion */

  /* #region  constructor */
  constructor(
    private translate: TranslateService,
    private _language: LanguageService,
    private businessService: BusinessEntityAttachmentsService,
    private financeService: FinanceEntityAttachmentsService
  ) { }
  /* #endregion */

  /* #region  Events */
  ngOnInit() {
    this._language.LangChanged.subscribe(value => {
      this.translate.use(value);
      if (this.linesData) {
        this.getTableCols();
      }
      this.lang = value;
    });
    this.rowActions = {
      type: ActionListType.onGrid,
      list: [
        {
          type: ActionTypeEnum.download,
          title: '',
          getTitle: () => {
            return this.translate.instant('helpers.common.download');
          },
          options: ActionOption.icon,
          onClick: (data: ActionData) => {
            if (this.module === 'finance') {
              this.financeService.getAttachment(data.params.id).subscribe(res => {
                FileHelper.downloadFile(
                  res,
                  'application/octet-stream',
                  data.params.fileName + '.' + data.params.extension
                );
              });
            }
            else if (this.module === 'business') {
              this.businessService.getAttachment(data.params.id).subscribe(res => {
                FileHelper.downloadFile(
                  res,
                  'application/octet-stream',
                  data.params.fileName + '.' + data.params.extension
                );
              });
            }
          }
        }
      ]
    };
  }
  /* #endregion */

  /* #region  Methods */
  getTableCols() {
    this.tableCols = [
      { field: 'actions', title: '', hidden: false, frozen: true },
      {
        field: 'fileName',
        title: 'export.fileName',
        hidden: false,
        frozen: false
      },
      {
        field: 'version',
        title: 'documentTypes.version',
        hidden: false,
        frozen: false
      }
    ];
  }
}
