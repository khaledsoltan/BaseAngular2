import { BadgeConfig, CellTemplateTypes, ColSearchField, ColumnWidth, DefaultGridSettings, DefaultSelectedStages, ExportFile, ExportFileSelection, ExportTypes, Pipes, RowExpansionMode, SortOrderEnum, StaticTab, ViewTypes } from './../../models/data-list/data-list';
import { Component, OnInit, ViewChild, Input, TemplateRef, Output, EventEmitter, ContentChild, ElementRef, OnDestroy } from '@angular/core';
import { Column, DataListConfig, WorkflowProcessStage } from '../../models/data-list/data-list';
import { SearchFieldVm, SearchModel } from '../../models/search-model/SearchModel';
import { EntityInfo } from '../../models/result/EntityResult';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Language, LanguageService } from '../../services/language-service/language.service';
import { AdvancedSearchConfig, ColumnFilterTypes, Operators, SearchFieldTypes, SearchFieldTypesEnum } from '../../models/advanced-search/advanced-search';
import { Observable } from 'rxjs/internal/Observable';
import { PagedResults } from '../../models/result/PagedResults';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsService } from '../../services/alert/alerts.service';
import { ExportFileService } from '../../utilities/export-file';
import { SpinnerDirective } from '../../directives/spinner/spinner.directive';
import { Breadcrumb } from '../breadcrumb/breadcrumb.component';
import { ActionData, ActionIcon, ActionList, ActionListType, ActionOption } from '../../models/action/actions';
import { ActionTypeEnum } from '../../enums/action/action-type-tnum';
import { EntityNamesEnum, TabsTypes } from '../../enums/enums';
import { ActivateVM } from '../../models/activate/activateVM';
import { Result } from '../../models/result/Result';
import { Reflection } from '../../utilities/reflection';
import { DatePipe } from '@angular/common';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search.component';
import { SelectItem } from 'primeng/api';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { FilterAttachments } from '../../helpers/entity-attachments/file-entity-entry';
import { PagePermissions } from 'src/app/modules/auth/models/page-permissions';
import { Subscription } from 'rxjs';
import { TableAction } from '../../models/file-manager/table-action.model';
import { UploaderComponent } from '../uploader/uploader.component';
import { UploadedFileBase64Dto } from '../../models/file-manager/uploaded-file-base64.dto';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { UserTypeEnum } from 'src/app/modules/operation/models/userType';

