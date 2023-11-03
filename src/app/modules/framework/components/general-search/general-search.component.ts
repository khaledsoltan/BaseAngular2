import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AutoCompleteMode } from '../../enums/enums';
import { Column, DataListConfig, SelectionModeEnum } from '../../models/data-list/data-list';
import { DataListComponent } from '../data-list/data-list.component';
declare let $: any;

@Component({
  selector: 'app-general-search',
  templateUrl: './general-search.component.html',
  styleUrls: ['./general-search.component.scss']
})
export class GeneralSearchComponent implements OnInit, AfterViewInit, OnDestroy {

  /* #region  Fields & Props & Params */
  @Input('showModal') showModal: boolean;
  @Input('pageListTemplate') pageListTemplate: TemplateRef<any>;
  @Input('getSelectedItems') getSelectedItems: () => any[];
  @Input('getPageListComponent') getPageListComponent: () => any;   // to select selectedItems in previous selection
  @Input('dataListConfig') dataListConfig: DataListConfig;
  @Input('autoCompleteMode') autoCompleteMode: AutoCompleteMode = AutoCompleteMode.Single;
  @Input('columns') columns: Column[];
  @Input('fixedHeight') fixedHeight: boolean;
  @Input('selectedItems') set selectedItems(value: any[] | any) {
    if (value) {
      setTimeout(() => {
        if (this.pageListTemplate && this.getPageListComponent && this.getPageListComponent()) {
          const pageListComponent = this.getPageListComponent();
          pageListComponent.dataListComponent.selectedItems = value;
        } else if (this.dataListComponent && this.columns) {
          this.dataListComponent.selectedItems = value;
        }
      }, 100);
    }
  }
  @Output('onCancel') onCancel = new EventEmitter<boolean>();
  @Output('onSave') onSave = new EventEmitter<any>();
  @ViewChild('dataList', { static: false }) dataListComponent: DataListComponent;
  /* #endregion */

  /* #region Constructor */
  constructor() {

  }
  /* #endregion */

  /* #region Events */
  ngOnInit() {
    if (this.dataListConfig && this.columns && !this.pageListTemplate) {
      this.handleDataListConfig();
    }
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.closeModal();
  }
  /* #endregion */

  /* #region Methods */
  handleDataListConfig() {
    if (!this.dataListConfig.selectionMode) {
      this.dataListConfig.selectionMode = SelectionModeEnum.Single;
    }
  }

  closeModal() {
    this.onCancel.emit(true);
  }


  save() {
    if (this.dataListConfig && this.columns) {
      if (!this.dataListComponent.selectedItems) {
        this.onSave.emit(null);
      } else {
        this.onSave.emit(this.dataListComponent.selectedItems || null);
      }
    } else if (this.pageListTemplate) {
      const selectedItems = this.getSelectedItems();
      if (!selectedItems || (Array.isArray(selectedItems) && selectedItems.length === 0)) {
        this.onSave.emit(null);
        return;
      }
      if (!this.autoCompleteMode || this.autoCompleteMode === AutoCompleteMode.Single) {
        if (Array.isArray(selectedItems)) {
          this.onSave.emit(selectedItems[0] || null);
        } else {
          this.onSave.emit(selectedItems || null);
        }
      } else {
        this.onSave.emit(selectedItems || null);
      }
    }
    this.closeModal();
  }

  isHidenSaveButton() {
    return false;
    // if (this.dataListConfig && this.columns && this.dataListComponent) {
    //   if (!this.dataListComponent.selectedItems ||
    //      (isArray(this.dataListComponent.selectedItems) && this.dataListComponent.selectedItems.length < 1)
    //   ) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // }

    // if (this.pageListTemplate) {
    //   const selectedItems = this.getSelectedItems();
    //   if (!selectedItems || (isArray(selectedItems) && selectedItems.length < 1)) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // }
    // return true;
  }
  /* #endregion */

}
