import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  Renderer2,
  RendererStyleFlags2
} from '@angular/core';
import {
  DynamicFormModel,
  DynamicFormMode,
  DynamicFormDataType,
  DynamicFormCardType,
  DynamicFormPageType,
  DynamicCardList,
  DynamicFormCard,
  DynamicCardEvents,
  DynamicFieldEvents,
  DynamicFormEvent
} from '../../models/dynamic-form/dynamic-form';
import {
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { FieldValidator } from '../../models/details/details';
import { TranslateService } from '@ngx-translate/core';
import {
  LanguageService,
  Language
} from '../../services/language-service/language.service';
import {
  ActionListType,
  ActionData,
  ActionList,
  ActionIcon
} from '../../models/action/actions';
import { ActionTypeEnum } from '../../enums/action/action-type-tnum';
import { SpinnerDirective } from '../../directives/spinner/spinner.directive';
import { Router } from '@angular/router';
import { isArray } from 'jquery';
import { FieldModeEnum, AutoCompleteMode } from '../../enums/enums';
import { ParameterConfiguration, FieldTypeEnum } from '../../helpers/parameter-validation-helper';
import { RelatedEntityDimension, DimensionLineEntitySM, InLineDimensionCardDetails, EntityDimensionEntry, DimensionLineFieldConfigurationVM } from '../../models/dimesnion/dimension';
import { AlertsService } from '../../services/alert/alerts.service';
import { DimensionService } from '../../services/dimension/dimension.service';
import { PageSetupService } from '../../services/field-management/page-setup.service';
import { DimensionCardComponent } from '../dimension-card/dimension-card.component';
import { GeneralSearchComponent } from '../general-search/general-search.component';
import { environment } from 'src/environments/environment';
import { ViewTypes } from '../../models/data-list/data-list';
import { CommonUrls } from '../../models/common-urls';
import { PagePermissions } from 'src/app/modules/auth/models/page-permissions';
import { MenuRolePermissionEnum } from 'src/app/modules/auth/models/role-permissions';
declare let $: any;

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, AfterViewInit {
  /* #region  Properties & Fields */
  private _model: DynamicFormModel;
  form: FormGroup;
  formSubmitted: boolean;
  private _formEvent: DynamicFormEvent;
  savedEntity: { [key: string]: any };
  listCardFormModels: { [key: string]: DynamicFormModel };
  visibleListCardKey: string;
  selectedIndexUpdate: number;
  parametersConfiguration: ParameterConfiguration[];
  selectedIndexClone: number;
  changeLang: Language;
  disableSaveButton: boolean;
  mainActions: ActionList;
  dimensionRelatedEntitiesInHeader: RelatedEntityDimension[];
  dimensionLineSM: DimensionLineEntitySM[] = [];
  inLineDimensionCardsInfo: { [cardName: string]: InLineDimensionCardDetails } =
    {};
  generalSearchAction: ActionList;
  generalSearchSelectedCardKey: string;
  generalSearchSelectedFieldKey: string;

  @ViewChild('modalTemplateRef', { static: false })
  modalTemplateRef: ElementRef;
  @ViewChild(DynamicFormComponent, { static: false })
  dynamicFormComponent: DynamicFormComponent;
  @ViewChild(SpinnerDirective, { static: false })
  spinnerDirective: SpinnerDirective;
  @ViewChild('dimensionCard', { static: false })
  dimensionCardComponent: DimensionCardComponent;
  @ViewChild(GeneralSearchComponent, { static: false })
  generalSearchComponent: GeneralSearchComponent;

  get model(): DynamicFormModel {
    return this._model;
  }

  get dataTypes() {
    return DynamicFormDataType;
  }

  get cardTypes() {
    return DynamicFormCardType;
  }

  get pageTypes() {
    return DynamicFormPageType;
  }

  get formValue() {
    return { ...this.form.getRawValue(), ...this.getListCardValues() };
  }

  get formEvent() {
    this._formEvent.component = this;
    this._formEvent.form = this.form;
    this._formEvent.value = this.formValue;
    this._formEvent.cards = this.model.cards;
    return this._formEvent;
  }

  get autoCompleteDelay() {
    return environment.autoCompleteDelay;
  }

  /* #endregion */

  /* #region  Parameters */
  @Input('model') set dynamicFormModel(value: DynamicFormModel) {
    if (value) {
      this._model = { ...value };
      if (this._model.mode === null || this._model.mode === undefined) {
        this.model.mode = DynamicFormMode.Create;
      }
    }
  }
  @Input('enableDateTransformFormat') enableDateTransformFormat: boolean;
  @Input('hasSaveBtn') hasSaveBtn = true;

  @Output('onSave') onSave = new EventEmitter<any>();
  @Output('onCancel') onCancel = new EventEmitter<boolean>();
  @Output('onSubmit') onSubmit = new EventEmitter<boolean>();
  @Output('onGetEntityComplete') onGetEntityComplete = new EventEmitter<any>();
  @Output('onDelete') onDelete = new EventEmitter<boolean>();
  @Output('onSaveMultiCard') onSaveMultiCard = new EventEmitter<any>();
  @Output('onPopUpCreateClick') onPopUpCreateClick =
    new EventEmitter<boolean>();
  @Output('onPopUpUpdateClick') onPopUpUpdateClick = new EventEmitter<any>();

  @Input('onBeforeOpenCreatePopup') onBeforeOpenCreatePopup: (cardKey: string, listCard) => boolean;
  @Input('checkActionPermission') checkActionPermission?: (actionType: ActionTypeEnum | ActionIcon | MenuRolePermissionEnum[]) => boolean;
  /* #endregion */

  /* #region  Constractor */
  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private translate: TranslateService,
    private _parameterSetupService: PageSetupService,
    private _language: LanguageService,
    private renderer: Renderer2,
    private elmRef: ElementRef,
    private dimensionService: DimensionService,
    private alertsService: AlertsService,
    private router: Router,
    private location: Location
  ) { }
  /* #endregion */

  /* #region  Events */
  ngOnInit() {
    this._language.LangChanged.subscribe((value) => {
      this.changeLang = value;
      this.translate.use(this.changeLang);
    });
    if (this.checkPermissions()) {
      this.handleDefaults();
      this.initDynamicForm();
      this.handleMainActions();
      this.handleListCardModels();
      this.hanldeOnChangeEvents();
      this.handleGeneralSearcAction();
      this.handlePageSetup();
    } else {
      if (CommonUrls && CommonUrls.notAuthorized) {
        this.router.navigate([CommonUrls.notAuthorized], { replaceUrl: true });
      } else {
        this.location.back();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.checkPermissions() === false) {
        if (CommonUrls && CommonUrls.notAuthorized) {
          this.router.navigate([CommonUrls.notAuthorized], { replaceUrl: true });
        } else {
          this.location.back();
        }
      }
    }, 1000);

  }

  onSelectFile(event, cardKey: string, fieldKey: string) {
    if (event.files && event.files.length > 0) {
      this.form.get(`${cardKey}.${fieldKey}`).setValue(event.files[0]);
    }
  }

  onRemoveFile(file, cardKey: string, fieldKey: string) {
    this.form.get(`${cardKey}.${fieldKey}`).setValue(null);
  }

  onCancelGeneralSearch() {
    this.generalSearchSelectedCardKey = null;
    this.generalSearchSelectedFieldKey = null;
  }

  onSaveGeneralSearch(data) {
    if (data) {
      const field =
        this.model.cards[this.generalSearchSelectedCardKey].fields[
        this.generalSearchSelectedFieldKey
        ];
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
        this.generalSearchSelectedCardKey,
        this.generalSearchSelectedFieldKey
      );
    } else {
      this.onClearAutoComplete(
        data,
        this.generalSearchSelectedCardKey,
        this.generalSearchSelectedFieldKey
      );
    }
    this.form
      .get(
        `${this.generalSearchSelectedCardKey}.${this.generalSearchSelectedFieldKey}`
      )
      .setValue(data);
    this.form
      .get(
        `${this.generalSearchSelectedCardKey}.${this.generalSearchSelectedFieldKey}`
      )
      .updateValueAndValidity();
    this.onCancelGeneralSearch();
  }
  /* #endregion */

  /* #region  Methods */
  getFormCard(card: DynamicFormCard | DynamicCardList) {
    return card as DynamicFormCard;
  }

  getListCard(card: DynamicFormCard | DynamicCardList) {
    return card as DynamicCardList;
  }

  hideAction = (action) => {
    if (this.checkActionPermission && action) {
      return !this.checkActionPermission(action);
    } else {
      return false;
    }
  }
  checkPermissions() {
    if (this.checkActionPermission) {
      if (this.model.mode === DynamicFormMode.Create || this.model.mode === DynamicFormMode.Clone) {
        return this.checkActionPermission(PagePermissions.Create);
      }
      // else if (this.model.mode === DynamicFormMode.Update) {
      //   return this.checkActionPermission(PagePermissions.Update);
      // }
    }
    return true;
  }

  handleDefaults() {
    if (
      this.enableDateTransformFormat === null ||
      this.enableDateTransformFormat === undefined
    ) {
      this.enableDateTransformFormat = true;
    }

    for (const cardKey in this.model.cards) {
      if (this.model.cards.hasOwnProperty(cardKey)) {
        const card = this.model.cards[cardKey];

        if (card.type === DynamicFormCardType.Single) {
          // if (this.getFormCard(card).hideHeader !== true) {
          //   this.hanldeCardActions(card);
          // }
        }

        if (
          card.type === DynamicFormCardType.Multi &&
          this.getListCard(card).dataListConfig &&
          this.getListCard(card).columns &&
          this.getListCard(card).columns.length > 0
        ) {
          const listCard = this.getListCard(card);
          listCard.dataListConfig.title =
            listCard.dataListConfig.title || listCard.title;
          listCard.itemsList = listCard.itemsList || [];
          listCard.dataListConfig.viewType = listCard.dataListConfig.viewType || ViewTypes.Grid;
          const field = listCard.columns.find((c) => c.field === 'actions');
          if (!field) {
            listCard.columns.unshift({ field: 'actions', title: '' });
          }
          this.handleListCardTitleAtions(listCard);
          this.handleListCardRowAtions(listCard);
          this.handleListDimensionCardDefults(cardKey, listCard);
        }
      }
    }
    this.listCardFormModels = {};
    this._formEvent = {};
    this.savedEntity = {};
    this.selectedIndexUpdate = null;
    this.visibleListCardKey = null;
  }
  onMultiCardRowSelected(event, card: DynamicCardList) {
    if (card && card.onRowSelected) {
      card.onRowSelected(event);
    }
  }
  onMultiCardRowUnselected(event, card: DynamicCardList) {
    if (card && card.onRowUnselected) {
      card.onRowUnselected(event);
    }
  }
  onMultiCardSelectAllToggle(event, card: DynamicCardList) {
    if (card && card.onSelectAllToggle) {
      card.onSelectAllToggle(event);
    }
  }
  handleGeneralSearcAction() {
    this.generalSearchAction = {
      type: ActionListType.title,
      list: [
        {
          type: ActionTypeEnum.search,
          title: 'generalSearch.title',
          hidden: (params) =>
            (!params.field.generalSearchPageListTemplate &&
              !params.field.generalSearchDataListConfig &&
              !params.field.generalSearchColumns) ||
            this.isFieldDisabled(params.cardKey, params.fieldKey),
          onClick: (data: ActionData) => {
            this.generalSearchSelectedCardKey = data.params['cardKey'];
            this.generalSearchSelectedFieldKey = data.params['fieldKey'];
          },
        },
      ],
    };
  }

  isFieldDisabled(cardKey: string, fieldKey: string) {
    return (
      this.form &&
      this.form.get(`${cardKey}`) &&
      this.form.get(`${cardKey}.${fieldKey}`) &&
      this.form.get(`${cardKey}.${fieldKey}`).disabled
    );
  }

  handleMainActions() {
    this.mainActions = {
      type: ActionListType.title,
      list: [
        {
          type: ActionTypeEnum.erase,
          title: 'helpers.common.reset',
          hidden: () => true,
          onClick: () => {
            for (const cardKey in this.model.cards) {
              if (this.model.cards.hasOwnProperty(cardKey)) {
                const card = this.model.cards[cardKey];
                if (card.type === DynamicFormCardType.Single) {
                  this.resetCard(cardKey);
                } else if (card.type === DynamicFormCardType.Multi) {
                  this.resetListCard(cardKey);
                }
              }
            }
          },
        },
      ],
    };
  }

  hanldeCardActions(card: DynamicFormCard) {
    card.titleActions = card.titleActions || {
      type: ActionListType.title,
      list: [],
    };
    if (card.hasToggleAction !== false) {
      card.titleActions.list.push({
        type: ActionTypeEnum.toggle,
        title: 'helpers.common.toggle',
        hidden: () => card.hasToggleAction === false,
        onClick: (data: ActionData) => {
          $(data.event.srcElement)
            .closest('.form-card')
            .find('.form-card-body')
            .toggleClass('show');
          if (data.actionNativeEl) {
            $(data.actionNativeEl).find('.toggle i').toggleClass('la-angle-up');
          }
        },
      });
    }

    if (card.hasFullScreenAction !== false) {
      card.titleActions.list.push({
        type: ActionTypeEnum.fullscreen,
        title: 'helpers.common.fullScreen',
        hidden: () => card.hasFullScreenAction === false,
        onClick: (data: ActionData) => {
          $(data.event.srcElement)
            .closest('.form-card')
            .toggleClass('full-screen');
          // .find(".form-card-body")

          if (data.actionNativeEl) {
            $(data.actionNativeEl)
              .find('.fullscreen i')
              .toggleClass('la-compress');
          }
        },
      });
    }
    if (card.hasResetAction !== false) {
      card.titleActions.list.push({
        type: ActionTypeEnum.erase,
        title: 'helpers.common.reset',
        hidden: () => card.hasResetAction === false,
        onClick: (data: ActionData) => this.resetCard(data.params as any),
      });
    }
  }

  resetCard(cardKey: string) {
    if (!this.model.cards[cardKey]['hasResetAction']) {
      return;
    }
    if (this.model.mode === DynamicFormMode.Create) {
      this.form.get(cardKey).reset();
    } else {
      for (const fieldKey in this.model.cards[cardKey].fields) {
        if (this.model.cards[cardKey].fields.hasOwnProperty(fieldKey)) {
          const field = this.model.cards[cardKey].fields[fieldKey];

          if (field.dataType === DynamicFormDataType.AutoComplete) {
            this.form
              .get(`${cardKey}.${fieldKey}`)
              .setValue(
                this.getAutoCompleteSelectedField(cardKey, fieldKey) || null
              );
          } else if (field.dataType === DynamicFormDataType.DropDown) {
            this.form
              .get(`${cardKey}.${fieldKey}`)
              .setValue(
                this.getDropDownSelectedField(cardKey, fieldKey) || null
              );
          } else if (field.dataType !== DynamicFormDataType.Template) {
            this.form
              .get(`${cardKey}.${fieldKey}`)
              .setValue(this.getEntityCardByCardKey(cardKey)[fieldKey] || null);
          }
        }
      }
    }
  }

  resetListCard(cardKey: string) {
    if (this.model.mode === DynamicFormMode.Create) {
      this.getListCard(this.model.cards[cardKey]).itemsList = [];
    } else {
      const oldListValue = this.getEntityCardByCardKey(cardKey);
      this.getListCard(this.model.cards[cardKey]).itemsList = oldListValue;
    }
  }

  handleListCardTitleAtions(card: DynamicCardList) {
    card.titleActions = card.titleActions || {
      type: ActionListType.title,
    };

    card.titleActions.list = card.titleActions.list || [];
    if (card.hasCreateAction !== false) {
      card.titleActions.list.push({
        type: ActionTypeEnum.create,
        title: 'helpers.buttons.createNewButton',
        hidden: () => card.hasCreateAction === false,
        onClick: (data: ActionData) => {
          const cardKey = data.additionalParams;
          this.visibleListCardKey = cardKey;
          this.listCardFormModels[cardKey].mode = DynamicFormMode.Create;
          const listCard = { ...this.getListCard(this.model.cards[cardKey]) };
          this.listCardFormModels[cardKey].title = listCard.popUpCreateTitle;
          setTimeout(() => {
            if (!this.onBeforeOpenCreatePopup || this.onBeforeOpenCreatePopup(cardKey, listCard) === true) {
              this.dynamicFormComponent.showModal();
              this.onPopUpCreateClick.emit(true);
            }
          }, 0);
        },
      });
    }

    card.titleActions.list.push({
      type: ActionTypeEnum.erase,
      title: 'helpers.common.reset',
      hidden: () => (card as DynamicFormCard).hasResetAction === false,
      onClick: (data) => this.resetListCard(data.additionalParams),
    });
  }

  handleListCardRowAtions(card: DynamicCardList) {
    card.rowActions = card.rowActions || {
      type: ActionListType.onGrid,
    };
    card.rowActions.list = card.rowActions.list || [];

    if (card.hasUpdateAction !== false) {
      card.rowActions.list.push({
        type: ActionTypeEnum.edit,
        title: 'helpers.buttons.editButton',
        hidden: () => card.hasUpdateAction === false,
        onClick: (data: ActionData) => {
          const cardKey = data.additionalParams;
          this.visibleListCardKey = cardKey;
          this.selectedIndexUpdate = data.rowIndex;
          const model = this.listCardFormModels[cardKey];
          model.mode = DynamicFormMode.Update;
          const listCard = { ...this.getListCard(this.model.cards[cardKey]) };
          this.listCardFormModels[cardKey].title = listCard.popUpUpdateTitle;
          model.entity = {
            [cardKey]: { ...listCard.itemsList[this.selectedIndexUpdate] },
          };
          setTimeout(() => {
            this.dynamicFormComponent.showModal();
            this.onPopUpUpdateClick.emit(data);
          }, 0);
        },
      });
    }

    if (card.hasDeleteAction !== false) {
      card.rowActions.list.push({
        type: ActionTypeEnum.delete,
        title: 'helpers.buttons.deleteButton',
        hidden: () => card.hasDeleteAction === false,
        onClick: (data: ActionData) => {
          const card = this.model.cards[data.additionalParams];
          this.getListCard(card).itemsList.splice(data.rowIndex, 1);
          this.onDelete.emit(true);
        },
      });
    }
    card.hasCloneAction = false;
  }

  AssignDimensionLineConfigurationSearchModel() {
    this.dimensionLineSM = [];
    for (const cardKey in this.model.cards) {
      if (this.model.cards.hasOwnProperty(cardKey)) {
        const card = this.getListCard(this.model.cards[cardKey]);
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

  handleListDimensionCard() {
    this.AssignDimensionLineConfigurationSearchModel();
    // Get configuration and data if there's data
    if (this.model.entityName) {
      this.showSpinner();
      this.dimensionService
        .getTargetLineDimensionConfigurations(this.dimensionLineSM)
        .subscribe((res) => {
          this.dimensionLineSM = [];
          if (res.success && res.entity && res.entity.entityConfigrations) {
            // loop on cards to add configuration (hasDimensions, ...) and fields values to the itemlist of the card)
            for (const cardKey in this.model.cards) {
              if (this.model.cards.hasOwnProperty(cardKey)) {
                const card = this.getListCard(this.model.cards[cardKey]);
                if (
                  card &&
                  card.type === DynamicFormCardType.Multi &&
                  card.entityName
                ) {
                  this.inLineDimensionCardsInfo[cardKey] = {
                    cardKey: cardKey,
                    entityName: card.entityName,
                    hasDimensions: res.entity.entityConfigrations[card.entityName] ?
                      res.entity.entityConfigrations[card.entityName].length > 0 : false,
                    showCard: false,
                    inLineDimensions:
                      res.entity.entityConfigrations[card.entityName],
                  };

                  if (card.itemsList && card.itemsList.length > 0) {
                    this.inLineDimensionCardsInfo[
                      cardKey
                    ].inLineDimensions.forEach((lineDimensionField) => {
                      lineDimensionField.dimensionLineFieldValues.forEach(
                        (fieldValue) => {
                          card.itemsList.forEach((item) => {
                            if (item) {
                              if (
                                item[card.dataKey || 'id'] ===
                                fieldValue.entityId
                              ) {
                                if (!isArray(item.lineDimensions)) {
                                  item.lineDimensions = [];
                                }
                                (item.lineDimensions as any[]).push({
                                  value: fieldValue.value,
                                  objectValue: fieldValue.objectValue,
                                  columnName: lineDimensionField.targetColumn,
                                });
                              }
                            }
                          });
                        }
                      );
                    });
                  }

                  card.rowActions.list.push({
                    type: ActionTypeEnum.backToList,
                    title: 'dimensionCard.dimensionEntries',
                    hidden: () =>
                      !(
                        this.inLineDimensionCardsInfo[cardKey] &&
                        this.inLineDimensionCardsInfo[cardKey].hasDimensions
                      ),
                    onClick: (data: ActionData) => {
                      const cardKey = data.additionalParams;
                      const listCard = this.getListCard(
                        this._model.cards[cardKey]
                      );
                      const dimensionCard =
                        this.inLineDimensionCardsInfo[cardKey];
                      dimensionCard.cardKey = cardKey;
                      dimensionCard.entityId = data.params['id'] || 0;
                      dimensionCard.rowIndex = data.rowIndex;
                      dimensionCard.entityName = listCard.entityName;
                      dimensionCard.showCard = true;
                      this.inLineDimensionCardsInfo[cardKey] = null;
                      this.inLineDimensionCardsInfo[cardKey] = dimensionCard;
                    },
                  });
                }
              }
            }
          }
          this.hideSpinner();
        });
    }
  }

  handleListDimensionCardDefults(cardKey: string, card: DynamicCardList) {
    if (card.entityName) {
      this.inLineDimensionCardsInfo[cardKey] = {
        cardKey: cardKey,
        entityName: card.entityName,
        hasDimensions: false,
        showCard: false,
      };
    }
  }

  getInLineDimensionFieldValues(cardKey: string, rowIndex?: number) {
    if (cardKey && rowIndex >= 0) {
      const cardList = this.getListCard(this.model.cards[cardKey]);
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
    const InLineDimensions = {};
    for (const cardKey in this.model.cards) {
      if (
        this.model.cards.hasOwnProperty(cardKey) &&
        this.inLineDimensionCardsInfo[cardKey] &&
        this.inLineDimensionCardsInfo[cardKey].hasDimensions
      ) {
        const listCard = this.getListCard(this.model.cards[cardKey]);
        if (
          listCard &&
          listCard.type === DynamicFormCardType.Multi &&
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
    return InLineDimensions;
  }

  onHasRelatedEntitiesInHeader(event) {
    this.dimensionRelatedEntitiesInHeader = [...event];
  }

  onCancelInLineDimensions(event) {
    this.inLineDimensionCardsInfo[event.cardKey].showCard = false;
  }

  onSaveInLineDimensions(event) {
    const cardList = this.getListCard(this.model.cards[event.cardKey]);
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
    this.inLineDimensionCardsInfo[event.cardKey].showCard = false;
  }

  initDynamicForm() {
    this.initForm();
    this.buildForm();
  }
  handlePageSetup() {
    if (
      this.model.createPageKey &&
      this.model.mode === DynamicFormMode.Create
    ) {
      this.getParameterConfigs(this.model.createPageKey);
    } else if (
      this.model.updatePageKey &&
      this.model.mode === DynamicFormMode.Update
    ) {
      this.getParameterConfigs(this.model.updatePageKey);
    }
  }
  lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }
  assignPageSetupDefaultValues() {
    // tslint:disable-next-line:forin
    for (const cardKey in this.model.cards) {
      if (this.model.cards.hasOwnProperty(cardKey)) {
        const card = this.model.cards[cardKey];
        const formGroup = this.form.get(cardKey);
        for (const config in this.parametersConfiguration) {
          if (this.parametersConfiguration.hasOwnProperty(config)) {
            const field = this.parametersConfiguration[config];
            if (field && formGroup) {
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

              const formControl = formGroup.get(fieldKey);
              if (formControl) {
                if (field.required) {
                  cardField.validators = cardField.validators || [];
                  cardField.validators.push({ validator: Validators.required });
                  formControl.setValidators(
                    this.transformValidatorsToArr(cardField.validators)
                  );
                }
                if (field.fieldMode === FieldModeEnum.disabled) {
                  formControl.disable();
                }
                if (
                  field.defValue &&
                  this.model.mode !== DynamicFormMode.Update &&
                  this.model.mode !== DynamicFormMode.Clone
                ) {
                  if (field.fieldType === FieldTypeEnum.text) {
                    formControl.setValue(field.defValue);
                  } else if (field.fieldType === FieldTypeEnum.number) {
                    formControl.setValue(field.defValue);
                  } else if (
                    field.fieldType === FieldTypeEnum.time &&
                    field.defValue &&
                    Object.prototype.toString.call(new Date(field.defValue)) ===
                    '[object Date]'
                  ) {
                    formControl.setValue(new Date(field.defValue));
                  } else if (field.fieldType === FieldTypeEnum.AutoComplete) {
                    formControl.setValue(JSON.parse(field.defValue));
                  } else if (field.fieldType === FieldTypeEnum.DropDownList) {
                    formControl.setValue(
                      this.handleDefValueForDropDownList(
                        cardKey,
                        fieldKey,
                        field.defValue
                      )
                    );
                  } else if (field.fieldType === FieldTypeEnum.boolean) {
                    formControl.setValue(field.defValue);
                  }
                }

                if (field.isHidden && cardField) {
                  this.hideField(cardKey, fieldKey);
                }
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
                  this.renderer.setStyle(
                    nativeElement,
                    'color',
                    field.color,
                    RendererStyleFlags2.Important + RendererStyleFlags2.DashCase
                  );
                }
                if (field.fontSize && nativeElement) {
                  this.renderer.setStyle(
                    nativeElement,
                    'font-size',
                    field.fontSize + 'px',
                    RendererStyleFlags2.Important + RendererStyleFlags2.DashCase
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

  handleDefValueForDropDownList(cardKey, fieldKey, value) {
    const field = this.model.cards[cardKey].fields[fieldKey];
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
  buildForm() {
    if (this.model.mode === DynamicFormMode.Create) {
      this.handleCreateFields();
      this.handleListDimensionCard();
    } else if (
      this.model.mode === DynamicFormMode.Update ||
      this.model.mode === DynamicFormMode.Clone
    ) {
      if (this.model.entity) {
        this.handleUpdateFields();
        this.handleListDimensionCard();
      }
      if (this.model.getEntity) {
        this.showSpinner();
        this.handleCreateFields(false);
        this.model.getEntity().subscribe(
          (res) => {
            if (res.success) {
              this.model.entity = { ...res.entity };
              this.onGetEntityComplete.emit({ ...this.model.entity });
              this.resetForm();
              this.initForm();
              this.handleUpdateFields();
              this.hanldeOnChangeEvents();
              this.handleListCardModels();
              this.handleListDimensionCard();
            }
            this.hideSpinner();
          },
          () => this.hideSpinner(),
          () => this.hideSpinner()
        );
      }
    }
  }
  initForm() {
    this.form = this.fb.group({});
  }

  handleCreateFields(getData = true) {
    for (const cardKey in this.model.cards) {
      if (this.model.cards.hasOwnProperty(cardKey)) {
        const card = this.model.cards[cardKey];
        if (card.type === DynamicFormCardType.Single) {
          const cardForm = this.fb.group({});
          this.form.addControl(cardKey, cardForm);

          // iterate through card fields
          for (const fieldKey in card.fields) {
            if (card.fields.hasOwnProperty(fieldKey)) {
              const field = card.fields[fieldKey];
              if (field.dataType === DynamicFormDataType.Template) {
                continue;
              }
              let fieldControlValue = null;
              if (field.dataType === DynamicFormDataType.RadioButton) {
                if (field.selectOptions.list && field.selectOptions.selected) {
                  fieldControlValue = field.selectOptions.selected || null;
                }
                if (field.selectOptions.getSelectOptions) {
                  this.handleSelectOptionsGetData(cardKey, fieldKey);
                }
              } else if (field.dataType === DynamicFormDataType.CheckBox) {
                if (field.selectOptions.binary) {
                  fieldControlValue = field.selectOptions.selected || false;
                } else {
                  fieldControlValue = field.selectOptions.selected || [];
                  if (field.selectOptions.getSelectOptions) {
                    this.handleSelectOptionsGetData(cardKey, fieldKey);
                  }
                }
              }
              const formControl = this.fb.control({
                value: fieldControlValue,
                disabled:
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
              if (getData && field.dataType === DynamicFormDataType.DropDown) {
                this.handleSelectFieldsGetData(cardKey, fieldKey);
              }
            }
          }
        }
      }
    }
  }

  handleUpdateFields() {
    for (const cardKey in this.model.cards) {
      if (this.model.cards.hasOwnProperty(cardKey)) {
        const card = this.model.cards[cardKey];
        if (card.type === DynamicFormCardType.Single) {
          const cardForm = this.fb.group({});
          this.form.addControl(cardKey, cardForm);
          const entityCard = this.getEntityCardByCardKey(cardKey);

          // iterate through card fields
          for (const fieldKey in card.fields) {
            if (card.fields.hasOwnProperty(fieldKey)) {
              const field = card.fields[fieldKey];
              if (field.dataType === DynamicFormDataType.Template) {
                continue;
              }

              let fieldControlValue = null;
              if (field.dataType === DynamicFormDataType.AutoComplete) {
                fieldControlValue = this.getAutoCompleteSelectedField(
                  cardKey,
                  fieldKey
                );
              } else if (field.dataType === DynamicFormDataType.RadioButton) {
                fieldControlValue = entityCard[fieldKey] || null;
                if (field.selectOptions.getSelectOptions) {
                  this.handleSelectOptionsGetData(cardKey, fieldKey);
                }
              } else if (field.dataType === DynamicFormDataType.CheckBox) {
                if (field.selectOptions.binary) {
                  fieldControlValue = entityCard[fieldKey] || false;
                } else {
                  fieldControlValue = entityCard[fieldKey] || [];
                  if (field.selectOptions.getSelectOptions) {
                    this.handleSelectOptionsGetData(cardKey, fieldKey);
                  }
                }
              } else if (field.dataType === DynamicFormDataType.Date) {
                fieldControlValue = entityCard[fieldKey]
                  ? new Date(entityCard[fieldKey])
                  : null;
              } else {
                fieldControlValue = entityCard[fieldKey];
              }
              // add field control to form group
              const formControl = this.fb.control({
                value: fieldControlValue,
                disabled:
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

              //  Drop-down data source
              if (field.dataType === DynamicFormDataType.DropDown) {
                this.handleSelectFieldsGetData(cardKey, fieldKey);
              }
            }
          }
        }
      }
    }
  }

  handleSelectFieldsGetData(cardKey: string, fieldKey: string) {
    const field = this.model.cards[cardKey].fields[fieldKey];
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
        this.model.mode === DynamicFormMode.Update ||
        this.model.mode === DynamicFormMode.Clone
      ) {
        this.form
          .get(`${cardKey}.${fieldKey}`)
          .setValue(this.getDropDownSelectedField(cardKey, fieldKey) || null);
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
            this.model.mode === DynamicFormMode.Update ||
            this.model.mode === DynamicFormMode.Clone
          ) {
            this.form
              .get(`${cardKey}.${fieldKey}`)
              .setValue(
                this.getDropDownSelectedField(cardKey, fieldKey) || null
              );
          }
        }
      });
    }
  }

  // for checkbox and radio button
  handleSelectOptionsGetData(cardKey: string, fieldKey: string) {
    const field = this.model.cards[cardKey].fields[fieldKey];
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

  getAutoCompleteSelectedField(cardKey: string, fieldKey: string) {
    const entityCard = this.getEntityCardByCardKey(cardKey);
    const field = this.model.cards[cardKey].fields[fieldKey];
    if (!this.isAutoCompleteModeMulti(cardKey, fieldKey)) {
      const selectedFieldKey =
        entityCard[field.selectFieldProps.selectedField.key];
      const selectedFieldValue =
        entityCard[field.selectFieldProps.selectedField.value];

      return !selectedFieldKey && !selectedFieldValue
        ? null
        : {
          [this.getSelectFieldsKey(cardKey, fieldKey)]: selectedFieldKey,
          [this.getSelectFieldsValue(cardKey, fieldKey)]: selectedFieldValue,
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
              [this.getSelectFieldsKey(cardKey, fieldKey)]: selectedFieldKey,
              [this.getSelectFieldsValue(cardKey, fieldKey)]:
                selectedFieldValue,
            };
        });
      }
    }
    return [];
  }

  getDropDownSelectedField(cardKey: string, fieldKey: string) {
    const entityCard = this.getEntityCardByCardKey(cardKey);
    const field = this.model.cards[cardKey].fields[fieldKey];
    const selectedFieldKey =
      entityCard[field.selectFieldProps.selectedField.key];
    const selectedField = field.selectFieldProps.selectList.find(
      (l) => l[this.getSelectFieldsKey(cardKey, fieldKey)] === selectedFieldKey
    );
    this.form.get(`${cardKey}.${fieldKey}`).setValue(selectedField || null);
    return selectedField;
  }

  handleListCardModels() {
    for (const cardKey in this.model.cards) {
      if (this.model.cards.hasOwnProperty(cardKey)) {
        const card = this.getListCard(this.model.cards[cardKey]);
        if (card.type === DynamicFormCardType.Multi) {
          if (
            this.model.mode === DynamicFormMode.Update ||
            this.model.mode === DynamicFormMode.Clone
          ) {
            card.itemsList = this.getEntityCardByCardKey(cardKey)
              ? [...this.getEntityCardByCardKey(cardKey)]
              : [];
          }
          const formCard = { ...this.getFormCard(card) };
          formCard.type = DynamicFormCardType.Single;
          formCard.dataKey = null;
          formCard.hideHeader = true;
          formCard.isFlatten = true;
          formCard.hidden = false;
          this.listCardFormModels[cardKey] = {
            title: this.getListCard(card).popUpCreateTitle,
            cards: { [cardKey]: { ...formCard } },
            pageType: DynamicFormPageType.PopUp,
            mode: DynamicFormMode.Create,
            createPageKey: this.model.createPageKey,
            updatePageKey: this.model.updatePageKey,
          };
        }
      }
    }
  }

  hanldeOnChangeEvents() {
    const cardsEvents: { [cardName: string]: DynamicCardEvents } = {};
    this._formEvent.cardsEvents = cardsEvents;
    for (const cardKey in this.model.cards) {
      if (this.model.cards.hasOwnProperty(cardKey)) {
        const card = this.model.cards[cardKey];

        cardsEvents[cardKey] = {
          hide: () => this.hideCard(cardKey),
          show: () => this.showCard(cardKey),
        };

        if (card.type !== DynamicFormCardType.Single) {
          continue;
        }
        if (card.onChange) {
          this.cardValueChanges(cardKey);
        }

        const fieldEvents: { [fieldName: string]: DynamicFieldEvents } = {};
        for (const fieldKey in card.fields) {
          if (card.fields.hasOwnProperty(fieldKey)) {
            const field = card.fields[fieldKey];
            fieldEvents[fieldKey] = {
              hide: () => this.hideField(cardKey, fieldKey),
              show: () => this.showField(cardKey, fieldKey),
            };

            if (field.dataType !== DynamicFormDataType.Template) {
              if (
                field.onChange ||
                field.dataType === DynamicFormDataType.DropDown
              ) {
                this.fieldValueChanges(cardKey, fieldKey);
              }
            }
          }
        }
        cardsEvents[cardKey].fieldsEvents = fieldEvents;
      }
    }
  }

  cardValueChanges(cardKey: string) {
    if (!this.form.get(cardKey)) {
      return;
    }
    this.form.get(cardKey).valueChanges.subscribe((value) => {
      this._formEvent.value = this.formValue;
      this._formEvent.value[cardKey] = value;
      this.model.cards[cardKey].onChange(this.formEvent);
    });
  }

  fieldValueChanges(cardKey: string, fieldKey: string) {
    if (!this.form.get(`${cardKey}.${fieldKey}`)) {
      return;
    }
    this.form.get(`${cardKey}.${fieldKey}`).valueChanges.subscribe((value) => {
      const field = this.getField(cardKey, fieldKey);
      const relatedDimensionConfig: RelatedEntityDimension[] = [];
      if (
        field.dataType === DynamicFormDataType.DropDown &&
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
          value[this.lowerFirstLetter(fieldKey.slice(0, fieldKey.length - 2))];
        this.getRelatedDimensionValue(relatedDimensionConfig, entityEntryId);
      }
      if (
        field.dataType !== DynamicFormDataType.AutoComplete &&
        field.onChange
      ) {
        this._formEvent.value = this.formValue;
        this._formEvent.value[cardKey][fieldKey] = value;
        field.onChange(this.formEvent);
      }
    });
  }

  getRelatedDimensionValue(
    relatedDimensionsConfig: RelatedEntityDimension[],
    entityEntryId: number
  ) {
    if (entityEntryId) {
      this.dimensionService
        .getRelatedDimensionValue(
          relatedDimensionsConfig.map((r) => r.dimensionTargetId),
          relatedDimensionsConfig[0].entitiy,
          entityEntryId
        )
        .subscribe((res) => {
          if (res.success && res.entities && res.entities.length > 0) {
            this.dimensionCardComponent.setDimensionHeaderValue(
              relatedDimensionsConfig,
              res.entities
            );
          }
        });
    }
  }

  onSelectAutoComplete(event, cardKey: string, fieldKey: string) {
    const field = this.getField(cardKey, fieldKey);

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
      // this._formEvent.value[cardKey][fieldKey] = event;
      setTimeout(() => {
        field.onChange(this.formEvent);
      }, 0);
    }
  }

  onUnSelectAutoCompleteMulti(event, cardKey: string, fieldKey: string) {
    const field = this.getField(cardKey, fieldKey);
    if (field.onChange) {
      this._formEvent.value = this.formValue;
      // this._formEvent.value[tabKey][cardKey][fieldKey] = event;
      field.onChange(this.formEvent);
    }
  }

  onClearAutoComplete(event, cardKey: string, fieldKey: string) {
    const field = this.getField(cardKey, fieldKey);
    if (field.onChange) {
      this._formEvent.value = this.formValue;
      this._formEvent.value[cardKey][fieldKey] = null;
      setTimeout(() => {
        field.onChange(this.formEvent);
      });
    }
  }

  isAutoCompleteModeMulti(cardKey: string, fieldKey: string) {
    const field = this.getField(cardKey, fieldKey);
    if (field && field.autoCompleteMode === AutoCompleteMode.Multi) {
      return true;
    }
    return false;
  }

  hideCard(cardKey: string) {
    this.model.cards[cardKey].hidden = true;
    if (this.model.cards[cardKey].type === DynamicFormCardType.Single) {
      this.form.get(cardKey).disable();
    }
  }

  showCard(cardKey: string) {
    this.model.cards[cardKey].hidden = false;
    if (
      !this.model.cards[cardKey].disabled &&
      this.model.cards[cardKey].type === DynamicFormCardType.Single
    ) {
      this.form.get(cardKey).enable();
    }
  }

  disableCard(cardKey: string) {
    this.model.cards[cardKey].disabled = true;
    this.form.get(cardKey).disable();
  }

  enableCard(cardKey: string) {
    this.model.cards[cardKey].disabled = false;
    this.form.get(cardKey).enable();
  }

  hideField(cardKey: string, fieldKey: string) {
    const field = this.model.cards[cardKey].fields[fieldKey];
    field.hidden = true;
    if (field.dataType !== DynamicFormDataType.Template) {
      this.form.get(`${cardKey}.${fieldKey}`).disable();
    }
  }

  showField(cardKey: string, fieldKey: string) {
    const field = this.model.cards[cardKey].fields[fieldKey];
    field.hidden = false;
    if (!field.disabled && field.dataType !== DynamicFormDataType.Template) {
      this.form.get(`${cardKey}.${fieldKey}`).enable();
    }
  }

  disableField(cardKey: string, fieldKey: string) {
    this.model.cards[cardKey].fields[fieldKey].disabled = true;
    this.form.get(`${cardKey}.${fieldKey}`).disable();
  }

  enableField(cardKey: string, fieldKey: string) {
    this.model.cards[cardKey].fields[fieldKey].disabled = false;
    this.form.get(`${cardKey}.${fieldKey}`).enable();
  }

  getListCardValues() {
    const listCardValues = {};
    for (const cardKey in this.model.cards) {
      if (this.model.cards.hasOwnProperty(cardKey)) {
        const card = this.model.cards[cardKey];
        if (card.type === DynamicFormCardType.Multi) {
          listCardValues[cardKey] = this.getListCard(
            this.model.cards[cardKey]
          ).itemsList;
        }
      }
    }
    return listCardValues || {};
  }

  getEntityCardByCardKey(cardKey: string) {
    if (!this.model.entity) {
      return null;
    }
    if (!this.model.cards[cardKey].dataKey) {
      return this.model.entity[cardKey];
    }
    const keysArr = this.model.cards[cardKey].dataKey.split('.');
    let entityCard = this.model.entity;
    keysArr.forEach((k) => (entityCard = entityCard[k]));
    return entityCard;
  }

  getSelectList(cardKey: string, fieldKey: string) {
    return this.model.cards[cardKey].fields[fieldKey].selectFieldProps
      .selectList;
  }

  completeMethod(event, cardKey: string, fieldKey: string) {
    const selectFieldProps =
      this.model.cards[cardKey].fields[fieldKey].selectFieldProps;
    return selectFieldProps
      .getSelectList(event.query || '')
      .subscribe((res) => {
        selectFieldProps.selectList = res.entities;
      });
  }

  getObjectKeyes(obj) {
    return Object.keys(obj);
  }

  getField(cardKey: string, fieldKey: string) {
    return this.model.cards[cardKey].fields[fieldKey];
  }

  getFieldTitle(cardKey: string, fieldKey: string) {
    return this.model.cards[cardKey].fields[fieldKey].title
      ? this.model.cards[cardKey].fields[fieldKey].title
      : `${this.model.cards[cardKey].translateKey}.${fieldKey}`;
  }

  getFieldDataType(cardKey: string, fieldKey: string) {
    return this.model.cards[cardKey].fields[fieldKey].dataType;
  }

  getFieldColSize(cardKey: string, fieldKey: string) {
    if (this.model.pageType === this.pageTypes.PopUp) {
      return this.model.cards[cardKey].fields[fieldKey].colSize || 6;
    } else {
      return this.model.cards[cardKey].fields[fieldKey].colSize || 3;
    }
  }
  getFieldOffsetEnd(cardKey: string, fieldKey: string): string {
    return `calc(${this.model.cards[cardKey].fields[fieldKey].offsetEnd || 0}/12 * 100%)`;
  }
  getFieldCssClass(cardKey: string, fieldKey: string) {
    return this.model.cards[cardKey].fields[fieldKey].cssClass || '';
  }

  getSelectFieldsKey(cardKey: string, fieldKey: string) {
    return (
      this.model.cards[cardKey].fields[fieldKey].selectFieldProps.key || 'id'
    );
  }

  getSelectFieldsValue(cardKey: string, fieldKey: string) {
    return (
      this.model.cards[cardKey].fields[fieldKey].selectFieldProps.value ||
      'name'
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

  isRequired(cardKey: string, fieldKey: string): boolean {
    const validators = this.model.cards[cardKey].fields[fieldKey].validators;
    if (!validators || validators.length === 0) {
      return false;
    }
    const validator = validators.find(
      (el) => el.validator === Validators.required
    );
    return validator ? true : false;
  }

  getFieldValidators(cardKey: string, fieldKey: string) {
    return this.model.cards[cardKey].fields[fieldKey].validators;
  }

  getValidatorMessage(
    cardKey: string,
    fieldKey: string
  ): string {
    let message = null;
    const fieldValue = this.form.get(`${cardKey}.${fieldKey}`).value;
    const validators = this.getFieldValidators(cardKey, fieldKey);
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

  onCancelListCardPopUp() {
    this.dynamicFormComponent.closeModal();
    this.selectedIndexUpdate = null;
    this.visibleListCardKey = null;
  }

  onSaveListCard(event, cardKey) {
    const card = this.getListCard(this.model.cards[cardKey]);
    if (card) {
      if (card.validateBeforeSave && !card.validateBeforeSave(event, card)) {
        return;
      }
      if (this.selectedIndexUpdate !== null) {
        card.itemsList[this.selectedIndexUpdate] = { ...event };
        this.onSaveMultiCard.emit({
          cardName: cardKey,
          rowData: { ...event },
          index: this.selectedIndexUpdate,
        });
      } else {
        card.itemsList.push({ ...event });
        this.onSaveMultiCard.emit({
          cardName: cardKey,
          rowData: { ...event },
          index: card.itemsList.length - 1,
        });
      }
      this.onCancelListCardPopUp();
    }
  }

  showSpinner() {
    this.disableSaveButton = true;
    setTimeout(() => this.spinnerDirective.showSpinner(), 0);
  }

  hideSpinner() {
    this.disableSaveButton = false;
    setTimeout(() => this.spinnerDirective.hideSpinner(), 0);
  }

  closeModal() {
    this.resetForm();
    this.savedEntity = {};
    if (this.modalTemplateRef && this.modalTemplateRef.nativeElement) {
      $(this.modalTemplateRef.nativeElement).modal('hide');
    }
  }

  showModal() {
    $(this.modalTemplateRef.nativeElement).modal('show');
  }

  cancel() {
    this.closeModal();
    this.onCancel.emit(true);
  }

  resetForm() {
    this.formSubmitted = false;
    this.form.reset();
  }

  save() {
    this.formSubmitted = true;
    if (this.dimensionCardComponent) {
      this.dimensionCardComponent.submitCard();
    }
    this.onSubmit.emit(true);
    if (this.model.beforeCheckValidity) {
      this.model.beforeCheckValidity();
    }
    if (
      this.form.invalid ||
      (this.dimensionCardComponent && !this.dimensionCardComponent.isValid())
    ) {
      return;
    }
    const formValue = this.form.getRawValue();

    for (const cardKey in this.model.cards) {
      if (this.model.cards.hasOwnProperty(cardKey)) {
        const card = { ...this.model.cards[cardKey] };

        if (card.type === DynamicFormCardType.Template) {
          continue;
        }

        if (card.type === DynamicFormCardType.Multi) {
          this.savedEntity[cardKey] = [...this.getListCard(card).itemsList];
          continue;
        }

        if (card.type === DynamicFormCardType.Single) {
          const savedCard = {};
          for (const fieldKey in card.fields) {
            if (card.fields.hasOwnProperty(fieldKey)) {
              const field = card.fields[fieldKey];
              if (field.dataType === DynamicFormDataType.Template) {
                continue;
              }

              if (field.dataType === DynamicFormDataType.AutoComplete) {
                if (field.autoCompleteMode === AutoCompleteMode.Multi) {
                  if (
                    formValue[cardKey][fieldKey] &&
                    formValue[cardKey][fieldKey].length > 0
                  ) {
                    savedCard[fieldKey] = formValue[cardKey][fieldKey];
                    savedCard[fieldKey].forEach((obj) => {
                      if (obj) {
                        obj[field.selectFieldProps.selectedField.key] =
                          obj[this.getSelectFieldsKey(cardKey, fieldKey)];
                        obj[field.selectFieldProps.selectedField.value] =
                          obj[this.getSelectFieldsValue(cardKey, fieldKey)];
                      }
                    });
                  } else {
                    savedCard[fieldKey] = [];
                  }
                } else {
                  savedCard[fieldKey] = formValue[cardKey][fieldKey];
                  savedCard[field.selectFieldProps.selectedField.key] =
                    !savedCard[fieldKey]
                      ? null
                      : savedCard[fieldKey][
                      this.getSelectFieldsKey(cardKey, fieldKey)
                      ];
                  savedCard[field.selectFieldProps.selectedField.value] =
                    !savedCard[fieldKey]
                      ? null
                      : savedCard[fieldKey][
                      this.getSelectFieldsValue(cardKey, fieldKey)
                      ];
                  // savedCard = { ...savedCard, ...formValue[cardKey][fieldKey] };  // get all object properties in card-value
                }
              }

              if (field.dataType === DynamicFormDataType.DropDown) {
                savedCard[fieldKey] = formValue[cardKey][fieldKey];
                savedCard[field.selectFieldProps.selectedField.key] =
                  !savedCard[fieldKey]
                    ? null
                    : savedCard[fieldKey][
                    this.getSelectFieldsKey(cardKey, fieldKey)
                    ];
                savedCard[field.selectFieldProps.selectedField.value] =
                  !savedCard[fieldKey]
                    ? null
                    : savedCard[fieldKey][
                    this.getSelectFieldsValue(cardKey, fieldKey)
                    ];
                // savedCard = { ...savedCard, ...formValue[cardKey][fieldKey] };  // get all object properties in card-value
              } else {
                savedCard[fieldKey] =
                  field.dataType === DynamicFormDataType.Date &&
                    this.enableDateTransformFormat
                    ? this.datePipe.transform(
                      formValue[cardKey][fieldKey],
                      'MMM d, y, h:mm:ss a'
                    )
                    : formValue[cardKey][fieldKey];
              }
            }
          }

          // add all properties in source update entity with fields values changed
          let newCardValue = null;
          if (
            this.model.mode === DynamicFormMode.Update ||
            this.model.mode === DynamicFormMode.Clone
          ) {
            newCardValue = {
              ...this.getEntityCardByCardKey(cardKey),
              ...savedCard,
            };
          }

          // check if card is flatten and spread all its properties
          newCardValue = newCardValue || savedCard;
          if (this.getFormCard(card).isFlatten) {
            this.savedEntity = { ...this.savedEntity, ...newCardValue };
          } else {
            this.savedEntity[cardKey] = { ...newCardValue };
          }
        }
      }
    }

    // Get Dimensions value
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
      this.savedEntity['entityDimensions'] = entityDimensionEntry;
    }
    const invalidLineDimension: DimensionLineFieldConfigurationVM[] = [];
    for (const cardKey in this.inLineDimensionCardsInfo) {
      if (Object.prototype.hasOwnProperty.call(this.inLineDimensionCardsInfo, cardKey)) {
        const cardConfig = this.inLineDimensionCardsInfo[cardKey];
        if (cardConfig.inLineDimensions) {
          cardConfig.inLineDimensions.forEach(fieldConfig => {
            const entityLineEntry = entityDimensionEntry.lineEntries[cardConfig.entityName];
            if (entityLineEntry) {
              if (fieldConfig.required) {
                var hasValue = entityLineEntry.some(x => x.some(di => di.columnName == fieldConfig.targetColumn && (di.value != null || di.value != undefined)))
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
    this.onSave.emit(this.savedEntity);
  }
  saveBtnIsHidden() {
    if (this.hasSaveBtn === false) {
      return true;
    } else if (this.model.mode === DynamicFormMode.Create || this.model.mode === DynamicFormMode.Clone) {
      if (this.checkActionPermission && !this.checkActionPermission(PagePermissions.Create)) {
        return true;
      }
    } else if (this.model.mode === DynamicFormMode.Update) {
      if (this.checkActionPermission && !this.checkActionPermission(PagePermissions.Update)) {
        return true;
      }
    }
    return false;
  }
  /* #endregion */
}
