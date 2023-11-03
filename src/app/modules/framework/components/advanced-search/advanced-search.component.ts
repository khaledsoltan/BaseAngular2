
import { GeneralSearchComponent } from './../general-search/general-search.component';
import {
  CalendarViews,
  SearchField,
  SearchFieldTypes,
  SearchFieldWidthEnum,
} from '../../models/advanced-search/advanced-search';
import {
  AdvancedSearchConfig,
  SearchFieldTypesEnum,
} from '../../models/advanced-search/advanced-search';
import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import {
  ActionList,
  ActionListType,
  ActionData,
} from '../../models/action/actions';
import { SearchFieldVm } from '../../models/search-model/SearchModel';
import { DatePipe } from '@angular/common';
import { ActionTypeEnum, AutoCompleteMode } from '../../enums/enums';
declare let $: any;
@Component({
  selector: "advanced-search",
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
})
export class AdvancedSearchComponent implements OnInit {
  /* #region  Fields & Properties */
  @Output('onSearch') onSearch = new EventEmitter<SearchFieldVm[]>();
  @Output('onReset') onReset = new EventEmitter<void>();
  @Input('config') config: AdvancedSearchConfig;

  searchActions: ActionList;
  searchForm: FormGroup;
  defColSize = 3;
  generalSearchAction: ActionList;
  generalSearchSelectedFieldIndex: number;
  show = false;
  get searchFields() {
    return this.searchForm.get('searchFields') as FormArray;
  }

  get autoCompleteMode() {
    return AutoCompleteMode;
  }

  get searchFieldWidthEnum() {
    return SearchFieldWidthEnum;
  }
  get CalendarViews() {
    return CalendarViews;
  }

  get notEmptySearchFields() {
    const searchFields = this.searchFields.getRawValue() as SearchFieldVm[];

    for (let index = 0; index < this.config.searchFields.length; index++) {
      const field = this.config.searchFields[index];
      if (field.type === this.searchFieldTypesEnum.AutoComplete) {
        if (searchFields[index].value) {
          if (typeof searchFields[index].value === 'string') {
            if (field.secondKey) {
              searchFields[index].fieldName = field.secondKey;
              searchFields[index].isLocalized =
                field.secondKeyIsLocalized === false ||
                  field.secondKeyIsLocalized === true
                  ? field.secondKeyIsLocalized
                  : true;
            } else {
              searchFields[index].fieldName = field.key;
              searchFields[index].isLocalized = field.isLocalized || false;
            }
          } else if (Array.isArray(searchFields[index].value) && this.config.searchFields[index].autoCompleteMode === AutoCompleteMode.Multi) {
            searchFields[index].value = searchFields[index].value ?
              searchFields[index].value.map(i => i[this.config.searchFields[index].generalSearchKey || 'id']) : [];

          } else if (searchFields[index].value[field.selectFieldProps.key]) {
            searchFields[index].value =
              searchFields[index].value[field.selectFieldProps.key];
          }
        }
      } else if (field.type === this.searchFieldTypesEnum.MultiSelect) {
        searchFields[index].value = searchFields[index].value ?
          searchFields[index].value.map(i => i[this.config.searchFields[index].generalSearchKey || 'id']) : [];

      } else if (field.type === this.searchFieldTypesEnum.Date) {
        searchFields[index].value = searchFields[index].value
          ? this.datePipe.transform(
            searchFields[index].value,
            field.pipeFormat || 'MMMM d, y'
          )
          : '';
      }
    }
    if (searchFields && searchFields.length > 0) {
      return searchFields.filter((item) => item.value !== null && item.value !== undefined && item.value !== '') || [];
    } else {
      return [];
    }
  }

  get searchFieldTypesEnum() {
    return SearchFieldTypesEnum;
  }

  get searchFieldTypes() {
    return SearchFieldTypes;
  }

  @ViewChild(GeneralSearchComponent, { static: false }) generalSearchComponent: GeneralSearchComponent;
  /* #endregion */

  /* #region  Constructor */
  constructor(private fb: FormBuilder, private datePipe: DatePipe) { }
  /* #endregion */

  /* #region  Events */
  ngOnInit() {
    this.config = this.config || ({} as any);
    this.config.searchFields = this.config.searchFields || [];
    this.config.cardTitle = this.config.cardTitle || '';
    if (
      this.config.showOperators == null ||
      this.config.showOperators === undefined
    ) {
      this.config.showOperators = true;
    }

    this.initForm();
    this.initSearchActions();
    this.initGeneralSearcAction();
  }

