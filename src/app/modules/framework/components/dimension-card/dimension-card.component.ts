import { SearchFieldVm } from './../../models/search-model/SearchModel';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  Language,
  LanguageService
} from '../../services/language-service/language.service';
import { DynamicFormCardType, DynamicFormDataType, DynamicFormMode, DynamicFormModel, DynamicFormPageType } from '../../models/dynamic-form/dynamic-form';
import { DimensionEntry, DimensionCardDetails, Dimension, ProjectSourceType, RelatedEntityDimension } from '../../models/dimesnion/dimension';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityType } from '../../models/result/EntityResult';
import { ListResult } from '../../models/result/ListResult';
import { DimensionService } from '../../services/dimension/dimension.service';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';

declare let $: any;

@Component({
  selector: "app-dimension-card",
  templateUrl: './dimension-card.component.html',
  styleUrls: ['./dimension-card.component.scss'],
})
export class DimensionCardComponent implements OnInit, OnChanges {
  /* #region  Fields & Props & Params */
  currentLang: Language;
  dynamicFormModel: DynamicFormModel;
  changeLang: Language;
  showDynamicForm: boolean;
  entityId: number | any;
  entityName: string;
  entity: any;
  cardDimensionConfigurations: Dimension[];
  cardDimensionRelatedEntities: RelatedEntityDimension[];
  hideSaveBtn = true;
  private _dimensions: Dimension[] = [];

  get dimensionCard() {
    return this.dynamicFormComponent.form.get('dimensions') as FormGroup;
  }

  @Input('disabled') disabled: boolean;
  @Input('isReportDimension') isReportDimension: boolean;
  @Input('dimensionCardDetails') set dimensionCardDetails(
    value: DimensionCardDetails
  ) {
    if (value) {
      this.entityId = value.entityId;
      this.entityName = value.entityName;
      if (this.entityName) {
        this.getCardDimensionConfigurations();
      }
    } else {
      this.entityId = null;
      this.entityName = null;
      this.onHasDimensionsHeader.emit(false);
    }
  }

  @Input('dimensions') set dimensions(value: Dimension[]) {
    if (value) {
      this.showDynamicForm = false;
      this._dimensions = value;
      setTimeout(() => this.initStaticDimensions(value), 0);
    } else {
      this._dimensions = [];
    }
  }

  @Output('onHasDimensionsHeader')
  onHasDimensionsHeader = new EventEmitter<any>();
  @Output('onHasRelatedEntitiesInHeader')
  onHasRelatedEntitiesInHeader = new EventEmitter<RelatedEntityDimension[]>();
  @Output('onHasDimensionsCheck')
  onHasDimensionsCheck = new EventEmitter<any>();
  @Output('onCancelInLineDimensions')
  onCancelInLineDimensions = new EventEmitter<any>();
  @Output('onSaveInLineDimensions')
  onSaveInLineDimensions = new EventEmitter<any>();

  @ViewChild('dynamicForm', { static: false })
  dynamicFormComponent: DynamicFormComponent;

  get reportDimensionSearchFields() {
    const entries: SearchFieldVm[] = [];
    if (this.dynamicFormComponent && this.dynamicFormComponent.form) {
      for (let i = 0; i < this._dimensions.length; i++) {
        const dimension = this._dimensions[i];
        let dimensionValue = this.dimensionCard.value[dimension.targetColumn];
        let jsonValue = null;
        if (
          dimension.dataType === DynamicFormDataType.DropDown &&
          dimensionValue
        ) {
          jsonValue = JSON.stringify(dimensionValue);
          dimensionValue =
            dimensionValue[this.getSelectFieldProps(dimension).key];
          if (dimensionValue) {
            dimensionValue = dimensionValue.toString();
          }
        }

        if (
          dimension.dataType === DynamicFormDataType.AutoComplete &&
          dimensionValue
        ) {
          jsonValue = JSON.stringify(dimensionValue);
          dimensionValue = dimensionValue[this.getSelectFieldProps(dimension).key];
          if (dimensionValue) {
            dimensionValue = dimensionValue.toString();
          }
        }

        if (dimensionValue) {
          entries.push({
            fieldName: String(dimension.dimensionId),
            value: dimensionValue,
            jsonValue: jsonValue,
            isDimension: true
          });
        }
      }
    }
    return entries;
  }
  /* #endregion */