declare let $: any;
@Component({
  selector: 'app-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss']
})
export class DataListComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  cols: any[] = [];
  selectedItems: any[] = [];
  displayLoading = true;
  displayLoadingStages: boolean = false;
  pageMetadata: any;
  entityInfo: EntityInfo = {};
  currentLang: Language = Language.English;
  activeTabIndex: number = 0;
  searchForm: FormGroup;
  exportFileForm: FormGroup;
  exportFormSubmitted: boolean = false;
  quickFiltersFormGroup: FormGroup;
  allColumns: Column[] = [];
  attachmentFilter: FilterAttachments;
  addAttachmentsRowAction: ActionIcon;
  isFullScreen: boolean = false;
  attachementAction: TableAction = null;
  entityId = null;
  entityCode = null;
  showAttachements = false;
  showSendMsg = false;
  showViewMsg = false;
  sentToUserId = null;
  currentUserType: UserTypeEnum;
  filebase: UploadedFileBase64Dto[] | null = [];
  files: File[] = [];
  // cardView: boolean = false;

  /* #region  Private Fields */
  private defaultSelectedStage = DefaultSelectedStages.Pending;
  searchModel: SearchModel = { searchFields: [] };
  private _stages: WorkflowProcessStage[] = [];
  private _selectedStage: WorkflowProcessStage = {
    stageSystemAction: []
  };
  private _tabs: StaticTab[] = [];
  private tabSearchField: SearchFieldVm = { fieldName: '', value: '' };
  private _selectedTab: StaticTab = { title: '' };
  private _constFilters: SearchFieldVm[];
  /* #endregion */

  /* #region  Input Parametters */
  @Input('columns') columns: Column[] = [];
  @Input() pageTitle: any;
  @Input() title = '';
  @Input() subTitle = '';
  @Input() cardTitle = '';
  @Input() exportTitle = '';
  @Input() cardSubTitle = '';
  @Input() hasBreadCrumb?: boolean = true;
  @Input() breadCrumbTitle = '';
  @Input() pageType = '';
  @Input() hasDetailsBtn: boolean = false;
  @Input() viewBtnTitle = 'helpers.buttons.viewButton';
  @Input() keepSelectionOnLazyLoading: boolean = false;
  @Input() viewBtnClass: string = 'btn-solid';
  @Input() hasCreateAction: boolean = false;
  @Input() hasSendMessageAction: boolean = false;
  @Input() hasViewMessageAction: boolean = false;
  @Input('config') config: DataListConfig = {}
  // @Input('badgeConfig') badgeConfig: BadgeConfig = {};
  @Input('itemsList') itemsList: any[] = [];
  // @Input() getBadgeTitle?: (entity?: any) => string;
  //  @Input() getBadgeClass?: (entity: any) => string;
  @Input() getBadgeConfig?: (entity?: any) => BadgeConfig;

  @Input() getItemsList?: (searchModel?: any) => Observable<PagedResults<any>>;
  @Input() viewType: ViewTypes = ViewTypes.Grid;
  @Input() disablePaginator: boolean = false;
  @Input() alwaysShowPaginator: boolean = true;
  @Input() hasSortOrderAction: boolean = true;
  @Input() hasChangeViewAction: boolean = true;
  @Input() hasPrintSetupBtn: boolean = true;
  @Input() dataKey: string = 'id';
  @Input() codeKey: string = 'code';
  @Input() disableLazy?: boolean;
  @Input() defSortBy?: string = 'id';
  @Input() defSortOrder = SortOrderEnum.Desc;
  @Input() displayLoader?: boolean;
  @Input() hiddenGridHeader?: boolean = false;
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() tabsType = TabsTypes.Dropdown;
  @Input() rowActions: ActionList;
  @Input() titleActions: ActionList;
  @Input() cardHeader: string = '';
  @Input() cardHeaderKey: string = '';
  @Input() hasDetailsAction: boolean = false;
  @Input() hasDeleteAction: boolean = false;
  @Input() hasActivateAction: boolean = false;
  @Input() hasUpdateAction: boolean = false;
  @Input() hasCloneAction: boolean = false;
  @Input() hasFullScreenAction: boolean = true;
  @Input() hasRefreshAction: boolean = false;
  @Input() hasTitleActions: boolean = true;
  @Input() hasToggleColumsAction: boolean = false;
  @Input() hideRowActions?: boolean = false;
  @Input() hasExport?: boolean = false;
  @Input() additionalParams: any;
  @Input() hasAttachments: boolean = false;
  @Input() attachmentsViewOnly: boolean = false;
  @Input() entityNameId: EntityNamesEnum;
  @Input() hiddenRowActions?: (params, rowIndex) => boolean;
  @Input() hiddenAttachmentRowActions?: (params, rowIndex) => boolean;
  @Input() hiddenSendMsgRowActions?: (params, rowIndex) => boolean;
  @Input() hiddenViewMsgRowActions?: (params, rowIndex) => boolean;
  @Input() hiddenActivateRowActions?: (params, actionType: ActionTypeEnum) => boolean;
  @Input() hiddenActivateTitleActions?: (params, actionType: ActionTypeEnum) => boolean;
  @Input() activateItems?: (activateVm?: any) => Observable<Result<any>>;
  @Input() checkActionPermission?: (actionType: ActionTypeEnum | ActionIcon) => boolean;
  @Input() sortOrderSendMsgRowActions?: (params) => number;
  @Input() sortOrderViewMsgRowActions?: (params) => number;
  @Input() sortOrderAttachmentsRowActions?: (params) => number;
  @Input() cardSubHeader: string = '';
  @Input() cardSubHeaderKey: string = '';
  @Input() hasAdvancedSearch?: boolean = false;
  @Input() hideTotalRecords?: boolean = false;
  @Input() colCurrency?: string = 'helpers.labels.sar';
  @Input() showColCurrency?: boolean = true;
  @Input() scrollHeight?: string = '';
  @Input() exportFile: ExportFile = {
    pdf: false,
    excel: true,
    word: false
  };
  @Input('advancedSearchConfig') advancedSearchConfig: AdvancedSearchConfig;
  @Input() tableActions: TableAction[];

  @ContentChild("isActiveTemplate") isActiveTemplate: any = '';
  @ContentChild("cellTemplate") cellTemplate: any = '';
  @ContentChild('headerTemplate') headerTemplate: TemplateRef<any> | any;
  @ContentChild('cardTemplate') cardTemplate: TemplateRef<any> | any;

  @ViewChild(AdvancedSearchComponent, { static: false })
  advancedSearchComponent: AdvancedSearchComponent;

  @ViewChild('componentBody', { static: true }) componentBody: ElementRef;

  @ViewChild(SpinnerDirective, { static: false }) spinnerDirective?: SpinnerDirective;
  @ViewChild('uploader', { static: false }) uploader: UploaderComponent;
  colfilters: any;
  showExportModal: boolean;
  showAttachmentModal: boolean;
  LangSubscription: Subscription;
  count: number;

  @Input('tabs') set tabs(value: StaticTab[]) {
    this._tabs = value;
    if (value && value.length > 0) {
      this.tabSearchField = {
        fieldName: '',
        value: null,
        operator: Operators.equal.code,
      };
      if (this._selectedTab) {
        this.activeTabIndex = this.tabs.indexOf(this._selectedTab)
        this.selectedTab = this._selectedTab
      } else {
        let selected = this.tabs.find(t => t.isSelected === true);
        this.activeTabIndex = selected ? this.tabs.indexOf(selected) : 0;

        this.selectedTab = selected || value[0];
      }

    } else {
      this.tabSearchField = { fieldName: '', value: null };
    }
  }
  @Input('stages') set stages(value: WorkflowProcessStage[]) {
    this._stages = value;
    if (value && value.length > 0) {
      // this.selectedStage = this.selectedStage || value[0];
    }
  }
  @Input('constFilters') set constFilters(value: SearchFieldVm[]) {
    if (value && value.length > 0) {
      for (let index = 0; index < value.length; index++) {
        value[index].operator = value[index].operator || Operators.equal.code;
      }
      this._constFilters = value;
    } else {
      this._constFilters = [];
    }
  }
  /* #endregion */

  /* #region  Output Parametters*/
  @Output('onTabChanged') onTabChanged = new EventEmitter<StaticTab>();
  @Output('onAttachementsDialogOpened') onAttachementsDialogOpened = new EventEmitter<any>();
  @Output('onAttachementsDialogClosed') onAttachementsDialogClosed = new EventEmitter<any>();
  @Output() onPrintSetupClick = new EventEmitter();
  @Output() onCloneClick = new EventEmitter<ActionData>();
  @Output() onUpdateClick = new EventEmitter<ActionData>();
  @Output() onDeleteClick = new EventEmitter<ActionData>();
  @Output() onDetailsClick = new EventEmitter<ActionData>();
  @Output() onSearch = new EventEmitter<any>();
  @Output() onCreateClick = new EventEmitter<ActionData>();
  /* #endregion */

  /* #region  Constructor */
  constructor(
    private translate: TranslateService,
    private _language: LanguageService,
    private fb: FormBuilder,
    private alertsService: AlertsService,
    private fileService: ExportFileService,
    private translatePipe: TranslatePipe,
    private datePipe: DatePipe,
    private breakpointObserver: BreakpointObserver,
    private _authService: AuthService
  ) {
    this.searchForm = this.fb.group({
      searchFields: this.fb.array([]),

      orderBy: [this.defSortBy],
      sortOrder: [this.defSortOrder || SortOrderEnum.Desc],
      pageNumber: [1],
      pageSize: [DefaultGridSettings.PageSize],
    });
  }
  /* #endregion */

  /* #region  Events */
  ngOnDestroy(): void {
    if (this.LangSubscription) {
      this.LangSubscription.unsubscribe();
    }
  }
  ngOnInit() {

    this.breakpointObserver
      .observe(['(max-width: 575.98px)'])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          //console.log('Viewport width is less than or equal 575!');
          this.setView(ViewTypes.Cards);
        } else {
          this.setView(ViewTypes.Grid);
          //console.log('Viewport width is greater than 575px!');
        }
      });
    this.setDefaultes();
    this.handleRowActions();
    this.handleTitleActions();
    this.initExportFileForm();
    this.handleQuickFilters();
    this.LangSubscription = this._language.LangChanged.subscribe(value => {
      this.translate.use(value);
      // this.loadData();
      if (this.currentLang !== value) {
        // this.getStagesList();
        if (!this.displayLoading) {
          this.loadData();
        }
      }
      this.currentLang = value;
    });
    if (this._authService.currentUser.usertype === UserTypeEnum.Dentist.toString()) {
      this.currentUserType = UserTypeEnum.Dentist;
    } else if (this._authService.currentUser.usertype === UserTypeEnum.Lab.toString()) {
      this.currentUserType = UserTypeEnum.Lab;
    }
  }

  addAttachementAction() {
    this.rowActions.moreActions.push({
      type: ActionTypeEnum.create,
      options: ActionOption.all,
      title: 'helpers.buttons.attachmentButton',
      permissions: PagePermissions.Create,
      sortOrder: (params) => {
        if (this.sortOrderAttachmentsRowActions) {
          return this.sortOrderAttachmentsRowActions(params)
        } else {
          return null;
        }
      },
      hidden: (params, rowIndex) => {
        if (this.hasAttachments) {
          if (this.hiddenAttachmentRowActions) {
            return this.hiddenAttachmentRowActions(params, rowIndex);
          }
          return false;
        } else {
          return true;
        }
      },
      onClick: (data: ActionData) => {
        this.entityId = data.params[this.dataKey];
        this.entityCode = data.params[this.codeKey];
        this.sentToUserId = this.currentUserType == UserTypeEnum.Lab ? data.params.dentistUserId : data.params.labUserId;
        this.openAttachementsDialog(data.params);
      },
    });
  }
  addSendMessageAction() {
    this.rowActions.moreActions.push({
      type: ActionTypeEnum.create,
      options: ActionOption.all,
      title: 'helpers.buttons.sendMessageButton',
      permissions: PagePermissions.Create,
      sortOrder: (params) => {
        if (this.sortOrderSendMsgRowActions) {
          return this.sortOrderSendMsgRowActions(params)
        } else {
          return null;
        }
      },
      hidden: (params, rowIndex) => {
        if (this.hasSendMessageAction) {
          if (this.hiddenSendMsgRowActions) {
            return this.hiddenSendMsgRowActions(params, rowIndex);
          }
          return false;
        } else {
          return true;
        }
      },
      onClick: (data: ActionData) => {
        this.entityId = data.params[this.dataKey];
        this.entityCode = data.params[this.codeKey];
        this.sentToUserId = this.currentUserType === UserTypeEnum.Lab ? data.params.dentistUserId : data.params.labUserId;
        this.openSendMsgDialog();
      },
    });
  }
  addViewMessageAction() {
    this.rowActions.moreActions.push({
      type: ActionTypeEnum.details,
      options: ActionOption.all,
      title: 'helpers.buttons.viewMessageButton',
      permissions: PagePermissions.Details,
      sortOrder: (params) => {
        if (this.sortOrderViewMsgRowActions) {
          return this.sortOrderViewMsgRowActions(params)
        } else {
          return null;
        }
      },
      hidden: (params, rowIndex) => {
        if (this.hasViewMessageAction) {
          if (this.hiddenViewMsgRowActions) {
            return this.hiddenViewMsgRowActions(params, rowIndex);
          }
          return false;
        } else {
          return true;
        }
      },
      onClick: (data: ActionData) => {
        this.entityId = data.params[this.dataKey];
        this.entityCode = data.params[this.codeKey];
        this.sentToUserId = this.currentUserType === UserTypeEnum.Lab ? data.params.dentistUserId : data.params.labUserId;
        this.openViewMsgDialog();
      },
    });
  }
  openAttachementsDialog(rowData: any) {
    this.showAttachements = true;
    if (this.onAttachementsDialogOpened) {
      this.onAttachementsDialogOpened.emit(rowData);
    }


  }
  openSendMsgDialog() {
    this.showSendMsg = true;
  }
  openViewMsgDialog() {
    this.showViewMsg = true;
  }

  closeSendMessageDialog() {
    this.showSendMsg = false;
  }
  closeViewMessageDialog() {
    this.showViewMsg = false;
  }
  onCancelAttachementDialoge() {
    this.showAttachements = false;
    // this.uploader.clear();
  }
  onAttachmentsDialogHide() {
    this.entityId = null;
    this.entityCode = null;
    // this.uploader.clear();

    if (this.onAttachementsDialogClosed) {
      this.onAttachementsDialogClosed.emit();
    }
  }
  onSendMsgDialogHide() {
    this.entityId = null;
    this.entityCode = null;
  }
  onViewMsgDialogHide() {
    this.entityId = null;
    this.entityCode = null;
  }
  handleQuickFilters() {
    this.initQuickFilters();
    this.getQuickfiltersList();
  }
  getQuickfiltersList() {
    if (this.config.quickFilters && this.config.hasQuickFilters === true) {
      for (let index = 0; index < this.config.quickFilters.length; index++) {
        const filter = this.config.quickFilters[index];
        if (
          !filter.selectFieldProps.selectList &&
          filter.selectFieldProps.getSelectList
        ) {
          filter.selectFieldProps.getSelectList().subscribe((result) => {
            filter.selectFieldProps.selectList = result.entities || [];
          });
        }
      }
    }
  }
  initQuickFilters() {
    if (this.config.quickFilters && this.config.hasQuickFilters === true) {
      this.quickFiltersFormGroup = this.fb.group({
        filters: this.fb.array([]),
      });
      for (let index = 0; index < this.config.quickFilters.length; index++) {
        const filter = this.config.quickFilters[index];
        const filterGroup = this.fb.group({
          fieldName: [filter.key],
          value: [''],
          isLocalized: [false],
          operator: [Operators.equal.code],
        });
        this.quickFiltersFormArray.push(filterGroup);
      }
    }
  }
  initExportFileForm() {
    let fileName = this.exportTitle || this.title || this.cardTitle || '';
    this.exportFileForm = this.fb.group({
      fileName: [fileName ? this.translate.instant(fileName) : '',
      Validators.required
      ],
      exportType: [ExportTypes.excel],
      exportSelection: [this.config.getItemsList ? ExportFileSelection.AllPages : ExportFileSelection.CurrentPage],
    });
  }
  setDefaultes() {
    this.searchModel = new SearchModel(
      this.defSortBy,
      this.defSortOrder
    );
    this.searchModel.searchFields = this.constFilters;
    if (this.tabs && this.tabs.length > 0) {
      let selected = this.tabs.find(t => t.isSelected === true);
      this.activeTabIndex = selected ? this.tabs.indexOf(selected) : 0;
      this.selectedTab = selected || this.tabs[0]
    }
    this.columns.forEach(element => {
      if (!element.sortable) {
        element.sortable = false;
      }
      // searchable 'Off'
      element.searchable = false;
    });
    if (
      this.config.expansionMode == null ||
      this.config.expansionMode === undefined
    ) {
      this.config.expansionMode = RowExpansionMode.single;
    }
  }
  /* #endregion */

  /* #region  Getters */
  get ColumnWidth() {
    return ColumnWidth;
  }
  get quickFiltersFormArray() {
    return this.quickFiltersFormGroup.get('filters') as FormArray;
  }
  get ColumnFilterTypes() {
    return ColumnFilterTypes;
  }
  get Operators() {

    return Operators;
  }
  get searchFieldTypes() {
    return SearchFieldTypes;
  }
  get searchFieldTypesEnum() {
    return SearchFieldTypesEnum;
  }
  // get searchFields() {
  //   return this.searchForm.get('searchFields') as FormArray;
  // }
  get notEmptySearchFields() {
    let searchfields: SearchFieldVm[] = [];
    if (this.colfilters) {
      for (const key in this.colfilters) {
        if (this.colfilters.hasOwnProperty(key)) {
          const values = this.colfilters[key];
          const column = this.columns.find(c => c.searchable === true && c.searchField && (c.searchField.field === key || c.field === key));
          if (values && values.length > 0) {
            for (let index = 0; index < values.length; index++) {
              const field = values[index];
              field.value = field.value && field.value.trim ? field.value.trim() : field.value;
              if (field.value !== null && field.value !== undefined && field.value !== '') {
                let operator = field.matchMode
                let value = field.value.toString() || '';
                if (column.searchField.type === ColumnFilterTypes.Boolean) {

                  if (!SearchFieldTypes.boolean.operators.find(o => o.code.toLowerCase() == field.matchMode.toLowerCase())) {
                    operator = SearchFieldTypes.boolean.operators[0].code;
                  }
                } else if (column.searchField.type === ColumnFilterTypes.Number) {
                  if (!SearchFieldTypes.numeric.operators.find(o => o.code.toLowerCase() == field.matchMode.toLowerCase())) {
                    operator = SearchFieldTypes.numeric.operators[0].code;
                  }
                } else if (column.searchField.type === ColumnFilterTypes.Date) {
                  if (!SearchFieldTypes.date.operators.find(o => o.code.toLowerCase() == field.matchMode.toLowerCase())) {
                    operator = SearchFieldTypes.date.operators[0].code;
                  }
                  value = value ? this.datePipe.transform(value, 'MMMM d, y') : '';
                } else if (column.searchField.type === ColumnFilterTypes.AutoComplete) {
                  if (typeof field.value === 'string') {
                    if (column.searchField.secondKey) {
                      field.fieldName = column.searchField.secondKey;
                      field.isLocalized =
                        column.searchField.secondKeyIsLocalized === false ||
                          column.searchField.secondKeyIsLocalized === true
                          ? column.searchField.secondKeyIsLocalized
                          : true;
                    } else {
                      field.fieldName = column.searchField.field;
                      field.isLocalized = field.isLocalized || false;
                    }
                  } else {

                    field.value =
                      (field.value != null && field.value != undefined
                        ? field.value[column.searchField.selectFieldProps.key]
                        : '') || '';
                  }
                }
                searchfields.push({
                  fieldName: key,
                  value: value,
                  operator: operator
                });
              }
            }
          }
        }

      }
    }
    return searchfields;


    // const searchFields = this.searchFields.getRawValue() as SearchFieldVm[];
    // for (let index = 0; index < searchFields.length; index++) {
    //   const field = searchFields[index];
    //   field.value = field.value && field.value.trim ? field.value.trim() : field.value;
    //   const column = this.allColumns[(field as any).colIndex];
    //   if (column && column.searchable === true && column.searchField) {
    //     if (column.searchField.type === this.searchFieldTypesEnum.AutoComplete) {
    //       if (typeof field.value === 'string') {
    //         if (column.searchField.secondKey) {
    //           field.fieldName = column.searchField.secondKey;
    //           field.isLocalized =
    //             column.searchField.secondKeyIsLocalized === false ||
    //               column.searchField.secondKeyIsLocalized === true
    //               ? column.searchField.secondKeyIsLocalized
    //               : true;
    //         } else {
    //           field.fieldName = column.searchField.field;
    //           field.isLocalized = field.isLocalized || false;
    //         }
    //       } else {
    //         field.value =
    //           (field.value
    //             ? field.value[column.searchField.selectFieldProps.key]
    //             : '') || '';
    //       }
    //     } else if (column.searchField.type === this.searchFieldTypesEnum.Date) {
    //       field.value = field.value
    //         ? this.datePipe.transform(field.value, 'MMMM d, y')
    //         : '';
    //     }
    //   }
    //   delete (field as any).colIndex;
    // }

    // if (searchFields && searchFields.length > 0) {
    //   return searchFields.filter(item => item.value) || [];
    // } else {
    //   return [];
    // }
  }

  get baseSearchFields() {
    return {
      pageNumber: this.pageNumber.value as number,
      pageSize: this.pageSize.value as number,
      orderBy: this.orderBy.value as string,
      sortOrder: this.sortOrder.value as string
    };
  }
  get SortOrderEnum() {
    return SortOrderEnum;
  }
  get ActionTypeEnum() {
    return ActionTypeEnum;
  }
  get stages() {
    return this._stages;
  }
  get TabsTypes() {
    return TabsTypes;
  }
  get tabs() {
    return this._tabs;
  }
  get ViewTypes() {
    return ViewTypes;
  }
  get defaultGridSettings() {
    return DefaultGridSettings;
  }
  get pageNumber() {
    return this.searchForm.get('pageNumber') as FormControl;
  }
  get pageSize() {
    return this.searchForm.get('pageSize') as FormControl;
  }
  get orderBy() {
    return this.searchForm.get('orderBy') as FormControl;
  }
  get sortOrder() {
    return this.searchForm.get('sortOrder') as FormControl;
  }
  get Pipes() {
    return Pipes;
  }
  get CellTemplateTypes() {
    return CellTemplateTypes;
  }
  expandedRowKeys: any = {};
  get ExportFileSelection() {
    return ExportFileSelection;
  }
  get selectedTab() {
    return this._selectedTab;
  }
  protected get selectedStage() {
    return this._selectedStage;
  }
  get ExportTypes() {
    return ExportTypes;
  }
  get sortableCols() {
    if (this.columns && this.columns.length > 0) {

      return this.columns.filter(c => c.sortable === true && this.isColHidden(c) !== true && c.field !== 'actions') || [];
    }
    return [];
  }
  get constFilters() {
    return this._constFilters || [];
  }

  /* #endregion */

  isEmpty(value: any) {
    return (value === null || value === undefined || value === '');
  }
  getFieldValue(value: any) {
    if (value === null || value === undefined) {
      // return '---';
      return '';
    } else {
      return value;
    }
  }
  // badgeTitle(entity: any) {
  //   if (this.getBadgeConfig) {
  //     return this.getBadgeConfig(entity);
  //   } else {
  //     return '';
  //   }
  // }
  badgeTitle(entity: any) {
    if (this.getBadgeConfig && this.getBadgeConfig(entity).title) {
      return this.getBadgeConfig(entity).title;
    } else {
      return null;
    }
  }
  badgeCardClass(entity: any) {
    if (this.getBadgeConfig && this.getBadgeConfig(entity).viewCardClass) {
      return this.getBadgeConfig(entity).viewCardClass;
    } else {
      return 'active-tile';
    }
  }
  badgeBtnClass(entity: any) {
    if (this.getBadgeConfig && this.getBadgeConfig(entity).viewBtnClass) {
      return this.getBadgeConfig(entity).viewBtnClass;
    } else {
      return 'success-text';
    }
  }
  changeSort(col: Column) {
    if (col && this.searchModel) {
      let sortOrder = SortOrderEnum.Desc;
      if (col.field === this.searchModel.orderBy) {
        sortOrder = this.searchModel.sortOrder === SortOrderEnum.Desc ? SortOrderEnum.Asc : SortOrderEnum.Desc;
      }

      this.orderBy.setValue(col.field || this.defSortBy || 'id');
      this.sortOrder.setValue(sortOrder);
      this.searchModel.orderBy = col.field || this.defSortBy || 'id';
      this.searchModel.sortOrder = sortOrder;
      this.loadData();
    }
  }
  changeOrderBy(orderBy: string, sortOrder: SortOrderEnum) {
    if (this.searchModel) {
      sortOrder = sortOrder || SortOrderEnum.Desc;
      this.orderBy.setValue(orderBy || this.defSortBy || 'id');
      this.sortOrder.setValue(sortOrder);
      this.searchModel.orderBy = orderBy || this.defSortBy || 'id';
      this.searchModel.sortOrder = sortOrder;
    }
  }
  onLazyLoad(event: any) {
    if (event) {
      if (event.value) {
        if (
          !isNaN(event.value) &&
          Number(event.value) <= this.pageMetadata.pageCount
        ) {
          this.pageNumber.setValue(event.value || 1);
        } else {
          this.pageNumber.setValue(this.pageMetadata.pageNumber);
        }
        this.pageSize.setValue(
          this.pageMetadata.pageSize || DefaultGridSettings.PageSize
        );
      } else {
        this.pageNumber.setValue(
          Math.floor(event.first / event.rows + 1 || 1) || 1
        );
        this.pageSize.setValue(event.rows || DefaultGridSettings.PageSize);
      }
      this.orderBy.setValue(event.sortField || this.defSortBy || 'id');
      this.sortOrder.setValue(
        event.sortOrder === 1 ? SortOrderEnum.Asc : SortOrderEnum.Desc
      );
      if (event.filters && Object.keys(event.filters).length > 0) {
        this.onSearchSubmit(event.filters || {});
      }
    }
    this.searchModel.orderBy = event.sortField ? event.sortField : this.orderBy.value;
    this.searchModel.sortOrder = event.sortOrder === 1 ? SortOrderEnum.Asc :
      event.sortOrder === -1 ? SortOrderEnum.Desc : this.sortOrder.value;
    this.searchModel.pageNumber = this.pageNumber.value;
    this.searchModel.pageSize = this.pageSize.value;
    this.loadData();
  }

  changeView() {
    this.viewType = this.viewType === ViewTypes.Cards ? ViewTypes.Grid : ViewTypes.Cards;
    // this.view.cardView = !this.view.cardView;
  }
  setView(type: ViewTypes) {
    this.viewType = type || this.viewType;
  }

  exportPopUp() {
    this.initExportFileForm();
    this.showExportModal = true;
  }
  onDetailsBtnClick(event: any) {
    if (this.onDetailsClick) {
      this.onDetailsClick.emit(event);
    }
  }


  changeTab(event: any, tab: StaticTab, index: number) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectedTab = tab;
    this.activeTabIndex = index;
    this.searchModel.pageNumber = 1;
    if (this.onTabChanged) {
      this.onTabChanged.emit(tab);
    }
    setTimeout(() => {
      this.clearSelection(true);
      if (!this.displayLoading) {
        this.onAdvancedSearch(this.advancedSearchComponent.notEmptySearchFields);
        //this.loadData();
      }
    }, 0);

  }
  protected set selectedTab(tab: StaticTab) {
    const searchFieldIndex = this.searchModel.searchFields.indexOf(
      this.tabSearchField
    );
    if (searchFieldIndex >= 0) {
      this.searchModel.searchFields.splice(searchFieldIndex, 1);
    }

    if (tab.searchKey && tab.searchKey.trim()) {
      this.tabSearchField.value = tab.value;
      this.tabSearchField.fieldName = tab.searchKey;
      this.searchModel.searchFields.push(this.tabSearchField);
      //this.searchModel[tab.searchKey] = tab.value;
    }

    this._selectedTab = tab;
  }
  onToggleCol(event: { col: Column; columns: Column[]; }) {
    const index = event.columns.findIndex(col => col.field === event.col.field);
    event.columns[index].hidden = event.columns[index].hidden;
    event.columns[index].isHidden = event.columns[index].isHidden;
    this.columns = [...event.columns];
  }

  onShowAllColumns(cols: Column[]) {
    this.columns = [...cols];
  }
  changeSorting() {
    this.searchModel.sortOrder = this.searchModel.sortOrder === SortOrderEnum.Desc ? SortOrderEnum.Asc : SortOrderEnum.Desc;
    this.loadData();
  }
  loadData() {
    if (this.getItemsList) {
      setTimeout(() => this.spinnerDirective?.showSpinner(), 0);
      if (this.selectedStage) {
        this.searchModel.stage = this.selectedStage.id;
      } else {
        this.searchModel.stage = this.defaultSelectedStage;
        // this.searchModel.stage =
        //   (this.stages && this.stages.length > 0
        //     ? this.stages[0].id || null
        //     : null) || null;
      }
      this.searchModel.sortOrder = this.searchModel.sortOrder ? this.searchModel.sortOrder : this.defSortOrder || SortOrderEnum.Desc;
      this.searchModel.orderBy = this.searchModel.orderBy ? this.searchModel.orderBy : this.defSortBy || 'id';
      this.searchModel.pageSize = this.pageSize.value;
      if (this.selectedTab
        && this.selectedTab.value
        && this.tabSearchField
        && this.tabSearchField.fieldName
        && this.tabSearchField.value) {
        if (this.searchModel.searchFields.length > 0
          && this.searchModel.searchFields.find(f => f.fieldName === this.tabSearchField.fieldName)) {
          let found = this.searchModel.searchFields.find(f => f.fieldName === this.tabSearchField.fieldName);
          this.searchModel.searchFields.splice(this.searchModel.searchFields.indexOf(found), 1);
        }
        this.searchModel.searchFields.push(this.tabSearchField);
      }
      const observable = this.getItemsList(Reflection.copy(this.searchModel));
      if (observable) {
        this.displayLoading = true;
        observable.subscribe({
          next: (response) => {
            this.displayLoading = false;
            if (!this.displayLoadingStages) {
              setTimeout(() => this.spinnerDirective?.hideSpinner(), 0);
            }
            if (response && response.success) {
              //  this.clearSelection();
              this.itemsList = response.entities;
              this.pageMetadata = response.metadata;
              // entityData to Activity-Entry component
              this.entityInfo = response.entityInfo;
              this.count = response.addtionalData ? response.addtionalData.count : null;
              // if (!this.config.selectionMode && this.itemsList && this.itemsList.length > 0) {
              //   this.config.selectionMode = SelectionModeEnum.Multiple;
              // }
              //  this.handleActivitiesAction();
              this.handleAttachmentsAction();
            } else {
              this.onError(response.message);
            }
          },
          error: (response) => {
            if (!this.displayLoadingStages) {
              this.displayLoading = false;
            }
            setTimeout(() => this.spinnerDirective?.hideSpinner(), 0);
            this.onError(response);
          }
        }
        );
      } else {
        setTimeout(() => {
          if (!this.displayLoadingStages) {
            this.displayLoading = false;
          }
          setTimeout(() => this.spinnerDirective?.hideSpinner(), 0);
          // this.selectedItems = [];
          this.itemsList = [];
          this.pageMetadata = {};
          this.entityInfo = {};
        }, 0);
      }
    }
  }
  onError(error: any) {
    this.alertsService.errorMessage(error);
  }
  clearSelection(forceClear: Boolean = false) {
    if (!this.keepSelectionOnLazyLoading || forceClear) {
      this.selectedItems = [];
    }
  }

  onExpandRow(dataListItem, pTableRef) {
    if (this.config.hasRowExpansion) {
      if (
        this.config.expansionMode === RowExpansionMode.single &&
        Object.keys(this.expandedRowKeys).length !== 0 &&
        this.expandedRowKeys.hasOwnProperty(dataListItem[this.dataKey]) ===
        false
      ) {
        this.expandedRowKeys = {};
      }
      if (!this.expandedRowKeys[dataListItem[this.dataKey]]) {
        this.expandedRowKeys[dataListItem[this.dataKey]] = true;
      } else {
        delete this.expandedRowKeys[dataListItem[this.dataKey]];
      }
      pTableRef.expandedRowKeys = { ...this.expandedRowKeys };
    }
  }

  isFrozen(rowExpandTr) {
    if (this.config.hasRowExpansion) {
      const nativeEl = $(this.componentBody.nativeElement);
      const frozenBody = nativeEl.find(
        // '.ui-table-scrollable-view.ui-table-frozen-view:first'
        '.p-datatable-scrollable-view.p-datatable-frozen-view:first'
      );
      const unfrozenBody = nativeEl.find(
        '.p-datatable-scrollable-view.p-datatable-unfrozen-view:first'
      );
      if (frozenBody && frozenBody.find($(rowExpandTr)).length > 0) {
        return true;
      } else {
        frozenBody
          .find('tr.row-expansion-tr')
          .css(
            'height',
            unfrozenBody.find('tr.row-expansion-tr').css('height')
          );
        return false;
      }
    }
    return false;
  }

  exportFiles(event: Event) {
    this.exportFormSubmitted = true;
    if (this.exportFileForm.valid) {
      this.alertsService.showLoader();
      const exportFileSearchModel = { ...this.searchModel };
      const exportSelection: ExportFileSelection = this.exportFileForm.get(
        'exportSelection'
      )?.value;
      const exportType: ExportTypes = this.exportFileForm.get('exportType')?.value;
      const fileName: string = this.exportFileForm.get('fileName')?.value;

      if (exportSelection === ExportFileSelection.SelectedRows) {
        this.saveExportFile(exportType, fileName, this.selectedItems);
        this.alertsService.hideLoader();
        this.closeExportModal();
        return;
      }

      if (exportSelection === ExportFileSelection.CurrentPage) {
        this.saveExportFile(exportType, fileName, this.itemsList);
        this.alertsService.hideLoader();
        this.closeExportModal();
        return;
      }

      if (exportSelection === ExportFileSelection.AllPages) {
        exportFileSearchModel.pageSize = this.pageMetadata.totalItemCount;
        exportFileSearchModel.pageNumber = 1;
      }

      // get data from backend
      if (this.getItemsList) {
        this.getItemsList(exportFileSearchModel).subscribe((res) => {
          this.exportFormSubmitted = false;
          if (res.success) {
            this.saveExportFile(exportType, fileName, res.entities);
            this.alertsService.hideLoader();
            this.closeExportModal();
          }
        });
      }

    }
  }
  saveExportFile(exportType: ExportTypes, fileName: string, entities: any[]) {
    if (exportType === ExportTypes.pdf) {
      this.fileService.exportAsPdfFile(fileName, () =>
        this.fileService.getExportFileHtmlTable(
          entities,
          [...this.getColTranslated()],
          fileName,
          exportType
        )
      );
    } else if (exportType === ExportTypes.word) {
      this.fileService.exportAsWordFile(fileName, () =>
        this.fileService.getExportFileHtmlTable(
          entities,
          [...this.getColTranslated()],
          fileName,
          exportType
        )
      );
    } else if (exportType === ExportTypes.excel) {
      this.fileService.exportAsExcelFile(
        entities,
        [...this.getColTranslated()],
        fileName
      );
    }
  }
  getColTranslated(): Column[] {
    return this.columns.map((col) => {
      col.title = this.translatePipe.transform(col.title);
      return col;
    });
  }
  closeExportModal() {
    this.exportFormSubmitted = false;
    this.exportFileForm.reset();
    this.showExportModal = false;
  }
  isExpandedChild() {
    const paretExpansionTr = $(this.componentBody.nativeElement).closest(
      'tr.row-expansion-tr'
    );
    if (paretExpansionTr && paretExpansionTr.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  onPrintSetupBtnClick() {
    if (this.onPrintSetupClick) {
      this.onPrintSetupClick.emit();
    }
  }
  handleTitleActions() {
    // handle common actions
    this.titleActions = this.titleActions || {
      type: ActionListType.title,
      transparent: true,
    };
    this.titleActions.moreActions = this.titleActions.moreActions || [];
    this.titleActions.list = this.titleActions.list || [];
    const titleActionsList: ActionIcon[] = [];
    if (this.hasCreateAction) {
      this.titleActions.list.push({
        type: ActionTypeEnum.create,
        options: ActionOption.icon,
        permissions: PagePermissions.Create,
        title: 'helpers.buttons.createNewButton',
        hidden: () => {
          return !this.hasCreateAction;
        },
        onClick: (data: ActionData) => {
          if (this.onCreateClick) {
            this.onCreateClick.emit(data);
          }
        }
      });
    }
    if (this.hasActivateAction) {
      this.titleActions.list.unshift(
        {
          type: ActionTypeEnum.deactivate,
          title: 'helpers.buttons.deactivate',
          permissions: PagePermissions.Delete,
          hidden: (data: any) => {
            if (
              this.hasActivateAction &&
              this.selectedItems &&
              this.selectedItems.length >= 1 &&
              this.selectedItems.find((a) => a.isActive === true)
              && (!this.hiddenActivateTitleActions || !this.hiddenActivateTitleActions(this.selectedItems, ActionTypeEnum.activate))) {

              return false;
            } else {
              return true;
            }
          },
          onClick: (data: ActionData) => {
            if (data && data.params && (data.params as any[]).length > 0) {
              this.activate(
                (data.params as any[]).filter((a) => a.isActive === true).map((item) => item.id),
                false
              );
            }
          },
        },
        {
          type: ActionTypeEnum.activate,
          title: 'helpers.buttons.activate',
          options: ActionOption.icon,
          permissions: PagePermissions.Delete,
          hidden: () => {
            if (
              this.hasActivateAction &&
              this.selectedItems &&
              this.selectedItems.length >= 1 &&
              this.selectedItems.find((a) => a.isActive === false)
              && (!this.hiddenActivateTitleActions || !this.hiddenActivateTitleActions(this.selectedItems, ActionTypeEnum.activate))) {
              return false;
            } else {
              return true;
            }
          },
          onClick: (data: ActionData) => {
            if (data && data.params && (data.params as any[]).length > 0) {
              this.activate(
                (data.params as any[]).filter((a) => a.isActive === false).map((item) => item.id),
                true
              );
            }
          },
        }
      );
    }

    if (this.hasUpdateAction) {
      titleActionsList.unshift({
        type: ActionTypeEnum.edit,
        title: 'helpers.buttons.editButton',
        permissions: PagePermissions.Update,
        hidden: () => {
          if (
            (!this.hasUpdateAction ||
              (this.selectedItems && this.selectedItems.length === 1))
          ) {
            return false;
          } else {
            return true;
          }
        },
        onClick: (data: ActionData) => {
          if (this.onUpdateClick) {
            if (this.selectedItems && this.selectedItems.length === 1) {
              data.params = this.selectedItems[0];
              this.onUpdateClick.emit(data);
            } else {
              console.log('you must select on item only.');
            }
          }
        },
      });
    }
    if (
      this.hasFullScreenAction
    ) {
      titleActionsList.push({
        type: ActionTypeEnum.fullscreen,
        title: this.isFullScreen ? 'helpers.common.originalScreen' : 'helpers.common.fullScreen',
        getTitle: () => {
          return this.isFullScreen ? 'helpers.common.originalScreen' : 'helpers.common.fullScreen';
        },
        hidden: () => {
          return !this.hasFullScreenAction;
        },
        onClick: (data: ActionData) => {
          //p-dialog
          let parentDialog = $(data.event.srcElement).closest('.p-dialog');
          if (parentDialog && parentDialog.length > 0) {
            parentDialog.toggleClass('full-screen mt-0 bg-white');
            this.isFullScreen = parentDialog.hasClass('full-screen');
          } else {
            let parentList = $(data.event.srcElement).closest('.list-card');
            parentList.closest('.list-card')
              .toggleClass('full-screen mt-0 bg-white');
            this.isFullScreen = parentList.hasClass('full-screen');
            if (this.viewType === ViewTypes.Cards) {
              parentList.toggleClass('transparent-bg');
            }
          }
        },
      });
    }
    if (
      this.hasRefreshAction
    ) {
      titleActionsList.push({
        type: ActionTypeEnum.refresh,
        title: 'helpers.buttons.refreshButton',
        hidden: () => {
          return !this.hasRefreshAction;
        },
        onClick: () => {
          this.reloadData();
        }
      });
    }
    if (this.hasChangeViewAction) {
      titleActionsList.push({
        type: ActionTypeEnum.gridView,
        title: 'helpers.buttons.gridView',
        hidden: () =>
          !this.hasChangeViewAction ||
          this.viewType === ViewTypes.Grid,
        onClick: () => {
          this.viewType = ViewTypes.Grid;
        },
      });
      titleActionsList.push({
        type: ActionTypeEnum.tileView,
        title: 'helpers.buttons.tileView',
        hidden: () =>
          !this.hasChangeViewAction ||
          this.viewType === ViewTypes.Cards,
        onClick: () => (this.viewType = ViewTypes.Cards),
      });
    }
    if (this.hasAdvancedSearch === true) {
      titleActionsList.push({
        type: ActionTypeEnum.search,
        title: 'helpers.buttons.searchButton',
        hidden: () => this.hasAdvancedSearch === false,
        onClick: () => {
          if (this.advancedSearchComponent) {
            this.advancedSearchComponent.showModal();
          }
        },
      });
    }
    if (titleActionsList && titleActionsList.length > 0) {
      this.titleActions.list.unshift(...titleActionsList);
    }

    if (this.columns && this.hasToggleColumsAction) {
      this.titleActions.toggleCols = [...this.columns];
    }
  }

  reloadData() {
    //this.getStagesList();
    this.clearSelection(true);
    this.loadData();
  }
  handleRowActions() {
    this.rowActions = this.rowActions || { type: ActionListType.onGrid };
    this.rowActions.moreActions = this.rowActions.moreActions || [];
    this.rowActions.list = this.rowActions.list || [];
    if (this.hasDetailsAction) {
      this.rowActions.moreActions.unshift({
        type: ActionTypeEnum.details,
        options: ActionOption.all,
        title: 'helpers.buttons.detailButton',
        permissions: PagePermissions.Details,
        hidden: () => {
          if (this.hasDetailsAction) {
            return false;
          } else {
            return true;
          }
        },
        onClick: (data: ActionData) => {
          if (this.onDetailsClick) {
            this.onDetailsClick.emit(data);
          }
        },
      });
    }
    if (this.hasDeleteAction) {
      this.rowActions.moreActions.unshift({
        type: ActionTypeEnum.delete,
        options: ActionOption.all,
        title: 'helpers.buttons.deleteButton',
        permissions: PagePermissions.Delete,
        hidden: () => {
          if (this.hasDeleteAction) {
            return false;
          } else {
            return true;
          }
        },
        onClick: (data: ActionData) => {
          if (this.onDeleteClick) {
            this.onDeleteClick.emit(data);
          }
        },
      });
    }
    if (this.hasActivateAction) {
      this.rowActions.moreActions.unshift(
        {
          type: ActionTypeEnum.deactivate,
          title: 'helpers.buttons.deactivate',
          options: ActionOption.all,
          permissions: PagePermissions.Delete,
          hidden: (data: any) => {
            if (this.hasActivateAction && data.isActive
              && (!this.hiddenActivateRowActions || !this.hiddenActivateRowActions(data, ActionTypeEnum.deactivate))) {
              return false;
            } else {
              return true;
            }
          },
          onClick: (data: ActionData) => {
            if (data && data.params && data.params['id'] > 0) {
              this.activate([data.params['id']], false);
            }
          },
        },
        {
          type: ActionTypeEnum.activate,
          title: 'helpers.buttons.activate',
          options: ActionOption.all,
          permissions: PagePermissions.Delete,
          hidden: (data: any) => {
            if (this.hasActivateAction && !data.isActive
              && (!this.hiddenActivateRowActions || !this.hiddenActivateRowActions(data, ActionTypeEnum.activate))) {
              return false;
            } else {
              return true;
            }
          },
          onClick: (data: ActionData) => {
            if (data && data.params && data.params['id'] > 0) {
              this.activate([data.params['id']], true);
            }
          },
        }
      );
    }
    if (this.hasUpdateAction) {
      this.rowActions.moreActions.unshift({
        type: ActionTypeEnum.edit,
        options: ActionOption.all,
        title: 'helpers.buttons.editButton',
        permissions: PagePermissions.Update,
        hidden: () => {
          if (this.hasUpdateAction) {
            return false;
          } else {
            return true;
          }
        },
        onClick: (data: ActionData) => {
          if (this.onUpdateClick) {
            this.onUpdateClick.emit(data);
          }
        },
      });
    }
    if (this.hasCloneAction) {
      this.rowActions.moreActions.unshift({
        type: ActionTypeEnum.create,
        options: ActionOption.all,
        title: 'helpers.buttons.cloneButton',
        permissions: PagePermissions.Create,
        hidden: () => {
          if (this.hasCloneAction) {
            return false;
          } else {
            return true;
          }
        },
        onClick: (data: ActionData) => {
          if (this.onCloneClick) {
            this.onCloneClick.emit(data);
          }
        },
      });
    }

    this.addSendMessageAction();
    this.addViewMessageAction();
    this.addAttachementAction();
  }
  private activate(idsArr: Number[], isActive: boolean) {
    if (idsArr && idsArr.length > 0) {
      this.alertsService.confirmMessage(
        isActive ? this.translate.instant('helpers.messages.confirmActivate') : this.translate.instant('helpers.messages.confirmDeactivate'),
        () => {
          setTimeout(() => this.spinnerDirective.showSpinner(), 0);
          const activateObj: ActivateVM = {
            ids: idsArr.map((x) => Number(x)),
            activate: isActive,
          };
          const observable = this.activateItems(activateObj);
          if (observable) {
            observable.subscribe(
              {
                next: (response) => {
                  setTimeout(() => this.spinnerDirective.hideSpinner(), 0);
                  if (response && response.success) {
                    this.clearSelection(true);
                    this.loadData();
                  } else {
                    if (!response.hideErrorMsg) {
                      this.onError(response.message);
                    }
                    if (response && response.reloadDataOnFailed === true) {
                      this.loadData();
                    }
                  }
                },
                error: (response) => {
                  setTimeout(() => this.spinnerDirective.hideSpinner(), 0);
                  this.onError(response);
                }
              }
            );
          } else {
            setTimeout(() => this.spinnerDirective.hideSpinner(), 0);
          }
        },
        this.translate.instant('helpers.buttons.ok'),
        this.translate.instant('helpers.buttons.cancel')
      );
    }
  }
  hideAction = (action) => {
    if (this.checkActionPermission && action) {
      return !this.checkActionPermission(action);
    } else {
      return false;
    }
  }
  onAdvancedSearch(searchFields: any[]) {
    if (searchFields) {
      searchFields.forEach(item => {
        item.value = item.value && item.value.trim ? item.value.trim() : item.value;
        if (item.value === '') {
          item.value = null;
          item.fieldName = null;
          item.operator = null;
          item.isLocalized = null;
        }
      });
      this.search(searchFields);
    }
  }
  search(searchFields: SearchFieldVm[]) {
    this.resetForm();
    if (searchFields && searchFields.length > 0) {
      this.searchModel = {
        searchFields: [...searchFields, ...this.constFilters],
        ...this.baseSearchFields,
      };
    } else {
      this.searchModel = {
        searchFields: this.constFilters,
        ...this.baseSearchFields,
      };
    }
    this.loadData();
  }
  resetForm() {
    this.resetSearchFields(this.allColumns);
    this.resetBaseSmFeilds();
    this.searchModel = {
      searchFields: [...this.notEmptySearchFields, ...this.constFilters],
      ...this.baseSearchFields,
    };
  }
  resetSearchFields(columns: Column[]) {
    // if (columns && columns.length > 0) {
    //   for (let index = 0; index < columns.length; index++) {
    //     const column = columns[index];
    //     const field = column.searchField;
    //     if (column.searchable === true && field) {
    //       const group = this.getGroup(field.field);
    //       group.reset();
    //       group.patchValue({
    //         fieldName: field.field,
    //         value: '',
    //         colIndex: index,
    //         isLocalized: field.isLocalized || false,
    //         operator: this.searchFieldTypes[field.type].operators[0].code,
    //       });
    //     }
    //   }
    // }
  }
  resetBaseSmFeilds() {
    this.pageNumber.setValue(1);
    this.pageSize.setValue(DefaultGridSettings.PageSize);
    this.orderBy.setValue(this.config.defSortBy);
    this.sortOrder.setValue(SortOrderEnum.Desc);
  }
  OnReset() {
    this.resetForm();
    this.loadData();
  }
  onSearchSubmit(colfilters) {
    this.colfilters = colfilters;

    if (this.constFilters && this.constFilters.length > 0) {
      this.searchModel = {
        searchFields: [...this.notEmptySearchFields, ...this.constFilters],
        ...this.baseSearchFields
      };
    } else {
      this.searchModel = {
        searchFields: [...this.notEmptySearchFields],
        ...this.baseSearchFields
      };
    }


    //this.loadData();
    if (this.advancedSearchComponent) {
      this.advancedSearchComponent.resetForm();
    }
    if (this.onSearch) {
      this.onSearch.emit();
    }
  }
  isConstFilter(column: Column) {
    if (column && this.constFilters && this.constFilters.length > 0) {
      return Boolean(
        this.constFilters.find(
          (f) =>
            f.fieldName.toLowerCase() === column.field.toLocaleLowerCase() ||
            (column.searchField &&
              column.searchField.field &&
              f.fieldName.toLowerCase() ===
              column.searchField.field.toLocaleLowerCase()) ||
            (column.searchField &&
              column.searchField.secondKey &&
              f.fieldName.toLowerCase() ===
              column.searchField.secondKey.toLocaleLowerCase())
        )
      );
    }
    return false;
  }

  onAdvancedResetSearch() {
    this.advancedSearchComponent.resetForm();
    this.resetForm();
    this.loadData();
  }
  getColOperators(column: Column) {

    if (
      column.searchField.operators &&
      column.searchField.operators.length > 0
    ) {

      return column.searchField.operators.map(op => {
        return {
          label: this.translate.instant(op.title),
          value: op.code
        } as SelectItem;
      });
    } else {
      return this.searchFieldTypes[column.searchField.type].operators.map(op => {
        return {
          label: this.translate.instant(op.title),
          value: op.code
        } as SelectItem;
      });

    }

  }
  getDefColOperator(column: Column) {
    //Operators.equal.code
    if (column && column.searchField && column.searchField.type === ColumnFilterTypes.Boolean) {
      return Operators.equal.code;
    } else {
      return Operators.contain.code;
    }

  }
  completeMethod(event, field: ColSearchField) {
    if (field && field.type === this.ColumnFilterTypes.AutoComplete) {
      if (field.selectFieldProps.apiSingleCalling === true) {
        if (
          !(field.selectFieldProps as any).allDataList ||
          (field.selectFieldProps as any).allDataList.length === 0
        ) {
          field.selectFieldProps
            .getSelectList(null, this.notEmptySearchFields)
            .subscribe((result) => {
              field.selectFieldProps.selectList = result.entities || [];
              (field.selectFieldProps as any).allDataList =
                field.selectFieldProps.selectList;
            });
        } else {
          const query = event.query ? event.query.toLocaleLowerCase() : '';
          const allDataList: any[] = (field.selectFieldProps as any)
            .allDataList;
          field.selectFieldProps.selectList = !query
            ? allDataList
            : allDataList.filter(
              (f) =>
                !query ||
                f[field.selectFieldProps.value].toLowerCase().indexOf(query) >
                -1
            ) || [];
        }
      } else {
        field.selectFieldProps
          .getSelectList(event.query, this.notEmptySearchFields)
          .subscribe((result) => {
            field.selectFieldProps.selectList = result.entities || [];
          });
      }
    }
  }

  getPercent(col: Column) {
    // if (this.columns.length <= 8) {
    if (col.percent && col.percent > 0) {
      //return ((100 / col.percent) + '%');
      return (col.percent + '%');
    } else if (col.width) {
      return col.width;
    } else {
      const visibleCols = this.columns.filter(c => this.isColHidden(c) !== true && (!c.percent || c.percent <= 0) && !c.width).length;

      let percentSum = 0;
      let pixelsSum = 0;
      for (let index = 0; index < this.columns.length; index++) {
        percentSum += (this.columns[index].percent || 0);
        if (this.columns[index].width) {
          pixelsSum += parseInt(this.columns[index].width);
        }
      }

      let perc = `calc((${(100 - percentSum)}% - ${pixelsSum}px) / ${visibleCols})`;
      return perc;
      //return (((100 - percentSum) / visibleCols) + '%');
    }
  }
  handleAttachmentsAction() {
    if (
      this.entityInfo &&
      this.entityInfo.hasAttachments
    ) {
      if (!this.addAttachmentsRowAction) {
        this.rowActions = this.rowActions || {
          type: ActionListType.onGrid,
          transparent: true,
        };
        this.rowActions.moreActions = this.rowActions.moreActions || [];
        this.addAttachmentsRowAction = {
          type: ActionTypeEnum.details,
          hidden: () => {
            return !this.entityInfo.hasAttachments;
          },
          title: 'helpers.common.attachment',
          options: ActionOption.all,
          onClick: (data: ActionData) => {
            this.attachmentFilter = {
              sourceId: data.params.id,
              sourceName: this.entityInfo.entityNameId,
            };
            this.showAttachmentModal = true;
          },
        };
        this.rowActions.moreActions.push(this.addAttachmentsRowAction);
      }
    }
  }
  closeAttachmentModal() {
    this.attachmentFilter = null;
    this.showAttachmentModal = false;
  }
  showSpinner() {
    setTimeout(() => this.spinnerDirective?.showSpinner(), 0);
  }
  hideSpinner() {
    setTimeout(() => this.spinnerDirective?.hideSpinner(), 0);
  }

  isColHidden(col: Column) {
    if (col) {
      if (col.hidden === true) {
        return true;
      } else if (col.isHidden) {
        return col.isHidden();
      }
    }
    return false;
  }
}