  initSearchActions() {
    this.searchActions = {
      type: ActionListType.title,
      list: [
        {
          type: ActionTypeEnum.toggle,
          title: 'helpers.common.toggle',
          onClick: (data: ActionData) => {
            $(data.event.srcElement)
              .closest('.search-card')
              .find('.search-card-body')
              .toggleClass('show');
            if (data.actionNativeEl) {
              $(data.actionNativeEl).find('.toggle i').toggleClass('la-angle-up');
            }
          }
        },
        {
          type: ActionTypeEnum.fullscreen,
          title: 'helpers.common.fullScreen',
          onClick: (data: ActionData) => {
            $(data.event.srcElement)
              .closest('.search-card')
              .toggleClass('full-screen');
            if (data.actionNativeEl) {

              $(data.actionNativeEl).find('.fullscreen i').toggleClass('la-compress');
            }
          }

        },
      ],
      transparent: true,
    };
  }

  initGeneralSearcAction() {
    this.generalSearchAction = {
      type: ActionListType.title,
      list: [
        {
          type: ActionTypeEnum.search,
          title: 'generalSearch.title',
          hidden: (params) => {
            return !params.field.generalSearchPageListTemplate
              && !params.field.generalSearchDataListConfig
              && !params.field.generalSearchColumns;
          },
          onClick: (data: ActionData) => {
            this.generalSearchSelectedFieldIndex = data.params['fieldIndex'];
          },
        }
      ]
    };
  }

  onResetSearchForm(event) {
    this.resetSearchFields();
    this.hideModal();
    if (this.onReset) {
      this.onReset.emit();
    }
    if (this.config.collapseAfterSearch === true) {
      $(event.srcElement)
        .find('.search-card .search-card-body')
        .toggleClass('show');
    }
  }

  OnSubmitSearchForm(event) {
    this.hideModal();
    if (this.onSearch) {
      this.onSearch.emit(this.notEmptySearchFields);
    }
    if (this.config.collapseAfterSearch === true) {
      if (event) {
        $(event.srcElement)
          .find('.search-card .search-card-body')
          .toggleClass('show');
      }
    }
  }

  onCancelGeneralSearch() {
    this.generalSearchSelectedFieldIndex = null;
  }

  onSaveGeneralSearch(data) {
    if (!data) {
      return;
    }
    const field = this.config.searchFields[this.generalSearchSelectedFieldIndex];
    // Multi Select in AutoComplete
    if (Array.isArray(data)) {
      data.forEach(rowObject => {
        rowObject[field.selectFieldProps.key || 'id'] = rowObject[field.generalSearchKey || 'id'];
        rowObject[field.selectFieldProps.value || 'name'] = rowObject[field.generalSearchValue || 'name'];
      });

      // Single Select in AutoComplete
    } else {
      data[field.selectFieldProps.key || 'id'] = data[field.generalSearchKey || 'id'];
      data[field.selectFieldProps.value || 'name'] = data[field.generalSearchValue || 'name'];
    }

    this.searchFields.at(this.generalSearchSelectedFieldIndex).get('value').setValue(data);
    this.searchFields.at(this.generalSearchSelectedFieldIndex).get('value').updateValueAndValidity();;
    this.onCancelGeneralSearch();
  }
  /* #endregion */

  /* #region  Methods */
  getGroup(fieldName) {
    for (let index = 0; index < this.searchFields.controls.length; index++) {
      const group = this.searchFields.controls[index];

      if (group.get('fieldName').value === fieldName) {
        return group;
      }
    }
    return null;
  }

