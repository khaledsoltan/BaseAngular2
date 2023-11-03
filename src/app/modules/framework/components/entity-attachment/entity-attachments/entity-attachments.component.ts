import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef,
  ElementRef,
  Inject
} from '@angular/core';

import { FileUpload } from 'primeng/fileupload';
import { PageListConfig } from '../../../models/page-list/page-list';
import {
  AdvancedSearchConfig,
  SearchFieldTypesEnum,
  Operators
} from '../../../models/advanced-search/advanced-search';
import {
  DataListConfig,
  Column,
  StaticTab,
  RowExpansionMode
} from '../../../models/data-list/data-list';
import {
  ActionList,
  ActionListType,
  ActionOption,
  ActionData
} from '../../../models/action/actions';
import {
  Language,
  LanguageService
} from '../../../services/language-service/language.service';
import {
  SearchFieldVm,
  SearchModel
} from '../../../models/search-model/SearchModel';
import { PageListComponent } from '../../page-list/page-list.component';
import { TranslateService } from '@ngx-translate/core';
import { FileHelper } from 'src/app/modules/framework/models/helpers/file';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SpinnerDirective } from '../../../directives/spinner/spinner.directive';
import { ActionTypeEnum } from '../../../enums/action/action-type-tnum';
import { environment } from 'src/environments/environment';
import { BusinessEntityAttachmentsService } from '../../../services/entity-attachments/business-entity-attachments.service';
import { FinanceEntityAttachmentsService } from '../../../services/entity-attachments/finance-entity-attachments.service';
import { Observable } from 'rxjs';
import { PagedResults } from '../../../models/result/PagedResults';

declare let $: any;

@Component({
  selector: 'app-entity-attachments',
  templateUrl: './entity-attachments.component.html',
  styleUrls: ['./entity-attachments.component.scss']
})
export class EntityAttachmentsComponent implements OnInit {
  /* #region  Fields && Props list */
  pageListConfig: PageListConfig;
  advancedSearchConfig: AdvancedSearchConfig;
  dataListConfig: DataListConfig;
  dataItems: Column[];
  titleActions: ActionList;
  hoverActions: ActionList;
  rowActions: ActionList;
  commonActions: ActionList;
  file: any;
  colNames: Column[];
  form: FormGroup;
  attachmentFilters: any;
  formSubmitted;
  changeLang: Language;
  stages_static: any[];
  showDataList: Boolean = false;
  currentTab: StaticTab;
  fileName: string;
  constFilters: SearchFieldVm[];
  attachmentDocumentTypeId: number;
  disable = false;
  fileType: string;
  getItemsList?: (searchModel: SearchModel) => Observable<PagedResults<any>>;
  /* #endregion */

  /* #region  parameters  */
  @Input('module') module: string;

  @Input('hasAdvancedSearch') hasAdvancedSearch: boolean;
  @ViewChild(SpinnerDirective)
  spinnerDirective: SpinnerDirective;

  @Input('filterAttachment') set filterAttachment(filterAttachment: any) {
    if (
      filterAttachment &&
      filterAttachment.sourceName &&
      filterAttachment.sourceId
    ) {
      this.attachmentFilters = filterAttachment;
      this.initForm();

      this.setDefaultValues();
      this.initPageList();
    }
  }

  @ViewChild(PageListComponent)
  pageListComponent: PageListComponent;
  @ViewChild('attachmentEntityFiles', { static: true })
  attachmentEntityFiles: TemplateRef<any>;
  @ViewChild('uploadAttachmentFileModal')
  uploadAttachmentFileModal: ElementRef;
  @ViewChild('fileUploader') fileUploader: FileUpload;

  /* #endregion */

  /* #region  constructor   */
  constructor(
    private translate: TranslateService,
    private _language: LanguageService,
    private businessAttachmentSerivce: BusinessEntityAttachmentsService,
    private financeAttachmentSerivce: FinanceEntityAttachmentsService,
    private _formBuilder: FormBuilder,
  ) { }
  /* #endregion */

  /* #region  Events */
  ngOnInit() {
    this._language.LangChanged.subscribe(value => {
      this.changeLang = value;
      this.translate.use(this.changeLang);
    });
    this.getItemsList = (searchModel) => this.getAll(searchModel)
  }
  /* #endregion */