  /* #region  Constructor */
  constructor(
    private translate: TranslateService,
    private _language: LanguageService,
    private dimensionService: DimensionService,
    private datePipe: DatePipe
  ) { }
  /* #endregion */

  /* #region  Methods */
  ngOnInit() {
    this._language.LangChanged.subscribe((value) => {
      this.changeLang = value;
      this.translate.use(this.changeLang);
    });
  }

  ngOnChanges(changes) {
    // if (changes && changes.dimensions) {
    //   this.initStaticDimensions(changes.dimensions);
    // }
  }

  initStaticDimensions(dimensions: Dimension[]) {
    if (!dimensions) {
      return;
    }
    if (dimensions.length > 0) {
      this.cardDimensionConfigurations = [...dimensions];
      this.initDynamicForm();
      this.showDynamicForm = true;
    } else if (dimensions.length == 0) {
      this.showDynamicForm = false;
    }
  }

  getCardDimensionConfigurations() {
    this.dimensionService
      .getTargetDimensionConfigurations(this.entityName, this.entityId || 0)
      .subscribe((res) => {
        if (res.success) {
          this.cardDimensionConfigurations = [...res.entity.entityDimensions];
          this.cardDimensionRelatedEntities = [
            ...res.entity.relatedEntityDimensions,
          ];
          if (
            res.entity &&
            res.entity.entityDimensions &&
            res.entity.entityDimensions.length > 0
          ) {
            this.getDimensionsEntityForUpdate();
            this.initDynamicForm();
            this.showDynamicForm = true;
            this.onHasDimensionsHeader.emit(true);
            if (
              this.cardDimensionRelatedEntities &&
              this.cardDimensionRelatedEntities.length > 0
            ) {
              this.onHasRelatedEntitiesInHeader.emit(
                this.cardDimensionRelatedEntities
              );
            }
          } else {
            this.showDynamicForm = false;
            this.onHasDimensionsHeader.emit(false);
          }
        }
      });
  }

  getDimensionsEntityForUpdate() {
    this.entity = { dimensions: {} };
    for (let i = 0; i < this.cardDimensionConfigurations.length; i++) {
      const dimension = this.cardDimensionConfigurations[i];
      const dimensionValue = dimension.value || null;
      this.entity["dimensions"][dimension.targetColumn] = dimensionValue;
      if (dimension.dataType === DynamicFormDataType.Date && dimensionValue) {
        this.entity["dimensions"][dimension.targetColumn] = new Date(
          dimensionValue
        );
      }

      if (dimension.dataType === DynamicFormDataType.Number && dimensionValue) {
        this.entity["dimensions"][dimension.targetColumn] =
          Number(dimensionValue);
      }

      if (
        dimension.dataType === DynamicFormDataType.AutoComplete &&
        dimension.objectValue
      ) {
        const fieldValue = dimension.objectValue;
        this.entity["dimensions"][`${dimension.targetColumn}Id`] =
          fieldValue['id'] ? fieldValue['id'] : fieldValue['code'] ? fieldValue['code'] :
            fieldValue[Object.keys(fieldValue)[0]];
        this.entity["dimensions"][`${dimension.targetColumn}Name`] =
          fieldValue['name'] ? fieldValue['name'] : fieldValue['code'] ? fieldValue['code'] :
            fieldValue[Object.keys(fieldValue)[1]];
      }
      if (
        dimension.dataType === DynamicFormDataType.DropDown &&
        dimensionValue
      ) {
        if (dimension.sourceType == ProjectSourceType.Finance ||
          dimension.sourceType == ProjectSourceType.Business) {
          this.entity["dimensions"][`${dimension.targetColumn}Id`] = Number(dimensionValue);
        } else {
          this.entity["dimensions"][`${dimension.targetColumn}Id`] = dimensionValue;
        }
        this.entity["dimensions"][`${dimension.targetColumn}Name`] = null;
      }
    }
  }

