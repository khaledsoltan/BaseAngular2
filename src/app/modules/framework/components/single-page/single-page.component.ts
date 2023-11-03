import { Component, OnInit, ViewChild, Input, TemplateRef, Output, EventEmitter, Inject, ElementRef, Renderer2, RendererStyleFlags2, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { Router } from '@angular/router';
import { isArray } from 'jquery';
import { SpinnerDirective } from '../../directives/spinner/spinner.directive';
import { ActionFieldDataTypesEnum, ActionTypeEnum, AutoCompleteMode, FieldModeEnum } from '../../enums/enums';
import { ActionList, ActionListType, ActionIcon, ActionOption, ActionData } from '../../models/action/actions';
import { WorkflowProcessStage, WorkflowProcessStageAction } from '../../models/data-list/data-list';
import { StageEntryHistory, StageEntryData } from '../../models/generic/StageEntryData';
import { RelatedLinksVM } from '../../models/related-links/related-links';
import { EntityInfo } from '../../models/result/EntityResult';
import { StageTypes } from '../../models/workflows/models/WorkflowItems';
import { AlertsService } from '../../services/alert/alerts.service';
import { Language, LanguageService } from '../../services/language-service/language.service';
import { Reflection } from '../../utilities/reflection';
import { DynamicFormCardType, DynamicFormMode, DynamicFormModel, DynamicFormPageType } from '../../models/dynamic-form/dynamic-form';
import { ParameterConfiguration, FieldTypeEnum } from '../../helpers/parameter-validation-helper';
import { FilterAttachments } from '../../helpers/entity-attachments/file-entity-entry';
import { SinglePageConfig, SinglePageMainCard, SinglePageMode, SinglePageTitleActions, SinglePageType, TabValidationMessages } from '../../models/single-page/single-page';
import { DimensionLineEntitySM, DimensionLineFieldConfigurationVM, EntityDimensionEntry, InLineDimensionCardDetails, RelatedEntityDimension } from '../../models/dimesnion/dimension';
import { SinglePageEvent, SinglePageTab, SinglePageTabType, SinglePageFieldType, SinglePageCardType } from '../../models/single-page/single-page-tab';
import { FieldValidator } from '../../models/details/details';
import { UrlHelper } from '../../helpers/urlLinks';
import { DimensionCardComponent } from '../dimension-card/dimension-card.component';
import { GeneralSearchComponent } from '../general-search/general-search.component';
import { DimensionService } from '../../services/dimension/dimension.service';
import { PageSetupService } from '../../services/field-management/page-setup.service';
import { CommonUrls } from '../../models/common-urls';
import { PagePermissions } from '../../auth/models/page-permissions';
import { MenuRolePermissionEnum } from '../../auth/models/role-permissions';

declare let $: any;

@Component({
  selector: 'app-single-page',
  templateUrl: './single-page.component.html',
  styleUrls: ['./single-page.component.scss'],
})
export class SinglePageComponent implements OnInit, AfterViewInit {
  /* #region  Properties & Fields */
  cardActions: ActionList;
  headActions: ActionList;
  lang: Language;
  form: FormGroup;
  selectedTabKey: string;
  formSubmitted: boolean;
  listCardDynamicFormModel: DynamicFormModel;
  visibleListCardKey: string;
  visibleListTabKey: string;
  selectedIndexUpdate: number;
  entityInfo: EntityInfo;
  parametersConfiguration: ParameterConfiguration[];
  filterAttachment: FilterAttachments;
  relatedLinks: RelatedLinksVM[] = [];
  slickSlideToShowLimit = 6;
  slickConfig: any;
  workflowActions: ActionList;
  workflowActionsFlag: boolean;
  mainActions: ActionList = { type: ActionListType.title, moreActions: [] };
  historyDetails: StageEntryHistory[] = [];
  detailsStages: StageEntryData[];
  stageSequenceList: WorkflowProcessStage[];
  selectedStage: StageEntryData;
  currentActionEntry: {
    title: string;
    actionDetails: WorkflowProcessStageAction;
    entityEntryIds: number[];
  };
  validationMessages: { [tabKey: string]: TabValidationMessages; } = {};
  canEdit = true;
  isActionsInitialized = false;
  dimensionRelatedEntitiesInHeader: RelatedEntityDimension[];
  dimensionLineSM: DimensionLineEntitySM[] = [];
  inLineDimensionCardsInfo: { [cardName: string]: InLineDimensionCardDetails; } = {};
  generalSearchAction: ActionList;
  generalSearchSelectedTabKey: string;
  generalSearchSelectedCardKey: string;
  generalSearchSelectedFieldKey: string;
  private currentStage: WorkflowProcessStage;
  private _pageType: SinglePageType;
  private _formEvent: SinglePageEvent;
  private _tabs: { [tabName: string]: SinglePageTab; };

  get id() {
    return this.config.entityId;
  }

  get entityName() {
    if (this.config) {
      return this.config.entityName;
    } else {
      return '';
    }
  }

  get tabs() {
    return this._tabs;
  }

  get pageType() {
    return this._pageType;
  }

  get mainCardEntity(): { [key: string]: any; } {
    return this.mainCard.dataKey
      ? Reflection.GetValueByProbertyName(
        this.config.entity,
        this.mainCard.dataKey
      )
      : this.config.entity;
  }

  get singlePageMode() {
    return SinglePageMode;
  }

  get singlePageType() {
    return SinglePageType;
  }

  get tabTypes() {
    return SinglePageTabType;
  }

  get dataTypes() {
    return SinglePageFieldType;
  }

  get cardTypes() {
    return SinglePageCardType;
  }

  get pageTypes() {
    return SinglePageType;
  }

  get formValue() {
    return this.getSingleAndListCardValues();
  }

  get formEvent(): SinglePageEvent {
    this._formEvent.component = this;
    this._formEvent.form = this.form;
    this._formEvent.value = this.formValue;
    this._formEvent.tabs = this.tabs;
    return this._formEvent;
  }

  get ActionFieldDataTypesEnum() {
    return ActionFieldDataTypesEnum;
  }

  get isDisabledPrevious() {
    return (
      !this.entityInfo ||
      !this.entityInfo.previousId ||
      this.entityInfo.previousId <= 0
    );
  }
  get isDisabledNext() {
    return (
      !this.entityInfo || !this.entityInfo.nextId || this.entityInfo.nextId <= 0
    );
  }
  get pageHeight() {

    return (Number($('app-single-page .dynamic-details').height()) - Number($('app-single-page .dynamic-details .public-data').height() || 0)) + 'px';

  }

  @ViewChild(SpinnerDirective, { static: false })
  spinnerDirective: SpinnerDirective;
  @ViewChild(DimensionCardComponent, { static: false })
  dimensionCardComponent: DimensionCardComponent;
  @ViewChild('dimensionCard', { static: true })
  dimensionCard: TemplateRef<ElementRef>;
  // @ViewChild('slickCarousel', { static: false })
  // slickCarousel: SlickCarouselComponent;
  @ViewChild(GeneralSearchComponent, { static: false })
  generalSearchComponent: GeneralSearchComponent;
  /* #endregion */

  /* #region  Parameters */
  @Input('config') config: SinglePageConfig;
  @Input('mode') mode: SinglePageMode;
  @Input('hasSaveBtn') hasSaveBtn = true;

  @Input('tabs') set tabs(value: { [tabName: string]: SinglePageTab; }) {
    this._tabs = value;
    if (this.tabs) {
      this.handleDimensionsTab();
      this.handleTabDefaults();
      this.initSinglePageDynamicForm();
      this.handleListDimensionCardDefults();
      if (!this.isActionsInitialized) {
        this.handleListCardDefaults();
        this.isActionsInitialized = true;
      }
    }
  }

  @Input('pageType') set pageType(value: SinglePageType) {
    this._pageType = value || SinglePageType.StandAlone;
  }

  @Input('title') title: string | TemplateRef<any>;
  @Input('mainCard') mainCard: SinglePageMainCard;
  @Input('titleActions') titleActions: SinglePageTitleActions;
  @Input('detailsActions') detailsActions: ActionIcon[];

  @Output('onSaveEntityComplete') onSaveEntityComplete =
    new EventEmitter<any>();
  @Output('onSaveAndCloseEntityComplete') onSaveAndCloseEntityComplete =
    new EventEmitter<any>();
  @Output('onCancel') onCancel = new EventEmitter<boolean>();
  @Output('onCreateNew') onCreateNew = new EventEmitter<boolean>();
  @Output('onCloneClick') onCloneClick = new EventEmitter<boolean>();
  @Output('onRefresh') onRefresh = new EventEmitter<boolean>();
  @Output('onSubmit') onSubmit = new EventEmitter<boolean>();
  @Output('onGetEntityComplete') onGetEntityComplete = new EventEmitter<any>();
  @Output('onNavigate') onNavigate = new EventEmitter<number | any>();
  @Output('onSaveMultiCard') onSaveMultiCard = new EventEmitter<any>();
  @Output('onPopUpCreateClick') onPopUpCreateClick =
    new EventEmitter<boolean>();
  @Output('onPopUpUpdateClick') onPopUpUpdateClick =
    new EventEmitter<any>();
  @Output('onDeleteMultiCard') onDeleteMultiCard = new EventEmitter<any>();
  @Input('onBeforeOpenCreatePopup') onBeforeOpenCreatePopup: (cardKey: string, listCard) => boolean;
  @Input('checkActionPermission') checkActionPermission?: (actionType: ActionTypeEnum | ActionIcon | MenuRolePermissionEnum[]) => boolean;

  /* #endregion */

  /* #region  Constructor */
  constructor(
    private translate: TranslateService,
    private _language: LanguageService,
    private _parameterSetupService: PageSetupService,
    private renderer: Renderer2,
    private elmRef: ElementRef,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private dimensionService: DimensionService,
    private alertsService: AlertsService,
    private router: Router,
    private location: Location
  ) { }
  /* #endregion */

  /* #region  Events */
  ngOnInit() {
    this._language.LangChanged.subscribe((value) => {
      this.lang = value;
      this.translate.use(this.lang);
    });

    this.cardActions = {
      type: ActionListType.title,
      list: [
        {
          type: ActionTypeEnum.moreActions,
          options: ActionOption.icon,
          title: 'helpers.buttons.searchButton',
          onClick: (data: ActionData) => {
            $(data.event.srcElement)
              .closest('.col-card')
              .find('.col-card-body')
              .toggleClass('show');
            if (data.actionNativeEl) {
              $(data.actionNativeEl)
                .find('.moreActions i')
                .toggleClass(' la-angle-up');
            }
          },
        },
      ],
    };
    this.handleTitleActions();
    this.initSlickConfig();
    this.checkAuthPrivilage();
    this.handlePageSetup();
    this.handleGeneralSearcAction();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.checkPermissions() === false) {
        this.router.navigate([CommonUrls.notAuthorized], { replaceUrl: true });
      }
    }, 1000);

  }

  onSelectFile(event, tabKey: string, cardKey: string, fieldKey: string) {
    if (event.files && event.files.length > 0) {
      this.form.get(`${tabKey}.${cardKey}.${fieldKey}`).setValue(event.files[0]);
    }
  }

  onRemoveFile(file, tabKey: string, cardKey: string, fieldKey: string) {
    this.form.get(`${tabKey}.${cardKey}.${fieldKey}`).setValue(null);
  }

  onCancelGeneralSearch() {
    this.generalSearchSelectedTabKey = null;
    this.generalSearchSelectedCardKey = null;
    this.generalSearchSelectedFieldKey = null;
  }

  onSaveGeneralSearch(data) {
    if (data) {
      const field =
        this.tabs[this.generalSearchSelectedTabKey].cards[
          this.generalSearchSelectedCardKey
        ].fields[this.generalSearchSelectedFieldKey];

      // Multi Select in AutoComplete
      if (isArray(data)) {
        data.forEach((rowObject) => {
          rowObject[field.selectFieldProps.key || 'id'] =
            rowObject[field.generalSearchKey || 'id'];
          rowObject[field.selectFieldProps.value || 'name'] =
            rowObject[field.generalSearchValue || 'name'];
        });
      } else {
        data[field.selectFieldProps.key || 'id'] =
          data[field.generalSearchKey || 'id'];
        data[field.selectFieldProps.value || 'name'] =
          data[field.generalSearchValue || 'name'];
      }

      this.onSelectAutoComplete(
        data,
        this.generalSearchSelectedTabKey,
        this.generalSearchSelectedCardKey,
        this.generalSearchSelectedFieldKey
      );
    } else {
      this.onClearAutoComplete(
        data,
        this.generalSearchSelectedTabKey,
        this.generalSearchSelectedCardKey,
        this.generalSearchSelectedFieldKey);
    }
    this.form
      .get(
        `${this.generalSearchSelectedTabKey}.${this.generalSearchSelectedCardKey}.${this.generalSearchSelectedFieldKey}`
      )
      .setValue(data);
    this.form
      .get(
        `${this.generalSearchSelectedTabKey}.${this.generalSearchSelectedCardKey}.${this.generalSearchSelectedFieldKey}`
      )
      .updateValueAndValidity();
    this.onCancelGeneralSearch();
  }
  /* #endregion */

  /* #region  General Methods */
  public saveVisible() {

  }
  hideAction = (action) => {
    if (this.checkActionPermission && action) {
      return !this.checkActionPermission(action);
    } else {
      return false;
    }
  };

  checkPermissions() {
    if (this.checkActionPermission) {
      if (this.mode === SinglePageMode.Create || this.mode === SinglePageMode.Clone) {
        return this.checkActionPermission(PagePermissions.Create);
      }
      else if (this.mode === SinglePageMode.Update) {
        return this.checkActionPermission(PagePermissions.Update);
      }
    }
    return true;
  }
  reInitializePage() {
    this.tabs = this.tabs;
  }

  checkAuthPrivilage() {

  }

  private allowEditing() {
    if (
      this.currentStage &&
      (this.currentStage.type === StageTypes.Endpoint ||
        this.currentStage.type === StageTypes.EndpointSNP)
    ) {
      return false;
    }
    return this.canEdit;
  }

  disableAllTabs() {
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        if (this.tabs[tabKey].type === SinglePageTabType.Form) {
          if (this.form.get(tabKey)) {
            this.form.get(tabKey).disable();
          }
        }
      }
    }
  }

  removeListCardActions() {
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        const tab = this.tabs[tabKey];
        for (const cardKey in tab.cards) {
          if (tab.cards.hasOwnProperty(cardKey)) {
            if (tab.cards[cardKey].type === SinglePageCardType.Multi) {
              tab.cards[cardKey].hasCreateAction = false;
              tab.cards[cardKey].hasUpdateAction = false;
              tab.cards[cardKey].hasDeleteAction = false;
            }
          }
        }
      }
    }
  }
  hasGeneralSearch(params) {
    return (
      (params.field.generalSearchPageListTemplate ||
        (params.field.generalSearchDataListConfig &&
          params.field.generalSearchColumns)) &&
      !this.isFieldDisabled(params.tabKey, params.cardKey, params.fieldKey)
    );
  }

  handleGeneralSearcAction() {
    this.generalSearchAction = {
      type: ActionListType.title,
      list: [
        {
          type: ActionTypeEnum.search,
          title: 'generalSearch.title',
          hidden: (params) => !this.hasGeneralSearch(params),
          onClick: (data: ActionData) => {
            this.generalSearchSelectedTabKey = data.params['tabKey'];
            this.generalSearchSelectedCardKey = data.params['cardKey'];
            this.generalSearchSelectedFieldKey = data.params['fieldKey'];
          },
        },
      ],
    };
  }

  isFieldDisabled(tabKey: string, cardKey: string, fieldKey: string) {
    return (
      this.form &&
      this.form.get(`${tabKey}`) &&
      this.form.get(`${tabKey}.${cardKey}`) &&
      this.form.get(`${tabKey}.${cardKey}.${fieldKey}`) &&
      this.form.get(`${tabKey}.${cardKey}.${fieldKey}`).disabled
    );
  }

  navigate(id: number | any) {
    if (id > 0 && id !== this.id) {
      this.config.entityId = id;
      this.config.entity = null;
      this.reInitializePage();
      this.onNavigate.emit(id);
    }
  }

  collapse() {
    $('.page-header-body')
      .toggleClass('show')
      .find('.navigation .page-item i')
      .toggleClass(' la-angle-up');
  }

  isString(string) {
    return typeof string === 'string';
  }

  getObjectKeyes(obj) {
    return obj ? Object.keys(obj) : [];
  }
  test(x) {

    return true;
  }

  showSpinner() {
    setTimeout(() => this.spinnerDirective.showSpinner(), 0);
  }

  hideSpinner() {
    setTimeout(() => this.spinnerDirective.hideSpinner(), 0);
  }

  onTabSelected(tabKey: string) {
    this.selectedTabKey = tabKey;
  }

  handleTabDefaults() {
    for (const key in this.tabs) {
      if (this.tabs.hasOwnProperty(key)) {
        if (this.tabs[key].hidden !== true) {
          this.selectedTabKey = key;
          break;
        }
      }
    }
    this.selectedIndexUpdate = null;
    this.visibleListCardKey = null;
    this.visibleListTabKey = null;
    this._formEvent = {};
    this.entityInfo = null;
    this.currentStage = null;
    this.detailsStages = [];
    if (!this.workflowActions) {
      this.workflowActions = { type: ActionListType.title };
    }
    this.workflowActions.moreActions = [];
    this.mainActions = { type: ActionListType.title, moreActions: [] };
    this.validationMessages = {};
  }

  handleTitleActions() {
    if (!this.titleActions) {
      this.titleActions = {
        actionList: {
          type: ActionListType.default,
          list: [],
          moreActions: [],
        },
      };
    }
    this.titleActions.actionList = this.titleActions.actionList || {
      type: ActionListType.default,
    };
    this.titleActions.actionList.list = this.titleActions.actionList.list || [];

    this.titleActions.actionList.list.unshift({
      type: ActionTypeEnum.refresh,
      options: ActionOption.all,
      title: 'helpers.buttons.refreshButton',
      hidden: () =>
        this.titleActions.hasRefreshAction === false ||
        this.mode === SinglePageMode.Create,
      onClick: () => this.refresh(),
    });

    // this.titleActions.actionList.list.unshift(

    //   {
    //     type: ActionTypeEnum.backToList,
    //     options: ActionOption.all,
    //     title: 'helpers.buttons.backToList',
    //     hidden: () => this.titleActions.hasCancelAction === false,
    //     onClick: () => this.onCancel.emit(true),
    //   }
    // );

    this.titleActions.actionList.list.unshift({
      type: ActionTypeEnum.create,
      options: ActionOption.all,
      title: 'helpers.buttons.new',
      permissions: PagePermissions.Create,
      hidden: () => this.titleActions.hasNewAction === false,
      onClick: () => this.createNew(),
    });

    this.titleActions.actionList.list.unshift({
      type: ActionTypeEnum.create,
      options: ActionOption.all,
      permissions: PagePermissions.Create,
      title: 'helpers.buttons.cloneButton',
      hidden: () => {
        if (!this.titleActions.hasCloneAction || !this.allowEditing() || this.mode !== SinglePageMode.Update) {
          return true;
        } else {
          return false;
        }
      },
      onClick: () => this.onCloneClick.emit(true),
    });

    this.titleActions.actionList.list.unshift({
      type: ActionTypeEnum.save,
      options: ActionOption.all,
      title: 'helpers.buttons.saveButton',
      //permissions: (this.mode === this.singlePageMode.Clone || this.mode === this.singlePageMode.Create) ? PagePermissions.Create : this.mode === this.singlePageMode.Update ? PagePermissions.Update : null,
      hidden: () => {
        if (this.titleActions.hasSaveAction === false || !this.allowEditing() || this.hasSaveBtn === false) {
          return true;
        } else if (this.mode === SinglePageMode.Create || this.mode === SinglePageMode.Clone) {
          if (this.checkActionPermission && !this.checkActionPermission(PagePermissions.Create)) {
            return true;
          }
        } else if (this.mode === SinglePageMode.Update) {
          if (this.checkActionPermission && !this.checkActionPermission(PagePermissions.Update)) {
            return true;
          }
        }
        return false;
      },
      onClick: () => this.saveAndClose()
    });
  }

  createNew() {
    this.resetPage();
    this.mode = SinglePageMode.Create;
    this.config.entity = null;
    this.reInitializePage();
    this.onCreateNew.emit(true);
  }

  refresh() {
    this.resetPage();
    this.onRefresh.emit(true);
    this.config.entity = null;
    this.reInitializePage();
  }

  save() {
    this.formSubmitted = true;
    if (this.dimensionCardComponent) {
      this.dimensionCardComponent.submitCard();
    }
    this.onSubmit.emit(true);
    if (this.config.beforeCheckValidity) {
      this.config.beforeCheckValidity();
    }
    if (
      this.form.invalid ||
      (this.dimensionCardComponent && !this.dimensionCardComponent.isValid())
    ) {
      this.getValidationMessagesCard();
      this.getDimensionCardValidationMessages();
      return;
    }
    this.validationMessages = {};
    const savedEntity = this.getSavedValue();

    const invalidLineDimension: DimensionLineFieldConfigurationVM[] = [];
    for (const cardKey in this.inLineDimensionCardsInfo) {
      if (Object.prototype.hasOwnProperty.call(this.inLineDimensionCardsInfo, cardKey)) {
        const cardConfig = this.inLineDimensionCardsInfo[cardKey];
        if (cardConfig.inLineDimensions) {
          cardConfig.inLineDimensions.forEach(fieldConfig => {
            let hasnotValue;
            if (fieldConfig.required) {
              hasnotValue = savedEntity['entityDimensions'].lineEntries[cardConfig.entityName]
                .some(x => x.some(di => di.columnName == fieldConfig.columnName && (di.value != null || di.value != undefined)));
            }
            if (hasnotValue) {
              invalidLineDimension.push(fieldConfig);
            }
          });
        }
      }
    }
    if (invalidLineDimension.length > 0) {
      this.alertsService.errorMessage('Please insert Dimension in Document Lines' + invalidLineDimension.map(x => x.name).join(', '));
      return;
    }

    if (this.mode === SinglePageMode.Create && this.config.createEntity) {
      this.showSpinner();
      this.config.createEntity(savedEntity).subscribe(
        (res) => {
          this.hideSpinner();
          if (res && res.success) {
            this.mode = SinglePageMode.Update;
            this.config.entity = { ...res.entity };
            this.reInitializePage();
            this.mapGetEntityMetaData(res);
            this.onSaveEntityComplete.emit(res.entity);
          }
        },
        () => this.hideSpinner(),
        () => this.hideSpinner()
      );
    }

    if (this.mode === SinglePageMode.Update && this.config.updateEntity) {
      this.showSpinner();
      this.config.updateEntity(savedEntity).subscribe(
        (res) => {
          this.hideSpinner();
          if (res && res.success) {
            this.config.entity = { ...res.entity };
            this.reInitializePage();
            this.mapGetEntityMetaData(res);
            this.onSaveEntityComplete.emit(res.entity);
          }
        },
        () => this.hideSpinner(),
        () => this.hideSpinner()
      );
    }
    if (this.mode === SinglePageMode.Clone && this.config.createEntity) {
      this.showSpinner();
      this.config.createEntity(savedEntity).subscribe(
        (res) => {
          this.hideSpinner();
          if (res && res.success) {
            this.config.entity = { ...res.entity };
            this.reInitializePage();
            this.mapGetEntityMetaData(res);
            this.onSaveEntityComplete.emit(res.entity);
          }
        },
        () => this.hideSpinner(),
        () => this.hideSpinner()
      );
    }
  }

  saveAndClose() {
    this.formSubmitted = true;
    if (this.dimensionCardComponent) {
      this.dimensionCardComponent.submitCard();
    }
    this.onSubmit.emit(true);
    if (this.config.beforeCheckValidity) {
      this.config.beforeCheckValidity();
    }
    if (
      this.form.invalid ||
      (this.dimensionCardComponent && !this.dimensionCardComponent.isValid())
    ) {
      this.getValidationMessagesCard();
      this.getDimensionCardValidationMessages();
      return;
    }
    this.validationMessages = {};
    const savedEntity = this.getSavedValue();
    const invalidLineDimension: DimensionLineFieldConfigurationVM[] = [];
    for (const cardKey in this.inLineDimensionCardsInfo) {
      if (Object.prototype.hasOwnProperty.call(this.inLineDimensionCardsInfo, cardKey)) {
        const cardConfig = this.inLineDimensionCardsInfo[cardKey];
        if (cardConfig.inLineDimensions) {
          cardConfig.inLineDimensions.forEach(fieldConfig => {
            const entityLineEntry = savedEntity['entityDimensions'].lineEntries[cardConfig.entityName];
            if (entityLineEntry) {
              if (fieldConfig.required) {
                let hasValue = entityLineEntry.some(x => x.some(di => di.columnName == fieldConfig.targetColumn && (di.value != null || di.value != undefined)));
                if (!hasValue) {
                  invalidLineDimension.push(fieldConfig);
                }
              }

            }
          });
        }
      }
    }
    if (invalidLineDimension.length > 0) {
      this.alertsService.errorMessage('Please insert Dimension in Document Lines (' + invalidLineDimension.map(x => x.name).join(', ') + ' )');
      return;
    }
    if (this.mode === SinglePageMode.Create && this.config.createEntity) {
      this.showSpinner();
      this.config.createEntity(savedEntity).subscribe(
        (res) => {
          this.hideSpinner();
          if (res && res.success) {
            this.mode = SinglePageMode.Update;
            this.config.entity = { ...res.entity };
            this.reInitializePage();
            this.mapGetEntityMetaData(res);
            this.onSaveAndCloseEntityComplete.emit(res.entity);
          }
        },
        () => this.hideSpinner(),
        () => this.hideSpinner()
      );
    }

    if (this.mode === SinglePageMode.Update && this.config.updateEntity) {
      this.showSpinner();
      this.config.updateEntity(savedEntity).subscribe(
        (res) => {
          this.hideSpinner();
          if (res && res.success) {
            this.config.entity = { ...res.entity };
            this.reInitializePage();
            this.mapGetEntityMetaData(res);
            this.onSaveAndCloseEntityComplete.emit(res.entity);
          }
        },
        () => this.hideSpinner(),
        () => this.hideSpinner()
      );
    }
    if (this.mode === SinglePageMode.Clone && this.config.createEntity) {
      this.showSpinner();
      this.config.createEntity(savedEntity).subscribe(
        (res) => {
          this.hideSpinner();
          if (res && res.success) {
            this.config.entity = { ...res.entity };
            this.reInitializePage();
            this.mapGetEntityMetaData(res);
            this.onSaveAndCloseEntityComplete.emit(res.entity);
          }
        },
        () => this.hideSpinner(),
        () => this.hideSpinner()
      );
    }
  }

  getValidationMessagesCard() {
    this.validationMessages = {};
    for (const tabControlKey in this.form.controls) {
      if (this.form.controls.hasOwnProperty(tabControlKey)) {
        const tabControl = this.form.controls[tabControlKey] as FormGroup;

        if (tabControl.invalid) {
          this.validationMessages[tabControlKey] = {
            tabTitle: this.tabs[tabControlKey].title,
          };

          for (const cardControlKey in tabControl.controls) {
            if (tabControl.controls.hasOwnProperty(cardControlKey)) {
              const cardControl = tabControl.controls[
                cardControlKey
              ] as FormGroup;

              if (cardControl.invalid) {
                this.validationMessages[tabControlKey].cards =
                  this.validationMessages[tabControlKey].cards || {};
                this.validationMessages[tabControlKey].cards[cardControlKey] = {
                  cardTitle:
                    this.tabs[tabControlKey].cards[cardControlKey].title,
                };

                for (const fieldControlKey in cardControl.controls) {
                  if (cardControl.controls.hasOwnProperty(fieldControlKey)) {
                    const fieldControl = cardControl.controls[
                      fieldControlKey
                    ] as FormControl;

                    if (fieldControl.invalid) {
                      this.validationMessages[tabControlKey].cards[
                        cardControlKey
                      ].fields =
                        this.validationMessages[tabControlKey].cards[
                          cardControlKey
                        ].fields || {};
                      this.validationMessages[tabControlKey].cards[
                        cardControlKey
                      ].fields[fieldControlKey] =
                        this.tabs[tabControlKey].cards[cardControlKey].fields[
                          fieldControlKey
                        ].title;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  getDimensionCardValidationMessages() {
    if (this.dimensionCardComponent) {
      const firstTabKey = this.getObjectKeyes(this.tabs)[0];
      this.validationMessages = this.validationMessages || {};
      this.validationMessages[firstTabKey] = this.validationMessages[
        firstTabKey
      ] || {
        tabTitle: this.tabs[firstTabKey].title,
        cards: {},
      };

      if (this.dimensionCardComponent.getValidationMessagesCard()) {
        this.validationMessages[firstTabKey].cards['dimensionCard'] = {
          cardTitle: 'dimensionCard.title',
          fields: this.dimensionCardComponent.getValidationMessagesCard(),
        };
      }
    }
  }

  slickInit(event) { }

  onSlickBreakpoints(event) {
    if (event.breakpoint === 768) {
      this.slickSlideToShowLimit = 2;
    } else {
      this.slickSlideToShowLimit = 6;
    }
  }

  initSlickConfig() {
    this.slickConfig = {
      dots: false,
      infinite: false,
      speed: 300,
      slidesToShow: this.slickSlideToShowLimit,
      slidesToScroll: 1,
      rtl: this.lang === Language.Arabic,
      arrows: false,
      // nextArrow: '<i class="las la-angle-right right-details-arrow"></i>',
      // prevArrow: '<i class="las la-angle-left left-details-arrow"></i>',
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
      ],
    };
  }

  changeStageTab(event, stage: any) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (stage && !stage.isNext) {
      this.selectedStage = stage;
      stage.isVisited
        ? (this.historyDetails = stage.actionEntryHistoryVMs)
        : (this.historyDetails = []);
    } else {
      this.historyDetails = [];
    }
  }

  getStageTitle(stage) {
    let obj;
    if (stage && stage.stageData) {
      obj = stage.stageData.name + ' : ';
      this.translate.get('helpers.labels').subscribe((key) => {
        if (stage.isVisited) {
          obj += key['visitedStage'];
        } else if (
          this.currentStage &&
          stage.isHead &&
          stage.stageData.id === this.currentStage.id
        ) {
          obj += key['currentStage'];
        } else {
          obj += key['nextStage'];
        }
      });
    }
    return obj;
  }

  // slickNext() {
  //   this.slickCarousel.slickNext();
  // }

  // slickPrev() {
  //   this.slickCarousel.slickPrev();
  // }
  /* #endregion */

  /* #region  Dynamic Form Methods */
  initForm() {
    if (!this.form) {
      this.form = this.fb.group({});
    }
  }

  initSinglePageDynamicForm() {
    if (this.form) {
      this.resetForm();
    }
    this.initForm();
    if (this.mode === SinglePageMode.Create) {
      this.handleCreateFields();
      this.hanldeOnChangeEvents();
      this.handleListDimensionCard();
      if (this.tabs['activityTab']) {
        delete this.tabs['activityTab'];
      }

      if (this.tabs['attachmentTab']) {
        delete this.tabs['attachmentTab'];
      }

      if (this.config && this.config.getStagesList) {
        this.getCreateStageSequenceList();
      }
    } else if (this.mode === SinglePageMode.Update) {
      if (this.config) {
        if (this.config.entity) {
          this.handleUpdateFields();
          this.hanldeOnChangeEvents();
          this.onGetEntityComplete.emit({ ...this.config.entity });
          this.handleListCardUpdateValues();
          this.handleListDimensionCard();
        } else if (this.id && this.config.getEntity) {
          this.showSpinner();
          this.handleCreateFields(false);
          this.config.getEntity(this.id).subscribe(
            (res) => {
              if (res.success) {
                this.mapGetEntityMetaData(res);
                this.resetPage();
                this.initForm();
                this.handleUpdateFields();
                this.onGetEntityComplete.emit({ ...this.config.entity });
                this.hanldeOnChangeEvents();
                this.handleListCardUpdateValues();
                this.handleListDimensionCard();
              }
              this.hideSpinner();
            },
            () => this.hideSpinner(),
            () => this.hideSpinner()
          );
        }
      }
    } else if (this.mode === this.singlePageMode.Clone) {
      if (this.config) {
        this.handleCreateFields(false);
        // this.hanldeOnChangeEvents();
        if (this.tabs['activityTab']) {
          delete this.tabs['activityTab'];
        }
        if (this.tabs['attachmentTab']) {
          delete this.tabs['attachmentTab'];
        }
        if (this.config.entity) {
          this.handleUpdateFields();
          this.hanldeOnChangeEvents();
          this.onGetEntityComplete.emit({ ...this.config.entity });
          this.handleListCardUpdateValues();
          if (this.config.getStagesList) {
            this.getCreateStageSequenceList();
          }
        } else if (this.id && this.config.getEntity) {
          this.showSpinner();
          // this.handleCreateFields(false);
          this.config.getEntity(this.id).subscribe(
            (res) => {
              if (res.success) {
                this.mapGetEntityMetaData(res);
                this.resetPage();
                this.initForm();
                this.handleUpdateFields();
                this.onGetEntityComplete.emit({ ...this.config.entity });
                this.hanldeOnChangeEvents();
                this.handleListCardUpdateValues();
                this.hideSpinner();
                if (this.config.getStagesList) {
                  this.getCreateStageSequenceList();
                }
              }
            },
            () => this.hideSpinner(),
            () => this.hideSpinner()
          );
        }
      }
    }
  }

  mapGetEntityMetaData(res) {
    this.config.entity = { ...res.entity };
    this.config.entityId = res.entity.id;
    setTimeout(() => {
      if (this.mode === this.singlePageMode.Update) {
        this.entityInfo = { ...res.entityInfo };

        // workflow stages and history
        if (res.entityInfo && res.entityInfo.currentStageInfo) {
          this.currentStage = res.entityInfo.currentStageInfo || null;
        }

        if (
          res.entityInfo &&
          res.entityInfo.stageEntryDetails &&
          res.entityInfo.stageEntryDetails.stageEntryDataVMs
        ) {
          this.selectedStage =
            res.entityInfo.stageEntryDetails.stageEntryDataVMs.find(
              (stage) => stage.isHead
            ) || null;
          this.changeStageTab(null, this.selectedStage);
          this.detailsStages =
            res.entityInfo.stageEntryDetails.stageEntryDataVMs;
          this.detailsStages = this.detailsStages
            .sort((a, b) => a.stageData.uiorder - b.stageData.uiorder || a.stageData.id - b.stageData.id);

        } else {
          this.selectedStage = null;
          this.detailsStages = null;
        }

        // Build workflow actions & System Actions
        if (this.mode === SinglePageMode.Update) {
          this.handleWorkflowActions();
          this.handleWorkflowSystemActions();
          this.handleMainActions();
        }

        // activities & attchment & related-links
        this.handleActivitiesTab();
        this.handleAttachmentTab();
        this.handleRelatedLinks();
      }
    }, 100);
  }

  handleWorkflowActions() {
    this.workflowActionsFlag = false;
    if (this.currentStage && this.currentStage.stageAction) {
      this.currentStage.stageAction.forEach((action) => {
        this.workflowActions.moreActions.push({
          title: action.name,
          type: ActionTypeEnum.workFlow,
          options: ActionOption.all,
          permissions: PagePermissions.Update,
          hidden: () => !this.selectedStage.isHead,
          onClick: () => this.openActionEntryModal(action),
        });
      });
      setTimeout(() => {
        this.workflowActions = { ...this.workflowActions };
        this.workflowActionsFlag = true;

      }, 100);
    }
  }

  handleWorkflowSystemActions() {
    if (this.currentStage && this.currentStage.stageSystemAction && this.detailsActions && this.detailsActions.length > 0) {
      this.detailsActions
        .filter(s => s.systemActionHttpVerb && s.systemActionId)
        .forEach(systemAction => {
          const isHidden = this.currentStage.stageSystemAction
            .find(a => a.stageId === this.currentStage.id) ? false : true;
          const action = { ...systemAction };
          action.hidden = (params) => systemAction.hidden ?
            systemAction.hidden(params) || isHidden : isHidden;
          //action.permissions = PagePermissions.Update;
          this.workflowActions.moreActions.push(action);
        });
    }
  }

  handleMainActions() {
    if (this.detailsActions && this.detailsActions.length > 0) {
      this.detailsActions.forEach(s => {
        if (!s.systemActionId && !s.systemActionHttpVerb) {
          //s.permissions = PagePermissions.Update;
          this.mainActions.moreActions.push(s);
        }
      });
    }
  }

  getCreateStageSequenceList() {
    this.showSpinner();
    this.config.getStagesList()
      .subscribe(res => {
        this.hideSpinner();
        if (res.success && res.entities) {
          res.entities.splice(0, 1);
          res.entities.splice(res.entities.length - 1, 1);
          this.stageSequenceList = [...res.entities];
          this.stageSequenceList = this.stageSequenceList.sort((a, b) => a.uiorder - b.uiorder || a.id - b.id);
        }
      },
        () => this.hideSpinner(),
        () => this.hideSpinner()
      );
  }

  handleCreateFields(getData = true) {
    this.form = null;
    this.initForm();
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        if (this.tabs[tabKey].type !== SinglePageTabType.Form) {
          continue;
        }
        const tabForm = this.fb.group({});
        this.form.addControl(tabKey, tabForm);

        for (const cardKey in this.tabs[tabKey].cards) {
          if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
            const card = this.tabs[tabKey].cards[cardKey];
            if (card.type === SinglePageCardType.Single) {
              const cardForm = this.fb.group({});
              tabForm.addControl(cardKey, cardForm);

              // iterate through card fields
              for (const fieldKey in card.fields) {
                if (card.fields.hasOwnProperty(fieldKey)) {
                  const field = card.fields[fieldKey];
                  if (field.dataType === SinglePageFieldType.Template) {
                    continue;
                  }
                  let fieldControlValue = null;
                  if (field.dataType === SinglePageFieldType.RadioButton) {
                    if (
                      field.selectOptions.list &&
                      field.selectOptions.selected
                    ) {
                      fieldControlValue = field.selectOptions.selected || null;
                    }
                    if (field.selectOptions.getSelectOptions) {
                      this.handleSelectOptionsGetData(
                        tabKey,
                        cardKey,
                        fieldKey
                      );
                    }
                  } else if (field.dataType === SinglePageFieldType.CheckBox) {
                    if (field.selectOptions.binary) {
                      fieldControlValue = field.selectOptions.selected || false;
                    } else {
                      fieldControlValue = field.selectOptions.selected || [];
                      if (field.selectOptions.getSelectOptions) {
                        this.handleSelectOptionsGetData(
                          tabKey,
                          cardKey,
                          fieldKey
                        );
                      }
                    }
                  }
                  const formControl = this.fb.control({
                    value: fieldControlValue,
                    disabled:
                      field.dataType === SinglePageFieldType.Static ||
                      this.tabs[tabKey].disabled ||
                      this.tabs[tabKey].hidden ||
                      card.disabled ||
                      card.hidden ||
                      field.disabled ||
                      field.hidden ||
                      false,
                  });

                  // set parameter configrations

                  formControl.setValidators(
                    this.transformValidatorsToArr(field.validators)
                  );
                  cardForm.addControl(fieldKey, formControl);
                  if (
                    getData &&
                    field.dataType === SinglePageFieldType.DropDown
                  ) {
                    this.handleSelectFieldsGetData(tabKey, cardKey, fieldKey);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  handleUpdateFields() {
    this.form = null;
    this.initForm();
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        if (this.tabs[tabKey].type !== SinglePageTabType.Form) {
          continue;
        }
        const tabForm = this.fb.group({});
        this.form.addControl(tabKey, tabForm);

        for (const cardKey in this.tabs[tabKey].cards) {
          if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
            const card = this.tabs[tabKey].cards[cardKey];
            if (card.type === SinglePageCardType.Single) {
              const cardForm = this.fb.group({});
              tabForm.addControl(cardKey, cardForm);
              const entityCard = this.getEntityCardByCardKey(tabKey, cardKey);

              // iterate through card fields
              for (const fieldKey in card.fields) {
                if (card.fields.hasOwnProperty(fieldKey)) {
                  const field = card.fields[fieldKey];
                  if (field.dataType === SinglePageFieldType.Template) {
                    continue;
                  }

                  let fieldControlValue = null;
                  if (field.dataType === SinglePageFieldType.AutoComplete) {
                    fieldControlValue = this.getAutoCompleteSelectedField(
                      tabKey,
                      cardKey,
                      fieldKey
                    );
                  } else if (
                    field.dataType === SinglePageFieldType.RadioButton
                  ) {
                    fieldControlValue =
                      entityCard && entityCard[fieldKey]
                        ? entityCard[fieldKey]
                        : null;
                    if (field.selectOptions.getSelectOptions) {
                      this.handleSelectOptionsGetData(
                        tabKey,
                        cardKey,
                        fieldKey
                      );
                    }
                  } else if (field.dataType === SinglePageFieldType.CheckBox) {
                    if (field.selectOptions.binary) {
                      fieldControlValue =
                        entityCard && entityCard[fieldKey]
                          ? entityCard[fieldKey]
                          : false;
                    } else {
                      fieldControlValue =
                        entityCard && entityCard[fieldKey]
                          ? entityCard[fieldKey]
                          : [];
                      if (field.selectOptions.getSelectOptions) {
                        this.handleSelectOptionsGetData(
                          tabKey,
                          cardKey,
                          fieldKey
                        );
                      }
                    }
                  } else if (field.dataType === SinglePageFieldType.Date) {
                    fieldControlValue =
                      entityCard && entityCard[fieldKey]
                        ? new Date(entityCard[fieldKey])
                        : null;
                  } else {
                    fieldControlValue =
                      entityCard &&
                        entityCard[fieldKey] !== null &&
                        entityCard[fieldKey] !== undefined
                        ? entityCard[fieldKey]
                        : null;
                  }
                  // add field control to form group
                  const formControl = this.fb.control({
                    value: fieldControlValue,
                    disabled:
                      field.dataType === SinglePageFieldType.Static ||
                      this.tabs[tabKey].disabled ||
                      this.tabs[tabKey].hidden ||
                      card.disabled ||
                      card.hidden ||
                      field.disabled ||
                      field.hidden ||
                      false,
                  });

                  formControl.setValidators(
                    this.transformValidatorsToArr(field.validators)
                  );
                  cardForm.addControl(fieldKey, formControl);

                  // Drop-down data source
                  if (field.dataType === SinglePageFieldType.DropDown) {
                    this.handleSelectFieldsGetData(tabKey, cardKey, fieldKey);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // handleDimensionCard() {
  //   this.tabs[this.getObjectKeyes(this.tabs)[0]]
  //     .cards['dimensionCard'] = {
  //     type: SinglePageCardType.Template,
  //     contentTemplate: this.dimensionCard,
  //     hidden: false,
  //     title: '',
  //     cardSize: 12,
  //   };
  // }

  //  Dropdown Get data source
  handleSelectFieldsGetData(tabKey: string, cardKey: string, fieldKey: string) {
    const field = this.tabs[tabKey].cards[cardKey].fields[fieldKey];
    if (!field.selectFieldProps) {
      throw new Error(
        'selectFieldProps can not be null or undefiened for AutoComplete and DropDown. please provide it'
      );
    }
    if (
      !field.selectFieldProps.selectList &&
      !field.selectFieldProps.getSelectList
    ) {
      throw new Error(`selectFieldProps.selectList && selectFieldProps.getSelectList can not be null
      or undefiened for AutoComplete and DropDown. Please provide one of them`);
    }

    // Drop-Down
    if (field.selectFieldProps.selectList) {
      if (
        this.mode === SinglePageMode.Update ||
        this.mode === SinglePageMode.Clone
      ) {
        this.form
          .get(`${tabKey}.${cardKey}.${fieldKey}`)
          .setValue(
            this.getDropDownSelectedField(tabKey, cardKey, fieldKey) || null
          );
      }
    }

    if (
      !field.selectFieldProps.selectList &&
      field.selectFieldProps.getSelectList
    ) {
      field.selectFieldProps.getSelectList().subscribe((result) => {
        if (result) {
          field.selectFieldProps.selectList = result.entities || [];
          if (
            this.mode === SinglePageMode.Update ||
            this.mode === SinglePageMode.Clone
          ) {
            this.form
              .get(`${tabKey}.${cardKey}.${fieldKey}`)
              .setValue(
                this.getDropDownSelectedField(tabKey, cardKey, fieldKey) || null
              );
          }
        }
      });
    }
  }

  // for checkbox and radio button
  handleSelectOptionsGetData(
    tabKey: string,
    cardKey: string,
    fieldKey: string
  ) {
    const field = this.tabs[tabKey].cards[cardKey].fields[fieldKey];
    if (field.selectOptions.getSelectOptions) {
      field.selectOptions.getSelectOptions().subscribe((res) => {
        field.selectOptions.list = [];
        res.forEach((option) => {
          field.selectOptions.list.push({
            title: option[field.selectOptions.title],
            value: option[field.selectOptions.value],
          });
        });
      });
    }
  }

  getAutoCompleteSelectedField(
    tabKey: string,
    cardKey: string,
    fieldKey: string
  ) {
    const entityCard = this.getEntityCardByCardKey(tabKey, cardKey);
    const field = this.tabs[tabKey].cards[cardKey].fields[fieldKey];
    if (!this.isAutoCompleteModeMulti(tabKey, cardKey, fieldKey)) {
      const selectedFieldKey =
        entityCard[field.selectFieldProps.selectedField.key];
      const selectedFieldValue =
        entityCard[field.selectFieldProps.selectedField.value];
      return !selectedFieldKey && !selectedFieldValue
        ? null
        : {
          [this.getSelectFieldsKey(tabKey, cardKey, fieldKey)]:
            selectedFieldKey,
          [this.getSelectFieldsValue(tabKey, cardKey, fieldKey)]:
            selectedFieldValue,
        };
    } else if (entityCard && isArray(entityCard[fieldKey])) {
      if (entityCard[fieldKey].length > 0) {
        let selectedFieldKey, selectedFieldValue;
        return entityCard[fieldKey].map((obj) => {
          selectedFieldKey = obj[field.selectFieldProps.selectedField.key];
          selectedFieldValue = obj[field.selectFieldProps.selectedField.value];
          return !selectedFieldKey && !selectedFieldValue
            ? null
            : {
              [this.getSelectFieldsKey(tabKey, cardKey, fieldKey)]:
                selectedFieldKey,
              [this.getSelectFieldsValue(tabKey, cardKey, fieldKey)]:
                selectedFieldValue,
            };
        });
      }
    }
    return [];
  }

  getDropDownSelectedField(tabKey: string, cardKey: string, fieldKey: string) {
    const entityCard = this.getEntityCardByCardKey(tabKey, cardKey);
    const field = this.tabs[tabKey].cards[cardKey].fields[fieldKey];
    const selectedFieldKey =
      entityCard[field.selectFieldProps.selectedField.key] || null;
    const selectedField = field.selectFieldProps.selectList.find(
      (l) =>
        l[this.getSelectFieldsKey(tabKey, cardKey, fieldKey)] ===
        selectedFieldKey
    );
    this.form
      .get(`${tabKey}.${cardKey}.${fieldKey}`)
      .setValue(selectedField || null);
    return selectedField;
  }

  hanldeOnChangeEvents() {
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        for (const cardKey in this.tabs[tabKey].cards) {
          if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
            if (this.tabs[tabKey].onChange) {
              this.tabValueChanges(tabKey);
            }

            const card = this.tabs[tabKey].cards[cardKey];
            if (card.type !== SinglePageCardType.Single) {
              continue;
            }
            if (card.onChange) {
              this.cardValueChanges(tabKey, cardKey);
            }

            // iterate card fields
            for (const fieldKey in card.fields) {
              if (card.fields.hasOwnProperty(fieldKey)) {
                const field = card.fields[fieldKey];
                if (field.dataType !== SinglePageFieldType.Template) {
                  if (field.onChange) {
                    this.fieldValueChanges(tabKey, cardKey, fieldKey);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  tabValueChanges(tabKey: string) {
    this.form.get(`${tabKey}`).valueChanges.subscribe((value) => {
      this.tabs[tabKey].onChange(this.formEvent);
    });
  }

  cardValueChanges(tabKey: string, cardKey: string) {
    this.form.get(`${tabKey}.${cardKey}`).valueChanges.subscribe((value) => {
      this._formEvent.value = this.formValue;
      this._formEvent.value[tabKey][cardKey] = value;
      this.tabs[tabKey].cards[cardKey].onChange(this.formEvent);
    });
  }

  fieldValueChanges(tabKey: string, cardKey: string, fieldKey: string) {
    this.form
      .get(`${tabKey}.${cardKey}.${fieldKey}`)
      .valueChanges.subscribe((value) => {
        const field = this.getField(tabKey, cardKey, fieldKey);

        const relatedDimensionConfig = [];
        if (
          field.dataType === SinglePageFieldType.DropDown &&
          this.dimensionRelatedEntitiesInHeader &&
          this.dimensionRelatedEntitiesInHeader.length > 0 &&
          field.dimensionEntityName
        ) {
          this.dimensionRelatedEntitiesInHeader.forEach((d) => {
            if (d.entitiy === field.dimensionEntityName) {
              relatedDimensionConfig.push(d);
            }
          });
        }
        if (relatedDimensionConfig && relatedDimensionConfig.length > 0) {
          const entityEntryId =
            value[field.dimensionEntitykey] ||
            value['id'] ||
            value[this.lowerFirstLetter(fieldKey) + 'Id'] ||
            value[
            this.lowerFirstLetter(fieldKey.slice(0, fieldKey.length - 2))
            ];
          this.getRelatedDimensionValue(relatedDimensionConfig, entityEntryId);
        }
        if (
          field.dataType !== SinglePageFieldType.AutoComplete &&
          field.onChange
        ) {
          this._formEvent.value = this.formValue;
          this._formEvent.value[tabKey][cardKey][fieldKey] = value;
          field.onChange(this.formEvent);
        }
      });
  }

  getRelatedDimensionValue(
    relatedDimensionConfig: RelatedEntityDimension[],
    entityEntryId: number
  ) {
    if (entityEntryId) {
      this.dimensionService
        .getRelatedDimensionValue(
          relatedDimensionConfig.map((r) => r.dimensionTargetId),
          relatedDimensionConfig[0].entitiy,
          entityEntryId
        )
        .subscribe((res) => {
          if (res.success && res.entities && res.entities.length > 0) {
            this.dimensionCardComponent.setDimensionHeaderValue(
              relatedDimensionConfig,
              res.entities
            );
          }
        });
    }
  }

  isAutoCompleteModeMulti(tabKey: string, cardKey: string, fieldKey: string) {
    const field = this.getField(tabKey, cardKey, fieldKey);
    if (field && field.autoCompleteMode === AutoCompleteMode.Multi) {
      return true;
    }
    return false;
  }

  onSelectAutoComplete(
    event,
    tabKey: string,
    cardKey: string,
    fieldKey: string
  ) {
    const field = this.getField(tabKey, cardKey, fieldKey);

    const relatedDimensionConfig: RelatedEntityDimension[] = [];
    if (
      this.dimensionRelatedEntitiesInHeader &&
      this.dimensionRelatedEntitiesInHeader.length > 0 &&
      field.dimensionEntityName
    ) {
      this.dimensionRelatedEntitiesInHeader.forEach((d) => {
        if (d.entitiy === field.dimensionEntityName) {
          relatedDimensionConfig.push(d);
        }
      });
    }
    if (relatedDimensionConfig && relatedDimensionConfig.length > 0) {
      const entityEntryId =
        event[field.dimensionEntitykey] ||
        event['id'] ||
        event[this.lowerFirstLetter(fieldKey) + 'Id'] ||
        event[this.lowerFirstLetter(fieldKey.slice(0, fieldKey.length - 2))];
      this.getRelatedDimensionValue(relatedDimensionConfig, entityEntryId);
    }
    if (field.onChange) {
      this._formEvent.value = this.formValue;
      // this._formEvent.value[tabKey][cardKey][fieldKey] = event;
      setTimeout(() => {
        field.onChange(this.formEvent);
      }, 0);
    }
  }

  onUnSelectAutoCompleteMulti(
    event,
    tabKey: string,
    cardKey: string,
    fieldKey: string
  ) {
    const field = this.getField(tabKey, cardKey, fieldKey);
    if (field.onChange) {
      this._formEvent.value = this.formValue;
      // this._formEvent.value[tabKey][cardKey][fieldKey] = event;
      field.onChange(this.formEvent);
    }
  }

  onClearAutoComplete(
    event,
    tabKey: string,
    cardKey: string,
    fieldKey: string
  ) {
    const field = this.getField(tabKey, cardKey, fieldKey);
    if (field.onChange) {
      this._formEvent.value = this.formValue;
      this._formEvent.value[tabKey][cardKey][fieldKey] = null;
      setTimeout(() => {
        field.onChange(this.formEvent);
      });
    }
  }
  handlePageSetup() {
    if (this.config.createPageKey && this.mode === this.singlePageMode.Create) {
      this.getParameterConfigs(this.config.createPageKey);
    } else if (
      this.config.updatePageKey &&
      this.mode === this.singlePageMode.Update
    ) {
      this.getParameterConfigs(this.config.updatePageKey);
    }
  }

  lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }
  assignPageSetupDefaultValues() {
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        const tab = this.tabs[tabKey];
        // tslint:disable-next-line:forin
        for (const cardKey in tab.cards) {
          if (tab.cards.hasOwnProperty(cardKey)) {
            const card = tab.cards[cardKey];
            const formGroup = this.form.get(`${tabKey}.${cardKey}`);
            if (formGroup) {
              for (const config in this.parametersConfiguration) {
                if (this.parametersConfiguration.hasOwnProperty(config)) {
                  const field = this.parametersConfiguration[config];
                  let fieldKey = this.lowerFirstLetter(field.fieldKey);
                  let cardField = card.fields[fieldKey];
                  if (!cardField) {
                    fieldKey = this.lowerFirstLetter(field.fieldKey + 'Id');
                    cardField = card.fields[fieldKey];
                  }
                  if (!cardField) {
                    fieldKey = this.lowerFirstLetter(
                      field.fieldKey.slice(0, field.fieldKey.length - 2)
                    );
                    cardField = card.fields[fieldKey];
                  }

                  if (field && formGroup) {
                    const formControl = formGroup.get(fieldKey);
                    if (formControl) {
                      if (field.required) {
                        cardField.validators = cardField.validators || [];
                        cardField.validators.push({
                          validator: Validators.required,
                        });
                        formControl.setValidators(
                          this.transformValidatorsToArr(cardField.validators)
                        );
                      }
                      if (field.fieldMode === FieldModeEnum.disabled) {
                        formControl.disable();
                      }
                      if (
                        field.defValue &&
                        this.mode !== SinglePageMode.Update &&
                        this.mode !== SinglePageMode.Clone
                      ) {
                        if (field.fieldType === FieldTypeEnum.text) {
                          formControl.setValue(field.defValue);
                        } else if (field.fieldType === FieldTypeEnum.number) {
                          formControl.setValue(field.defValue);
                          // tslint:disable-next-line:max-line-length
                        } else if (
                          field.fieldType === FieldTypeEnum.time &&
                          field.defValue &&
                          Object.prototype.toString.call(
                            new Date(field.defValue)
                          ) === '[object Date]'
                        ) {
                          formControl.setValue(new Date(field.defValue));
                        } else if (
                          field.fieldType === FieldTypeEnum.AutoComplete
                        ) {
                          formControl.setValue(JSON.parse(field.defValue));
                        } else if (
                          field.fieldType === FieldTypeEnum.DropDownList
                        ) {
                          // tslint:disable-next-line:max-line-length
                          formControl.setValue(
                            this.handleDefValueForDropDownList(
                              tabKey,
                              cardKey,
                              this.lowerFirstLetter(field.fieldKey),
                              field.defValue
                            )
                          );
                        } else if (field.fieldType === FieldTypeEnum.boolean) {
                          formControl.setValue(field.defValue);
                        }
                      }
                      if (field.isHidden && cardField) {
                        this.hideField(tabKey, cardKey, fieldKey);
                      }
                      // const cardField = card.fields[this.lowerFirstLetter(field.fieldKey)] ||
                      //   card.fields[this.lowerFirstLetter(field.fieldKey + 'Id')] ||
                      //   card.fields[this.lowerFirstLetter(field.fieldKey.slice(0, field.fieldKey.length - 2))];

                      // if (field.isHidden && cardField) {
                      //   this.hideField(tabKey, cardKey, cardField.title);
                      // }
                      if (field.width && cardField) {
                        cardField.colSize = field.width;
                      }
                      let nativeElement;
                      if (field.fieldType === FieldTypeEnum.AutoComplete) {
                        nativeElement = this.elmRef.nativeElement.querySelector(
                          '#' + fieldKey + ' input'
                        );
                      } else {
                        nativeElement = this.elmRef.nativeElement.querySelector(
                          '#' + fieldKey
                        );
                      }
                      if (field.color && nativeElement) {
                        // tslint:disable-next-line:max-line-length
                        this.renderer.setStyle(
                          nativeElement,
                          'color',
                          field.color,
                          RendererStyleFlags2.Important +
                          RendererStyleFlags2.DashCase
                        );
                      }
                      if (field.fontSize && nativeElement) {
                        // tslint:disable-next-line:max-line-length
                        this.renderer.setStyle(
                          nativeElement,
                          'font-size',
                          field.fontSize + 'px',
                          RendererStyleFlags2.Important +
                          RendererStyleFlags2.DashCase
                        );
                      }
                      formControl.updateValueAndValidity();
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  handleDefValueForDropDownList(tabKey, cardKey, fieldKey, value) {
    const card = this.tabs[tabKey].cards[cardKey];
    const field =
      card.fields[fieldKey + 'Id'] ||
      card.fields[fieldKey] ||
      card.fields[fieldKey.slice(0, fieldKey.length - 2)];
    const obj = field.selectFieldProps.selectList.find(
      (i) => i[field.selectFieldProps.key || 'id'] === Number(value)
    );
    return obj;
  }
  getParameterConfigs(pageKey: string) {
    this._parameterSetupService.GetPageSetup(pageKey).subscribe((res: any) => {
      this.parametersConfiguration = res.entities;
      this.assignPageSetupDefaultValues();
    });
  }
  hideTab(tabKey: string) {
    this.tabs[tabKey].hidden = true;
    if (this.tabs[tabKey].type === SinglePageTabType.Form) {
      this.form.get(`${tabKey}`).disable();
    }
  }

  showTab(tabKey: string) {
    this.tabs[tabKey].hidden = false;
    if (
      !this.tabs[tabKey].disabled &&
      this.tabs[tabKey].type === SinglePageTabType.Form
    ) {
      this.form.get(`${tabKey}`).enable();
    }
  }

  disableTab(tabKey: string) {
    this.tabs[tabKey].disabled = true;
    this.form.get(`${tabKey}`).disable();
  }

  enableTab(tabKey: string) {
    this.tabs[tabKey].disabled = false;
    this.form.get(`${tabKey}`).enable();
  }

  hideCard(tabKey: string, cardKey: string) {
    this.tabs[tabKey].cards[cardKey].hidden = true;
    if (this.tabs[tabKey].cards[cardKey].type === SinglePageCardType.Single) {
      this.form.get(`${tabKey}.${cardKey}`).disable();
    }
  }

  showCard(tabKey: string, cardKey: string) {
    this.tabs[tabKey].cards[cardKey].hidden = false;
    if (
      !this.tabs[tabKey].cards[cardKey].disabled &&
      this.tabs[tabKey].cards[cardKey].type === SinglePageCardType.Single
    ) {
      this.form.get(`${tabKey}.${cardKey}`).enable();
    }
  }

  disableCard(tabKey: string, cardKey: string) {
    this.tabs[tabKey].cards[cardKey].disabled = true;
    this.form.get(`${tabKey}.${cardKey}`).disable();
  }

  enableCard(tabKey: string, cardKey: string) {
    this.tabs[tabKey].cards[cardKey].disabled = false;
    this.form.get(`${tabKey}.${cardKey}`).enable();
  }

  hideField(tabKey: string, cardKey: string, fieldKey: string) {
    const field = this.tabs[tabKey].cards[cardKey].fields[fieldKey];
    field.hidden = true;
    if (field.dataType !== SinglePageFieldType.Template) {
      this.form.get(`${tabKey}.${cardKey}.${fieldKey}`).disable();
    }
  }

  showField(tabKey: string, cardKey: string, fieldKey: string) {
    const field = this.tabs[tabKey].cards[cardKey].fields[fieldKey];
    field.hidden = false;
    if (!field.disabled && field.dataType !== SinglePageFieldType.Template) {
      this.form.get(`${tabKey}.${cardKey}.${fieldKey}`).enable();
    }
  }

  disableField(tabKey: string, cardKey: string, fieldKey: string) {
    this.tabs[tabKey].cards[cardKey].fields[fieldKey].disabled = true;
    this.form.get(`${tabKey}.${cardKey}.${fieldKey}`).disable();
  }

  enableField(tabKey: string, cardKey: string, fieldKey: string) {
    this.tabs[tabKey].cards[cardKey].fields[fieldKey].disabled = false;
    this.form.get(`${tabKey}.${cardKey}.${fieldKey}`).enable();
  }

  getEntityCardByCardKey(tabKey: string, cardKey: string) {
    if (this.tabs[tabKey].cards[cardKey].dataKey) {
      return Reflection.GetValueByProbertyName(
        this.config.entity,
        this.tabs[tabKey].cards[cardKey].dataKey
      );
    }

    if (
      this.config &&
      this.config.entity &&
      this.config.entity[tabKey] &&
      this.config.entity[tabKey][cardKey]
    ) {
      return this.config.entity[tabKey][cardKey];
    }
    return null;
  }

  getSelectList(tabKey: string, cardKey: string, fieldKey: string) {
    return this.tabs[tabKey].cards[cardKey].fields[fieldKey].selectFieldProps
      .selectList;
  }

  completeMethod(event, tabKey: string, cardKey: string, fieldKey: string) {
    const selectFieldProps =
      this.tabs[tabKey].cards[cardKey].fields[fieldKey].selectFieldProps;
    return selectFieldProps
      .getSelectList(event.query || '')
      .subscribe((res) => {
        selectFieldProps.selectList = res.entities;
      });
  }

  getField(tabKey: string, cardKey: string, fieldKey: string) {
    return this.tabs[tabKey].cards[cardKey].fields[fieldKey];
  }

  getFieldTitle(tabKey: string, cardKey: string, fieldKey: string) {
    return this.tabs[tabKey].cards[cardKey].fields[fieldKey].title;
  }

  getFieldDataType(tabKey: string, cardKey: string, fieldKey: string) {
    return this.tabs[tabKey].cards[cardKey].fields[fieldKey].dataType;
  }

  getFieldColSize(tabKey: string, cardKey: string, fieldKey: string) {
    return this.tabs[tabKey].cards[cardKey].fields[fieldKey].colSize || 12;
  }

  getSelectFieldsKey(tabKey: string, cardKey: string, fieldKey: string) {
    return (
      this.tabs[tabKey].cards[cardKey].fields[fieldKey].selectFieldProps.key ||
      'id'
    );
  }

  getSelectFieldsValue(tabKey: string, cardKey: string, fieldKey: string) {
    return (
      this.tabs[tabKey].cards[cardKey].fields[fieldKey].selectFieldProps
        .value || 'name'
    );
  }

  transformValidatorsToArr(validators: FieldValidator[] = []): ValidatorFn[] {
    if (validators.length === 0) {
      return [];
    }
    const returnedValdiators = [];
    for (let i = 0; i < validators.length; i++) {
      returnedValdiators.push(validators[i].validator);
    }
    return returnedValdiators;
  }

  isRequired(tabKey: string, cardKey: string, fieldKey: string): boolean {
    const validators =
      this.tabs[tabKey].cards[cardKey].fields[fieldKey].validators;
    if (!validators || validators.length === 0) {
      return false;
    }
    const validator = validators.find(
      (el) => el.validator === Validators.required
    );
    return validator ? true : false;
  }

  getFieldValidators(tabKey: string, cardKey: string, fieldKey: string) {
    return this.tabs[tabKey].cards[cardKey].fields[fieldKey].validators;
  }

  getValidatorMessage(
    tabKey: string,
    cardKey: string,
    fieldKey: string
  ): string {
    let message = null;
    const fieldValue = this.form.get(`${tabKey}.${cardKey}.${fieldKey}`).value;
    const validators = this.getFieldValidators(tabKey, cardKey, fieldKey);
    for (let i = 0; i < validators.length; i++) {
      const control = this.fb.control(fieldValue, validators[i].validator);

      if (control.invalid) {
        if (validators[i].validator === Validators.required) {
          message = validators[i].message || 'helpers.validation.required';
        } else if (validators[i].validator === Validators.email) {
          message = validators[i].message || 'helpers.validation.email';
        } else {
          message = validators[i].message;
        }
        break;
      }
    }
    return message;
  }

  resetPage() {
    this.resetForm();
    this.resetListCardValues();
  }

  resetForm() {
    this.formSubmitted = false;
    this.form.reset();
  }

  getSavedValue() {
    const formValue = this.form.getRawValue();
    const savedEntity = {};

    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        for (const cardKey in this.tabs[tabKey].cards) {
          if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
            const card = { ...this.tabs[tabKey].cards[cardKey] };
            if (card.type === SinglePageCardType.Template) {
              continue;
            }

            if (card.type === SinglePageCardType.Multi) {
              savedEntity[tabKey] = savedEntity[tabKey] || {};
              savedEntity[tabKey][cardKey] = [...card.itemsList];
              continue;
            }

            if (card.type === SinglePageCardType.Single) {
              let savedCard = {};
              for (const fieldKey in card.fields) {
                if (card.fields.hasOwnProperty(fieldKey)) {
                  const field = card.fields[fieldKey];
                  if (field.dataType === SinglePageFieldType.Template) {
                    continue;
                  }

                  if (field.dataType === SinglePageFieldType.AutoComplete) {
                    if (field.autoCompleteMode === AutoCompleteMode.Multi) {
                      if (
                        formValue[tabKey][cardKey][fieldKey] &&
                        formValue[tabKey][cardKey][fieldKey].length > 0
                      ) {
                        savedCard[fieldKey] =
                          formValue[tabKey][cardKey][fieldKey];
                        savedCard[fieldKey].forEach((obj) => {
                          if (obj) {
                            obj[field.selectFieldProps.selectedField.key] =
                              obj[
                              this.getSelectFieldsKey(
                                tabKey,
                                cardKey,
                                fieldKey
                              )
                              ];
                            obj[field.selectFieldProps.selectedField.value] =
                              obj[
                              this.getSelectFieldsValue(
                                tabKey,
                                cardKey,
                                fieldKey
                              )
                              ];
                          }
                        });
                      } else {
                        savedCard[fieldKey] = [];
                      }
                    } else {
                      savedCard[fieldKey] =
                        formValue[tabKey][cardKey][fieldKey];
                      savedCard[field.selectFieldProps.selectedField.key] =
                        !savedCard[fieldKey]
                          ? null
                          : savedCard[fieldKey][
                          this.getSelectFieldsKey(tabKey, cardKey, fieldKey)
                          ];
                      savedCard[field.selectFieldProps.selectedField.value] =
                        !savedCard[fieldKey]
                          ? null
                          : savedCard[fieldKey][
                          this.getSelectFieldsValue(
                            tabKey,
                            cardKey,
                            fieldKey
                          )
                          ];
                    }
                  }

                  if (field.dataType === SinglePageFieldType.DropDown) {
                    savedCard[fieldKey] = formValue[tabKey][cardKey][fieldKey];
                    savedCard[field.selectFieldProps.selectedField.key] =
                      !savedCard[fieldKey]
                        ? null
                        : savedCard[fieldKey][
                        this.getSelectFieldsKey(tabKey, cardKey, fieldKey)
                        ];
                    savedCard[field.selectFieldProps.selectedField.value] =
                      !savedCard[fieldKey]
                        ? null
                        : savedCard[fieldKey][
                        this.getSelectFieldsValue(tabKey, cardKey, fieldKey)
                        ];
                  } else if (field.dataType === SinglePageFieldType.Date) {
                    savedCard[fieldKey] = this.datePipe.transform(
                      formValue[tabKey][cardKey][fieldKey],
                      'MMM d, y, h:mm:ss a'
                    );
                  } else {
                    savedCard[fieldKey] = formValue[tabKey][cardKey][fieldKey];
                  }
                }
              }

              // add all properties in source update entity with fields values changed
              if (
                this.mode === SinglePageMode.Update ||
                this.mode === SinglePageMode.Clone
              ) {
                if (this.getEntityCardByCardKey(tabKey, cardKey)) {
                  savedCard = {
                    ...this.getEntityCardByCardKey(tabKey, cardKey),
                    ...savedCard,
                  };
                }
              }

              savedEntity[tabKey] = savedEntity[tabKey] || {};
              savedEntity[tabKey][cardKey] = savedEntity[tabKey][cardKey] || {};
              savedEntity[tabKey][cardKey] = { ...savedCard };

              // check if card is flatten and spread all its properties
              if (this.tabs[tabKey].cards[cardKey].isFlatten) {
                savedEntity[tabKey] = { ...savedEntity[tabKey], ...savedCard };
              }
            }
          }
        }
      }
    }

    const entityDimensionEntry: EntityDimensionEntry = {} as any;
    if (
      this.dimensionCardComponent &&
      this.dimensionCardComponent.dynamicFormComponent
    ) {
      entityDimensionEntry.entityEntries =
        this.dimensionCardComponent.getDimensionCardValue() || [];
    }
    if (this.inLineDimensionCardsInfo) {
      entityDimensionEntry.lineEntries = this.getInLineDimensions();
    }
    if (entityDimensionEntry) {
      savedEntity['entityDimensions'] = entityDimensionEntry;
    }
    return savedEntity;
  }
  /* #endregion */

  /* #region  List Card Methods */
  handleListCardUpdateValues() {
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        for (const cardKey in this.tabs[tabKey].cards) {
          if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
            const card = this.tabs[tabKey].cards[cardKey];
            if (card.type === SinglePageCardType.Multi) {
              card.itemsList = card.itemsList || [];
              if (
                this.mode === SinglePageMode.Update ||
                this.mode === SinglePageMode.Clone
              ) {
                card.itemsList = this.getEntityCardByCardKey(tabKey, cardKey)
                  ? [...this.getEntityCardByCardKey(tabKey, cardKey)]
                  : [];
              }
            }
          }
        }
      }
    }
  }

  handleListCardDefaults() {
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        for (const cardKey in this.tabs[tabKey].cards) {
          if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
            const card = this.tabs[tabKey].cards[cardKey];
            if (card.type === SinglePageCardType.Multi) {
              card.itemsList = card.itemsList || [];
              card.dataListConfig.title =
                card.dataListConfig.title || card.title;
              const field = card.columns.find((c) => c.field === 'actions');
              if (!field) {
                card.columns.unshift({ field: 'actions', title: '' });
              }
              this.handleListCardTitleAtions(tabKey, cardKey);
              this.handleListCardRowAtions(tabKey, cardKey);
              this.handleLineDimensionRowAction(tabKey, cardKey);
            }
          }
        }
      }
    }
  }

  handleListCardTitleAtions(tabKey: string, cardKey: string) {
    const card = this.tabs[tabKey].cards[cardKey];
    card.titleActions = card.titleActions || {
      type: ActionListType.title,
    };

    card.titleActions.list = card.titleActions.list || [];
    if (card.hasCreateAction !== false) {
      card.titleActions.list.push({
        type: ActionTypeEnum.create,
        title: 'helpers.buttons.createNewButton',
        permissions: PagePermissions.Create,
        hidden: () => card.hasCreateAction === false,
        onClick: (data: ActionData) => {
          this.onClickCreateListCard(
            data.additionalParams.tabKey,
            data.additionalParams.cardKey
          );
          setTimeout(() => {
            if (!this.onBeforeOpenCreatePopup || this.onBeforeOpenCreatePopup(cardKey, this.tabs[tabKey].cards[cardKey]) === true) {
              //  this.dynamicFormComponent.showModal();
              this.onPopUpCreateClick.emit(true);
            }
          }, 0);
        },
      });
    }
  }

  handleListCardRowAtions(tabKey: string, cardKey: string) {
    const card = this.tabs[tabKey].cards[cardKey];
    card.rowActions = card.rowActions || {
      type: ActionListType.onGrid,
    };
    card.rowActions.list = card.rowActions.list || [];

    if (card.hasUpdateAction !== false) {
      card.rowActions.list.push({
        type: ActionTypeEnum.edit,
        title: 'helpers.buttons.editButton',
        permissions: PagePermissions.Update,
        hidden: () => card.hasUpdateAction === false,
        onClick: (data: ActionData) => {
          this.selectedIndexUpdate = data.rowIndex;
          this.onClickUpdateListCard(
            data.additionalParams.tabKey,
            data.additionalParams.cardKey
          );
          setTimeout(() => {
            // this.dynamicFormComponent.showModal();
            this.onPopUpUpdateClick.emit(data);
          }, 0);
        },
      });
    }

    if (card.hasDeleteAction !== false) {
      card.rowActions.list.push({
        type: ActionTypeEnum.delete,
        permissions: PagePermissions.Delete,
        title: 'helpers.buttons.deleteButton',
        hidden: () => card.hasDeleteAction === false,
        onClick: (data: ActionData) => {
          const card =
            this.tabs[data.additionalParams.tabKey].cards[
            data.additionalParams.cardKey
            ];
          const item = card.itemsList[data.rowIndex];
          card.itemsList.splice(data.rowIndex, 1);
          if (this.onDeleteMultiCard) {
            this.onDeleteMultiCard.emit({
              itemsList: card.itemsList,
              item: item,
              index: data.rowIndex,
            });
          }
        },
      });
    }
  }

  handleLineDimensionRowAction(tabKey: string, cardKey: string) {
    const inlineCardKey = tabKey + cardKey;
    const card = this.tabs[tabKey].cards[cardKey];
    card.rowActions.list.push({
      type: ActionTypeEnum.backToList,
      title: 'dimensionCard.dimensionEntries',
      hidden: (params, rowIndex) =>
        !(
          this.inLineDimensionCardsInfo[inlineCardKey] &&
          this.inLineDimensionCardsInfo[inlineCardKey].hasDimensions
        ),
      onClick: (data: ActionData) => {
        const keys = data.additionalParams;
        const inlineKey = keys.tabKey + keys.cardKey;
        const listCard = this.tabs[keys.tabKey].cards[keys.cardKey];
        const dimensionCard = this.inLineDimensionCardsInfo[inlineKey];
        dimensionCard.cardKey = cardKey;
        dimensionCard.entityId = data.params['id'] || 0;
        dimensionCard.rowIndex = data.rowIndex;
        dimensionCard.entityName = listCard.entityName;
        dimensionCard.showCard = true;
        this.inLineDimensionCardsInfo[inlineKey] = null;
        this.inLineDimensionCardsInfo[inlineKey] = dimensionCard;
      }
    });
  }

  AssignDimensionLineConfigurationSearchModel() {
    this.dimensionLineSM = [];
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        for (const cardKey in this.tabs[tabKey].cards) {
          if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
            const card = this.tabs[tabKey].cards[cardKey];
            if (card && card.entityName) {
              const entityIds = [];
              if (card.itemsList && card.itemsList.length > 0) {
                card.itemsList.forEach((item) => {
                  if (
                    item[card.dataListConfig.dataKey || 'id'] !== null &&
                    item[card.dataListConfig.dataKey || 'id'] !== undefined
                  ) {
                    entityIds.push(item[card.dataListConfig.dataKey || 'id']);
                  }
                });
              }
              this.dimensionLineSM.push({
                entityName: card.entityName,
                entityIds: entityIds,
              });
            }
          }
        }
      }
    }
  }

  handleListDimensionCard() {
    this.AssignDimensionLineConfigurationSearchModel();
    // Get configuration and data if there's data
    if (this.config && this.config.entityName) {
      this.showSpinner();
      this.dimensionService
        .getTargetLineDimensionConfigurations(this.dimensionLineSM)
        .subscribe((res) => {
          this.dimensionLineSM = [];
          if (res.success && res.entity && res.entity.entityConfigrations) {
            let inlineCardKey = '';
            // loop on cards to add configuration (hasDimensions, ...) and fields values to the itemlist of the card)
            for (const tabKey in this.tabs) {
              if (this.tabs.hasOwnProperty(tabKey)) {
                for (const cardKey in this.tabs[tabKey].cards) {
                  if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
                    const card = this.tabs[tabKey].cards[cardKey];
                    if (
                      card &&
                      card.type === SinglePageCardType.Multi &&
                      card.entityName
                    ) {
                      inlineCardKey = tabKey + cardKey;
                      this.inLineDimensionCardsInfo[inlineCardKey] = {
                        cardKey: cardKey,
                        tabKey: tabKey,
                        entityName: card.entityName,
                        hasDimensions: res.entity.entityConfigrations[card.entityName] ?
                          res.entity.entityConfigrations[card.entityName].length > 0 : false,
                        showCard: false,
                        inLineDimensions: res.entity.entityConfigrations[card.entityName],
                      };

                      if (card.itemsList && card.itemsList.length > 0) {
                        this.inLineDimensionCardsInfo[
                          inlineCardKey
                        ].inLineDimensions.forEach((lineDimensionField) => {
                          lineDimensionField.dimensionLineFieldValues.forEach(
                            (fieldValue) => {
                              card.itemsList.forEach((item) => {
                                if (item) {
                                  if (
                                    (item[card.dataKey || 'id'] || item['id']) ===
                                    fieldValue.entityId
                                  ) {
                                    if (!isArray(item.lineDimensions)) {
                                      item.lineDimensions = [];
                                    }

                                    (item.lineDimensions as any[]).push({
                                      value: fieldValue.value,
                                      objectValue: fieldValue.objectValue,
                                      columnName:
                                        lineDimensionField.targetColumn,
                                    });
                                  }
                                }
                              });
                            }
                          );
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        });
      this.hideSpinner();
    }
  }

  handleListDimensionCardDefults() {
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        for (const cardKey in this.tabs[tabKey].cards) {
          if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
            const card = this.tabs[tabKey].cards[cardKey];

            if (card.entityName) {
              this.inLineDimensionCardsInfo[tabKey + cardKey] = {
                cardKey: cardKey,
                entityName: card.entityName,
                hasDimensions: false,
                showCard: false,
              };
            }
          }
        }
      }
    }
  }

  getInLineDimensionFieldValues(tabKey: string, cardKey: string, rowIndex?: number) {
    if (tabKey && cardKey && rowIndex >= 0) {
      const cardList = this.tabs[tabKey].cards[cardKey];
      let fieldsValues = null;
      if (
        cardList &&
        cardList.itemsList &&
        cardList.itemsList.length > rowIndex &&
        isArray(cardList.itemsList[rowIndex].lineDimensions)
      ) {
        fieldsValues = [...cardList.itemsList[rowIndex].lineDimensions];
      }
      return fieldsValues;
    }
  }

  getInLineDimensions() {
    let inlineDimensionKey = '';
    const InLineDimensions = {};
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        for (const cardKey in this.tabs[tabKey].cards) {
          if (
            this.tabs[tabKey].cards.hasOwnProperty(cardKey) &&
            this.inLineDimensionCardsInfo[tabKey + cardKey] &&
            this.inLineDimensionCardsInfo[tabKey + cardKey].hasDimensions
          ) {
            inlineDimensionKey = tabKey + cardKey;
            const listCard = this.tabs[tabKey].cards[cardKey];
            if (
              listCard &&
              listCard.type === SinglePageCardType.Multi &&
              listCard.itemsList &&
              listCard.itemsList.length > 0 &&
              listCard.entityName
            ) {
              InLineDimensions[listCard.entityName] = [];
              for (let i = 0; i < listCard.itemsList.length; i++) {
                if (listCard.itemsList[i].lineDimensions) {
                  InLineDimensions[listCard.entityName][i] = [
                    ...listCard.itemsList[i].lineDimensions,
                  ];
                }
              }
            }
          }
        }
      }
    }
    return InLineDimensions;
  }

  onCancelInLineDimensions(event) {
    this.inLineDimensionCardsInfo[event.tabKey + event.cardKey].showCard = false;
  }

  onSaveInLineDimensions(event) {
    const cardList = this.tabs[event.tabKey].cards[event.cardKey];
    if (
      cardList &&
      cardList.itemsList &&
      cardList.itemsList.length > 0 &&
      cardList.itemsList[event.rowIndex] &&
      isArray(event.entityDimensions)
    ) {
      cardList.itemsList[event.rowIndex].lineDimensions =
        event.entityDimensions;
    }
    this.inLineDimensionCardsInfo[event.tabKey + event.cardKey].showCard = false;
  }

  onHasDimensionsHeader(event) {
    if (!event) {
      if (this.tabs['dimensionsUniqueTab']) {
        delete this.tabs['dimensionsUniqueTab'];
      }
    }
  }

  onClickCreateListCard(tabKey: string, cardKey: string) {
    this.visibleListTabKey = tabKey;
    this.visibleListCardKey = cardKey;
    const card = { ...this.tabs[tabKey].cards[cardKey] } as any;
    card.type = DynamicFormCardType.Single;
    card.hideHeader = true;
    card.isFlatten = true;
    card.hidden = false;
    this.listCardDynamicFormModel = {
      title: card.popUpCreateTitle,
      mode: DynamicFormMode.Create,
      pageType: DynamicFormPageType.PopUp,
      cards: { [cardKey]: card },
    };
  }

  onClickUpdateListCard(tabKey: string, cardKey: string) {
    this.visibleListTabKey = tabKey;
    this.visibleListCardKey = cardKey;
    const card = { ...this.tabs[tabKey].cards[cardKey] } as any;
    card.type = DynamicFormCardType.Single;
    card.hideHeader = true;
    card.isFlatten = true;
    card.hidden = false;
    this.listCardDynamicFormModel = {
      title: card.popUpUpdateTitle,
      mode: DynamicFormMode.Update,
      pageType: DynamicFormPageType.PopUp,
      cards: { [cardKey]: card },
      entity: { [cardKey]: { ...card.itemsList[this.selectedIndexUpdate] } },
    };
  }

  onSaveListCard(event, tabKey: string, cardKey: string) {
    const card = this.tabs[tabKey].cards[cardKey];
    if (card) {
      if (card.validateBeforeSave && !card.validateBeforeSave(event, card)) {
        return;
      }
      if (this.selectedIndexUpdate !== null) {
        card.itemsList[this.selectedIndexUpdate] = { ...event };
        this.onSaveMultiCard.emit({
          tabName: tabKey,
          cardName: cardKey,
          rowData: { ...event },
          index: this.selectedIndexUpdate,
          itemsList: card.itemsList,
        });
      } else {
        card.itemsList.push({ ...event });
        this.onSaveMultiCard.emit({
          tabName: tabKey,
          cardName: cardKey,
          rowData: { ...event },
          index: this.selectedIndexUpdate,
          itemsList: card.itemsList,
        });
      }
      this.onCancelListCardPopUp();
    }
  }

  onCancelListCardPopUp() {
    // this.dynamicFormComponent.closeModal();
    this.listCardDynamicFormModel = null;
    this.selectedIndexUpdate = null;
    this.visibleListTabKey = null;
    this.visibleListCardKey = null;
  }

  getSingleAndListCardValues() {
    const formValue = { ...this.form.getRawValue() };
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        for (const cardKey in this.tabs[tabKey].cards) {
          if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
            const card = this.tabs[tabKey].cards[cardKey];
            if (card.type === SinglePageCardType.Multi) {
              formValue[tabKey] = formValue[tabKey] || {};
              formValue[tabKey][cardKey] = card.itemsList;
            }
          }
        }
      }
    }
    return formValue;
  }

  resetListCardValues() {
    for (const tabKey in this.tabs) {
      if (this.tabs.hasOwnProperty(tabKey)) {
        for (const cardKey in this.tabs[tabKey].cards) {
          if (this.tabs[tabKey].cards.hasOwnProperty(cardKey)) {
            const card = this.tabs[tabKey].cards[cardKey];
            if (card.type === SinglePageCardType.Multi) {
              this.tabs[tabKey].cards[cardKey].itemsList = [];
            }
          }
        }
      }
    }
  }
  /* #endregion */

  /* #region  Static Tabs Methods */
  handleActivitiesTab() {
    if (
      (this.mode === SinglePageMode.Update ||
        this.mode === SinglePageMode.Clone) &&
      this.entityInfo &&
      this.entityInfo.hasActivities
    ) {
      if (
        this.checkActionPermission &&
        !this.checkActionPermission(PagePermissions.Update)
      ) {
        return;
      }
      (this.tabs as any)['activityTab'] = {
        title: 'helpers.common.activities',
      };
    }
  }

  handleDimensionsTab() {
    if (this.entityName) {
      (this.tabs as any)['dimensionsUniqueTab'] = {
        title: 'helpers.common.dimensionsTab',
      };
    }
  }

  onHasRelatedEntitiesInHeader(event) {
    this.dimensionRelatedEntitiesInHeader = [...event];
  }

  showCreateActivityAction() {
    return (
      this.mode === SinglePageMode.Update &&
      this.checkActionPermission &&
      this.checkActionPermission(PagePermissions.Update)
    );
    return true;
  }

  handleAttachmentTab() {
    if (
      this.mode === SinglePageMode.Update &&
      this.entityInfo &&
      this.entityInfo.hasAttachments
    ) {
      (this.tabs as any)['attachmentTab'] = {
        title: 'helpers.common.attachment',
      };

      this.filterAttachment = {
        sourceName: this.entityInfo.entityName,
        sourceId: this.id,
      };
    }
  }

  handleRelatedLinks() {
    if (this.entityInfo) {
      this.relatedLinks = this.entityInfo.relatedLinks ? [...this.entityInfo.relatedLinks] : [];
      UrlHelper.getUrlOfRelatedLink(this.entityInfo.relatedLinks);
      this.entityInfo.relatedLinks =
        this.entityInfo.relatedLinks && this.entityInfo.relatedLinks.length > 0
          ? this.entityInfo.relatedLinks.filter((item) => item.url)
          : null;
    }
  }
  /* #endregion */

  /* #region  workflow stages and action entry */
  openActionEntryModal(actionDetails: WorkflowProcessStageAction) {
    this.currentActionEntry = {} as any;
    this.currentActionEntry.title = actionDetails.name;
    this.currentActionEntry.actionDetails = actionDetails;
    this.currentActionEntry.entityEntryIds = [Number(this.id)];
    setTimeout(() => {
      $('#details-action-entry-modal').modal('show');
      $('#details-action-entry-modal').css('display', 'block');
      $('.modal-backdrop').css('display', 'block');
    }, 0);
  }

  closeActionEntryModal() {
    this.currentActionEntry = null;
    $('#details-action-entry-modal').modal('hide');
    $('#details-action-entry-modal').css('display', 'none');
    $('.modal-backdrop').css('display', 'none');
  }

  onActionEnterySaved() {
    this.closeActionEntryModal();
    this.refresh();
  }

  isImage(fileName: string): boolean {
    if (!fileName) {
      return false;
    }
    if (
      fileName.substring(fileName.lastIndexOf('.')).toLowerCase() === '.png' ||
      fileName.substring(fileName.lastIndexOf('.')).toLowerCase() === '.jpg' ||
      fileName.substring(fileName.lastIndexOf('.')).toLowerCase() === '.jpeg'
    ) {
      return true;
    }
    return false;
  }

  getFullPath(imageName: string): string {
    return '/' + imageName;
    //return this.appCofig.apiEndpoint + '/' + imageName;
  }
  validationClick() {
    $('.col-card-body').toggleClass('show');
    $('.moreActions i').toggleClass(' la-angle-up');
  }
  /* #endregion */
}