  /* #region  Methods*/
  get maxDocumentSize() {
    return environment.maxDocumentSize;
  }
  initForm() {
    this.form = this._formBuilder.group({
      fieldContent: ['', [Validators.required]]
    });
  }
  setDefaultValues() {
    if (
      this.hasAdvancedSearch == null ||
      this.hasAdvancedSearch === undefined
    ) {
      this.hasAdvancedSearch = false;
    }
  }

  initPageList() {
    this.advancedSearchConfig = {
      cardTitle: 'attachment.searchCardTitle',
      showOperators: true,
      searchFields: [
        {
          title: 'attachment.documentType',
          type: SearchFieldTypesEnum.Text,
          key: 'documentTypeEn',
          isLocalized: true
        },
        {
          title: 'attachment.sourceName',
          type: SearchFieldTypesEnum.Text,
          key: 'entityName',
          isLocalized: false
        },
        {
          title: 'attachment.sourceId',
          type: SearchFieldTypesEnum.Number,
          key: 'sourceId',
          isLocalized: false
        },
        {
          title: 'attachment.version',
          type: SearchFieldTypesEnum.Number,
          key: 'version',
          isLocalized: false
        },
        {
          title: 'attachment.ext',
          type: SearchFieldTypesEnum.Text,
          key: 'ext',
          isLocalized: false
        }
      ]
    };

    this.pageListConfig = {
      hasAdvancedSearch: false,
      showAdvancedSearch: false,
      hasCommonActions: false,
    };

    this.colNames = [
      { field: 'actions', title: '', frozen: true },
      {
        field: 'attachmentName',
        title: 'attachment.documentType',
        searchField: {
          type: SearchFieldTypesEnum.Text,
          showOperators: true,
          isLocalized: true
        }
      },
      {
        field: 'doctypeName',
        title: 'documentTypes.documentType',
        searchField: {
          type: SearchFieldTypesEnum.Text,
          showOperators: true,
          isLocalized: true
        }
      },
      {
        field: 'fileName',
        title: 'export.fileName',
        searchField: {
          type: SearchFieldTypesEnum.Text,
          showOperators: true,
          isLocalized: false
        }
      },
      {
        field: 'version',
        title: 'documentTypes.version',
        searchField: {
          type: SearchFieldTypesEnum.Number,
          showOperators: true,
          isLocalized: false
        }
      },
      {
        field: 'extension',
        title: 'documentTypes.extension',
        searchField: {
          type: SearchFieldTypesEnum.Number,
          showOperators: true,
          isLocalized: false
        }
      }
    ];

    this.dataListConfig = {
      title: 'attachment.list',
      dataKey: 'attachmentDocTypeId',
      getItemsList: searchModel => this.getAll(searchModel),
      disableScrollable: false,
      showOperators: true,
      hasActivateAction: false,
      hasUpdateAction: false,
      hasTitleActions: false,
      hasRowExpansion: true,
      exportFile: { excel: false, pdf: false, word: false },
      expansionMode: RowExpansionMode.multiple,
      expansionTemplate: this.attachmentEntityFiles
    };

    // Table Row Actions
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
          hidden: (params) => !params.version,
          onClick: (data: ActionData) => {

            if (this.module === 'finance') {
              this.financeAttachmentSerivce
                .getAttachment(data.params.fileId)
                .subscribe(
                  res => {
                    FileHelper.downloadFile(
                      res,
                      'application/octet-stream',
                      data.params.fileName + '.' + data.params.extension
                    );
                  }
                );
            }
            else if (this.module === 'business') {
              this.businessAttachmentSerivce
                .getAttachment(data.params.fileId)
                .subscribe(
                  res => {


                    FileHelper.downloadFile(
                      res,
                      'application/octet-stream',
                      data.params.fileName + '.' + data.params.extension
                    );
                  }
                );
            }
          }
        }
      ],
      moreActions: []
    };
  }

  getAll(searchModel: SearchModel) {
    searchModel.searchFields = searchModel.searchFields.concat(
      this.constFilters
    );
    if (this.module === 'finance') {
      return this.financeAttachmentSerivce.getManyAttachment(
        this.attachmentFilters.sourceName,
        this.attachmentFilters.sourceId
      );
    } else if (this.module === 'business') {
      return this.businessAttachmentSerivce.getManyAttachment(
        this.attachmentFilters.sourceName,
        this.attachmentFilters.sourceId
      );
    }
    return null;
  }
  /* #endregion */
}