  initDynamicForm() {
    this.dynamicFormModel = {
      title: '',
      pageType: DynamicFormPageType.StandAlone,
      hidePageHeaderTitle: true,
      hideCancelBtn: true,
      mode: this.isReportDimension ? DynamicFormMode.Create : DynamicFormMode.Update,
      entity: this.entity,
      cards: {
        dimensions: {
          title: 'dimensionCard.title',
          type: DynamicFormCardType.Single,
          dataKey: 'dimensions',
          isFlatten: true,
          disabled: this.disabled || false,
          fields: {},
          hasFullScreenAction: false,
          hasToggleAction: false,
          hasResetAction: false,
          hideHeader: this.isReportDimension
        },
      },
    };
    this.handleDimensionFields();
  }

  handleDimensionFields() {
    for (let i = 0; i < this.cardDimensionConfigurations.length; i++) {
      const dimension = this.cardDimensionConfigurations[i];
      this.dynamicFormModel.cards['dimensions'].fields[dimension.targetColumn] =
      {
        title: dimension.name,
        dataType: dimension.dataType as DynamicFormDataType,
        validators:
          dimension.required && !this.disabled
            ? [{ validator: Validators.required }]
            : [],
        colSize: this.isReportDimension ? 12 : 3,
      };
      if (
        dimension.dataType === DynamicFormDataType.AutoComplete ||
        dimension.dataType === DynamicFormDataType.DropDown
      ) {
        this.dynamicFormModel.cards['dimensions'].fields[
          dimension.targetColumn
        ].selectFieldProps =
          this.buildSourceDimensionSelectedFieldProps(dimension);
      }
    }
  }

  buildSourceDimensionSelectedFieldProps(dimension: Dimension) {
    return {
      key:
        dimension.dataType === DynamicFormDataType.AutoComplete &&
          dimension.value
          ? Object.keys(dimension.value).includes('id')
            ? 'id' :
            Object.keys(dimension.value).includes('code') ?
              'code'
              : Object.keys(dimension.value)[0]
          : 'id',
      value:
        dimension.dataType === DynamicFormDataType.AutoComplete &&
          dimension.value
          ? Object.keys(dimension.value).includes('name')
            ? 'name'
            : Object.keys(dimension.value).includes('code')
              ? 'code'
              : Object.keys(dimension.value)[1]
          : 'name',
      getSelectList: (searchText) => this.getSelectList(dimension, searchText),
      selectedField: {
        key: `${dimension.targetColumn}Id`,
        value: `${dimension.targetColumn}Name`,
      },
    };
  }