  initForm() {
    this.searchForm = this.fb.group({
      searchFields: this.fb.array([]),
    });

    for (let index = 0; index < this.config.searchFields.length; index++) {
      const field = this.config.searchFields[index];
      if (field.showOperators == null || field.showOperators === undefined) {
        field.showOperators = true;
      }
      // if (!this.getGroup(field.key)) {

      this.searchFields.push(
        this.fb.group({
          fieldName: [field.key],
          value: [(field.type === SearchFieldTypesEnum.RadioButton || field.type === SearchFieldTypesEnum.Checkbox)
            && field.selected ? field.selected : ''],
          isLocalized: [field.isLocalized || false],
          operator: [field.operators && field.operators.length > 0 ? field.operators[0].code : this.searchFieldTypes[field.type].operators[0].code],
          isParam: [field.isParam],
          paramOnly: [field.paramOnly],
          paramName: [field.paramName],
          dataSources: [field.dataSources]
        }));

      // if (field.type === this.searchFieldTypesEnum.AutoComplete || field.type === this.searchFieldTypesEnum.DropDown || field.type === this.searchFieldTypesEnum.MultiSelect) {
      if (
        field.type === this.searchFieldTypesEnum.AutoComplete ||
        field.type === this.searchFieldTypesEnum.DropDown ||
        field.type === this.searchFieldTypesEnum.MultiSelect
      ) {
        if (!field.selectFieldProps) {
          throw new Error(`
          selectFieldProps can not be null or undefiened for
           AutoComplete and DropDown and MultiSelect search fields. please provide it`);
        }
        if (
          !field.selectFieldProps.selectList &&
          !field.selectFieldProps.getSelectList
        ) {
          throw new Error(`
          selectFieldProps.selectList && selectFieldProps.getSelectList can not be null
            or undefiened for AutoComplete and DropDown and MultiSelect search fields. Please provide one of them
          `);
        }

        field.selectFieldProps.key = field.selectFieldProps.key || 'id';
        field.selectFieldProps.value = field.selectFieldProps.value || 'name';

        if (
          (field.type === this.searchFieldTypesEnum.DropDown ||
            field.type === this.searchFieldTypesEnum.MultiSelect) &&
          // field.type === this.searchFieldTypesEnum.DropDown
          !field.selectFieldProps.selectList &&
          field.selectFieldProps.getSelectList
        ) {
          field.selectFieldProps.getSelectList().subscribe((result) => {
            field.selectFieldProps.selectList = result.entities || [];
          });
        }
      }
    }
  }

  completeMethod(event, field: SearchField) {
    // event.query

    if (field && field.type === this.searchFieldTypesEnum.AutoComplete) {
      if (field.selectFieldProps.apiSingleCalling === true) {
        if (
          !(field.selectFieldProps as any).allDataList ||
          (field.selectFieldProps as any).allDataList.length === 0
        ) {
          field.selectFieldProps
            .getSelectList(null, this.searchFields.value)
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
          .getSelectList(event.query, this.searchFields.value)
          .subscribe((result) => {
            field.selectFieldProps.selectList = result.entities || [];
          });
      }
    }
  }

  resetForm() {
    this.resetSearchFields();
  }

  resetSearchFields() {
    if (this.config.searchFields && this.config.searchFields.length > 0) {
      for (let index = 0; index < this.config.searchFields.length; index++) {
        const field = this.config.searchFields[index];
        if (index < this.searchFields.controls.length) {
          const group = this.searchFields.controls[index];
          if (group) {
            group.patchValue({
              isParam: field.isParam ? field.isParam : false,
              paramOnly: field.paramOnly ? field.paramOnly : false,
              paramName: field.paramName ? field.paramName : '',
              fieldName: field.key,
              value: '',
              dataSources: field.dataSources,
              isLocalized: [field.isLocalized || false],
              operator: field.operators && field.operators.length > 0 ? field.operators[0].code : this.searchFieldTypes[field.type].operators[0].code,
            });
          }
        }
      }
    }
  }
  resetSearchFieldsExcept(fieldNames: string[]) {
    if (this.config.searchFields && this.config.searchFields.length > 0) {
      for (let index = 0; index < this.config.searchFields.length; index++) {
        const field = this.config.searchFields[index];
        if (index < this.searchFields.controls.length) {
          const group = this.searchFields.controls[index];
          const fieldName = group.get('fieldName').value;
          if (fieldNames && fieldNames.length > 0 && fieldNames.find(f => f === fieldName)) {

          } else if (group) {
            group.patchValue({
              isParam: field.isParam ? field.isParam : false,
              paramOnly: field.paramOnly ? field.paramOnly : false,
              paramName: field.paramName ? field.paramName : '',
              fieldName: field.key,
              value: '',
              dataSources: field.dataSources,
              isLocalized: [field.isLocalized || false],
              operator: field.operators && field.operators.length > 0 ? field.operators[0].code : this.searchFieldTypes[field.type].operators[0].code,
            });
          }
        }
      }
    }
  }
  onSearchFieldChange(index: number) {
    const field = this.config.searchFields[index];
    if (!field) {
      return;
    }

    // Issue in checkbox values not updated manually, then should be updated like this
    if (field.type === SearchFieldTypesEnum.Checkbox) {
      this.searchFields.at(index).get('value')
        .setValue((this.searchFields.at(index) as FormControl).value.value);
      this.searchFields.at(index).get('value')
        .updateValueAndValidity();
    }

    if (field.onChange) {
      field.onChange((this.searchFields.at(index) as FormControl).value.value);
    }
  }

  isAutoCompleteModeMulti(index: number) {
    const field = this.config.searchFields[index];
    if (field && field.autoCompleteMode === AutoCompleteMode.Multi) {
      return true;
    }
    return false;
  }
  showModal() {
    this.show = true;
  }
  hideModal() {
    this.show = false;

  }
  /* #endregion */
}