  getSelectList(dimension: Dimension, searchText: string) {
    const selectFieldProps = this.getSelectFieldProps(dimension);
    if (dimension.sourceType === ProjectSourceType.Business) {
      if (dimension.entityType === EntityType.StronglyType) {
        return this.dimensionService
          .getBusinessDomainTypeEntries(
            {
              [selectFieldProps.value]: searchText || '',
              pageSize:
                dimension.dataType === DynamicFormDataType.AutoComplete
                  ? 20
                  : 100,
            },
            dimension.sourceEntityName
          )
          .pipe(map((res) => this.mapGetSelectList(dimension, res)));
      } else if (dimension.entityType === EntityType.Generic) {
        if (dimension.dataType === DynamicFormDataType.AutoComplete) {
          return this.dimensionService
            .getBusinessFieldEntrySelectList({
              sourceId: dimension.sourceEntityId,
              fieldValue: searchText || '',
            })
            .pipe(map((res) => this.mapGetSelectList(dimension, res)));
        } else {
          return this.dimensionService
            .getBusinessAllFieldEntrySelectList(dimension.sourceEntityId)
            .pipe(map((res) => this.mapGetSelectList(dimension, res)));
        }
      }
    } else if (dimension.sourceType === ProjectSourceType.Finance) {
      if (dimension.entityType === EntityType.StronglyType) {
        return this.dimensionService
          .getFinanceDomainTypeEntries(
            {
              [selectFieldProps.value]: searchText || '',
              pageSize:
                dimension.dataType === DynamicFormDataType.AutoComplete
                  ? 20
                  : 100,
            },
            dimension.sourceEntityName
          )
          .pipe(map((res) => this.mapGetSelectList(dimension, res)));
      } else if (dimension.entityType === EntityType.Generic) {
        if (dimension.dataType === DynamicFormDataType.AutoComplete) {
          return this.dimensionService
            .getFinanceFieldEntrySelectList({
              sourceId: dimension.sourceEntityId,
              fieldValue: searchText || '',
            })
            .pipe(map((res) => this.mapGetSelectList(dimension, res)));
        } else {
          return this.dimensionService
            .getFinanceAllFieldEntrySelectList(dimension.sourceEntityId)
            .pipe(map((res) => this.mapGetSelectList(dimension, res)));
        }
      }

    } else if (dimension.sourceType === ProjectSourceType.Individual) {
      if (dimension.entityType === EntityType.StronglyType) {
        return this.dimensionService
          .getIndividualEntityData(
            searchText || '',
            dimension.dataType === DynamicFormDataType.AutoComplete
              ? 20
              : 100,
            dimension.sourceEntityId
          )
      }
    } else if (dimension.sourceType === ProjectSourceType.HR ||
      dimension.sourceType === ProjectSourceType.Lodging ||
      dimension.sourceType === ProjectSourceType.PRL ||
      dimension.sourceType === ProjectSourceType.IR
    ) {
      if (dimension.entityType === EntityType.StronglyType) {
        return this.dimensionService
          .getManpowerEntityData(
            searchText || '',
            dimension.dataType === DynamicFormDataType.AutoComplete
              ? 20
              : 100,
            dimension.sourceEntityId
          );
      }
    }
    return of({ entities: [], success: true, message: '' });
  }

  mapGetSelectList(dimension: Dimension, res: ListResult<any>) {
    const selectFieldProps = this.getSelectFieldProps(dimension);
    if (res.success && res.entities && res.entities.length > 0) {
      const firstItem = res.entities[0];
      selectFieldProps.key = Object.keys(firstItem).includes('id')
        ? 'id'
        : Object.keys(firstItem).includes('code') ?
          'code' : Object.keys(firstItem)[0];
      selectFieldProps.value = Object.keys(firstItem).includes('name')
        ? 'name'
        : Object.keys(firstItem).includes('code')
          ? 'code'
          : Object.keys(firstItem)[1];
    }
    if (!res.success) {
      return { entities: [], success: true, message: '' };
    }
    return res;
  }

  isValid() {
    if (this.dynamicFormComponent && this.dynamicFormComponent.form) {
      return this.dynamicFormComponent.form.valid;
    }
    return true;
  }

  submitCard() {
    if (this.dynamicFormComponent && this.dynamicFormComponent.form) {
      this.dynamicFormComponent.formSubmitted = true;
    }
  }

  getValidationMessagesCard() {
    const validationMessages = {};
    if (!this.isValid()) {
      for (const fieldControlKey in this.dimensionCard.controls) {
        if (this.dimensionCard.controls.hasOwnProperty(fieldControlKey)) {
          const fieldControl = this.dimensionCard.controls[
            fieldControlKey
          ] as FormControl;
          if (fieldControl.invalid) {
            validationMessages[fieldControlKey] =
              this.dynamicFormModel.cards['dimensions'].fields[
                fieldControlKey
              ].title;
          }
        }
      }
    }
    return validationMessages || null;
  }

  setDimensionHeaderValue(
    relatedDimensions: RelatedEntityDimension[],
    relatedDimensionValues: Dimension[]
  ) {
    for (let i = 0; i < relatedDimensions.length; i++) {
      const relatedDimensionValueIndex = relatedDimensionValues.findIndex(
        (r) => r.dimensionTargetId === relatedDimensions[i].dimensionTargetId
      );
      if (relatedDimensionValueIndex === -1) {
        continue;
      }
      const dimensionEntityValue =
        relatedDimensionValues[relatedDimensionValueIndex];
      const dimensionFormField = this.dimensionCard.get(
        relatedDimensions[i].targetToColumn
      );

      const dimension = this.cardDimensionConfigurations.find(
        (d) => d.targetColumn === relatedDimensions[i].targetToColumn
      );

      if (dimensionFormField && dimensionEntityValue.value) {
        let dimensionValue = dimensionEntityValue.value || null;

        if (dimension.dataType === DynamicFormDataType.Date && dimensionValue) {
          dimensionValue = new Date(dimensionValue);
        }

        if (dimension.dataType === DynamicFormDataType.Date && dimensionValue) {
          dimensionValue = new Date(dimensionValue);
        }

        if (
          dimension.dataType === DynamicFormDataType.Number &&
          dimensionValue
        ) {
          dimensionValue = Number(dimensionValue);
        }

        if (
          dimension.dataType === DynamicFormDataType.AutoComplete &&
          dimensionValue
        ) {
          dimensionValue = dimensionEntityValue.objectValue;
          // dimensionValue = {
          //   [`id`]: fieldValue[Object.keys(fieldValue)[0]],
          //   [`name`]: fieldValue[Object.keys(fieldValue)[1]],
          // };
        }

        if (
          dimension.dataType === DynamicFormDataType.DropDown &&
          dimensionValue
        ) {
          const field =
            this.dynamicFormModel.cards['dimensions'].fields[
            relatedDimensions[i].targetToColumn
            ];
          const selectedFieldKey = field.selectFieldProps.selectedField.key;
          dimensionValue =
            field.selectFieldProps.selectList.find(
              (l) =>
                l[field.selectFieldProps.key || 'id'] === Number(dimensionValue)
            ) || null;
        }

        dimensionFormField.setValue(dimensionValue);
      }
    }
  }

  getDimensionCardValue() {
    const entries: DimensionEntry[] = [];
    if (this.dynamicFormComponent && this.dynamicFormComponent.form) {
      for (let i = 0; i < this.cardDimensionConfigurations.length; i++) {
        const dimension = this.cardDimensionConfigurations[i];
        // Get Dimension Value
        let dimensionValue = this.dimensionCard.value[dimension.targetColumn];
        let jsonValue = null;
        if (dimension.dataType === DynamicFormDataType.Date && dimensionValue) {
          dimensionValue = this.datePipe.transform(dimensionValue);
        }

        if (
          dimension.dataType === DynamicFormDataType.Number &&
          dimensionValue
        ) {
          dimensionValue = dimensionValue.toString();
        }

        if (
          dimension.dataType === DynamicFormDataType.DropDown &&
          dimensionValue
        ) {
          jsonValue = JSON.stringify(dimensionValue);
          dimensionValue =
            dimensionValue[this.getSelectFieldProps(dimension).key];
          if (dimensionValue) {
            dimensionValue = dimensionValue.toString();
          }
        }

        if (
          dimension.dataType === DynamicFormDataType.AutoComplete &&
          dimensionValue
        ) {
          jsonValue = JSON.stringify(dimensionValue);
          dimensionValue = dimensionValue[this.getSelectFieldProps(dimension).key];
          if (dimensionValue) {
            dimensionValue = dimensionValue.toString();
          }
        }

        entries.push({
          columnName: dimension.targetColumn,
          value: dimensionValue,
          jsonValue: jsonValue
        });
      }
    }
    return entries;
  }

  getSelectFieldProps(dimension: Dimension) {
    return this.dynamicFormModel.cards['dimensions'].fields[
      dimension.targetColumn
    ].selectFieldProps;
  }
  /* #endregion */
}
